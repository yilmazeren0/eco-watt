-- Habit Check-ins tablosu - Supabase Schema
-- Bu dosyayı mevcut tablolara ek olarak çalıştırın

-- Habit check-ins tablosu
CREATE TABLE IF NOT EXISTS habit_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_type TEXT NOT NULL,
    checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_habit_checkins_user ON habit_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_date ON habit_checkins(checked_at);
CREATE INDEX IF NOT EXISTS idx_habit_checkins_type ON habit_checkins(habit_type);

-- RLS
ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own checkins" ON habit_checkins;
CREATE POLICY "Users can view own checkins" ON habit_checkins
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own checkins" ON habit_checkins;
CREATE POLICY "Users can insert own checkins" ON habit_checkins
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

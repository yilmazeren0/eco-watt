-- Yeşil Puan Sistemi - Supabase Schema
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Kullanıcı yeşil puanları tablosu
CREATE TABLE IF NOT EXISTS user_green_points (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_points INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    tree_level INTEGER DEFAULT 1, -- 1-5 arası ağaç seviyesi
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Puan kazanım geçmişi tablosu
CREATE TABLE IF NOT EXISTS green_points_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    points_earned INTEGER NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('waste_classification', 'demand_shift', 'daily_login', 'streak_bonus')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_user_green_points_user ON user_green_points(user_id);
CREATE INDEX IF NOT EXISTS idx_green_points_history_user ON green_points_history(user_id);
CREATE INDEX IF NOT EXISTS idx_green_points_history_date ON green_points_history(created_at);

-- 4. Updated_at trigger (önce sil, sonra oluştur)
DROP TRIGGER IF EXISTS update_user_green_points_updated_at ON user_green_points;
CREATE TRIGGER update_user_green_points_updated_at BEFORE UPDATE ON user_green_points
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Row Level Security (RLS) Politikaları

-- user_green_points: Kullanıcı kendi puanlarını görebilir ve güncelleyebilir
ALTER TABLE user_green_points ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own green points" ON user_green_points;
CREATE POLICY "Users can view own green points" ON user_green_points
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own green points" ON user_green_points;
CREATE POLICY "Users can insert own green points" ON user_green_points
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own green points" ON user_green_points;
CREATE POLICY "Users can update own green points" ON user_green_points
    FOR UPDATE TO authenticated 
    USING (user_id = auth.uid());

-- green_points_history: Kullanıcı kendi geçmişini görebilir
ALTER TABLE green_points_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own points history" ON green_points_history;
CREATE POLICY "Users can view own points history" ON green_points_history
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own points history" ON green_points_history;
CREATE POLICY "Users can insert own points history" ON green_points_history
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- 6. Yeni kullanıcı için otomatik green_points kaydı oluşturma
CREATE OR REPLACE FUNCTION public.handle_new_user_green_points()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_green_points (user_id, total_points, current_streak, longest_streak, tree_level)
    VALUES (NEW.id, 0, 0, 0, 1)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Yeni kullanıcı kaydında otomatik green_points oluştur
DROP TRIGGER IF EXISTS on_auth_user_created_green_points ON auth.users;
CREATE TRIGGER on_auth_user_created_green_points
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_green_points();


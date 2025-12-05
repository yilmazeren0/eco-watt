-- Akıllı Enerji Yönetimi Modülü - Supabase Schema

-- 1. Dinamik Tarife Verileri Tablosu
CREATE TABLE IF NOT EXISTS dynamic_tariffs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hour_slot TEXT NOT NULL, -- '08:00-09:00' formatında
    base_price DECIMAL(6,3) NOT NULL, -- TL/kWh
    peak_multiplier DECIMAL(4,2) DEFAULT 1.0, -- Puant fiyat çarpanı
    off_peak_discount DECIMAL(4,2) DEFAULT 0.0, -- Puant dışı indirim
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(hour_slot, effective_date)
);

-- 2. Talep Kaydırma Önerileri Tablosu
CREATE TABLE IF NOT EXISTS demand_shift_recommendations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    original_hour TEXT NOT NULL, -- Orijinal saat
    recommended_hour TEXT NOT NULL, -- Önerilen saat
    original_load_kwh DECIMAL(10,2) NOT NULL, -- Orijinal yük
    potential_savings_tl DECIMAL(10,2) NOT NULL, -- Potansiyel tasarruf
    co2_reduction_kg DECIMAL(10,2) NOT NULL, -- CO2 azaltım
    reason TEXT, -- Neden önerildi
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'implemented')),
    approved_at TIMESTAMP WITH TIME ZONE,
    implemented_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Onay Workflow Tablosu
CREATE TABLE IF NOT EXISTS approval_workflow (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recommendation_id UUID REFERENCES demand_shift_recommendations(id) ON DELETE CASCADE,
    requested_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    approved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    approval_status TEXT CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. İndeksler (Performans için)
CREATE INDEX IF NOT EXISTS idx_dynamic_tariffs_date ON dynamic_tariffs(effective_date);
CREATE INDEX IF NOT EXISTS idx_dynamic_tariffs_hour ON dynamic_tariffs(hour_slot);
CREATE INDEX IF NOT EXISTS idx_demand_shift_company ON demand_shift_recommendations(company_id);
CREATE INDEX IF NOT EXISTS idx_demand_shift_user ON demand_shift_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_demand_shift_status ON demand_shift_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_approval_workflow_recommendation ON approval_workflow(recommendation_id);

-- 5. Row Level Security (RLS) Politikaları

-- dynamic_tariffs: Herkes görebilir
ALTER TABLE dynamic_tariffs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view dynamic tariffs" ON dynamic_tariffs
    FOR SELECT TO authenticated USING (true);

-- demand_shift_recommendations: Kullanıcı kendi önerilerini görebilir
ALTER TABLE demand_shift_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own recommendations" ON demand_shift_recommendations
    FOR SELECT TO authenticated 
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own recommendations" ON demand_shift_recommendations
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- NOTE: removed an admin policy that referenced auth.users because
-- referencing auth.users in RLS expressions can cause permission errors
-- for authenticated users. If you need an admin view, add an `is_admin`
-- column to `user_profiles` and use that in the policy instead.

-- (Admin policy intentionally omitted here to avoid permission-denied errors.)

-- Güvenli Admin Yetkilendirmesi
-- Eğer `user_profiles` tablosunda `is_admin` sütunu yoksa ekleyin.
ALTER TABLE IF EXISTS user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Güvenli admin politikası: auth.users üzerinden SELECT yapmak yerine
-- `user_profiles.is_admin` alanına bakıyoruz. Böylece RLS bağlamında
-- auth.users'a doğrudan erişimden kaynaklanan permission hataları önlenir.
DROP POLICY IF EXISTS "Admins can view all recommendations" ON public.demand_shift_recommendations;
CREATE POLICY "Admins can view all recommendations" ON demand_shift_recommendations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.is_admin = TRUE
        )
    );

DROP POLICY IF EXISTS "Admins can view all workflows" ON public.approval_workflow;
CREATE POLICY "Admins can view all workflows" ON approval_workflow
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up WHERE up.id = auth.uid() AND up.is_admin = TRUE
        )
    );

-- approval_workflow: İlgili kullanıcılar görebilir
ALTER TABLE approval_workflow ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view workflow for own recommendations" ON approval_workflow
    FOR SELECT TO authenticated
    USING (
        requested_by = auth.uid() OR
        approved_by = auth.uid()
    );

-- 6. Örnek Dinamik Tarife Verileri (Test için)
INSERT INTO dynamic_tariffs (hour_slot, base_price, peak_multiplier, off_peak_discount, effective_date) VALUES
    ('00:00-01:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('01:00-02:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('02:00-03:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('03:00-04:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('04:00-05:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('05:00-06:00', 1.25, 0.5, 0.5, CURRENT_DATE),
    ('06:00-07:00', 1.50, 0.8, 0.2, CURRENT_DATE),
    ('07:00-08:00', 1.75, 1.2, 0.0, CURRENT_DATE),
    ('08:00-09:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('09:00-10:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('10:00-11:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('11:00-12:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('12:00-13:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('13:00-14:00', 1.85, 1.2, 0.0, CURRENT_DATE),
    ('14:00-15:00', 1.85, 1.2, 0.0, CURRENT_DATE),
    ('15:00-16:00', 1.85, 1.2, 0.0, CURRENT_DATE),
    ('16:00-17:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('17:00-18:00', 2.10, 1.5, 0.0, CURRENT_DATE), -- PUANT
    ('18:00-19:00', 1.90, 1.3, 0.0, CURRENT_DATE),
    ('19:00-20:00', 1.85, 1.2, 0.0, CURRENT_DATE),
    ('20:00-21:00', 1.75, 1.1, 0.0, CURRENT_DATE),
    ('21:00-22:00', 1.60, 0.9, 0.1, CURRENT_DATE),
    ('22:00-23:00', 1.45, 0.7, 0.2, CURRENT_DATE),
    ('23:00-00:00', 1.30, 0.6, 0.3, CURRENT_DATE)
ON CONFLICT DO NOTHING;

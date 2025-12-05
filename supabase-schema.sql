-- Supabase Database Schema
-- Bu dosyayı Supabase SQL Editor'da çalıştırın

-- 1. Companies tablosu
CREATE TABLE IF NOT EXISTS companies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User profiles tablosu (auth.users ile bağlantılı)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    email TEXT NOT NULL,
    company_name TEXT,
    company_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Electricity demands tablosu
CREATE TABLE IF NOT EXISTS electricity_demands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES auth.users(id),
    hour_slot TEXT NOT NULL, -- '08:00-09:00' formatında
    demand_kwh DECIMAL(10,2) NOT NULL,
    cost_tl DECIMAL(10,2) NOT NULL,
    demand_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Electricity prices tablosu
CREATE TABLE IF NOT EXISTS electricity_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    hour_range TEXT NOT NULL, -- '08:00-17:00' formatında
    unit_price_tl DECIMAL(6,3) NOT NULL, -- TL/kWh
    period_type TEXT NOT NULL CHECK (period_type IN ('peak', 'normal', 'off-peak')),
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Demand requests tablosu (CreateDemand screen için)
CREATE TABLE IF NOT EXISTS demand_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID REFERENCES companies(id),
    user_id UUID REFERENCES auth.users(id),
    company_name TEXT NOT NULL,
    company_code TEXT NOT NULL,
    hour_slot TEXT NOT NULL,
    demand_kwh DECIMAL(10,2) NOT NULL,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_electricity_demands_updated_at BEFORE UPDATE ON electricity_demands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_electricity_prices_updated_at BEFORE UPDATE ON electricity_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demand_requests_updated_at BEFORE UPDATE ON demand_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Companies tablosu için RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all companies" ON companies
    FOR SELECT TO authenticated USING (true);

-- User profiles tablosu için RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON user_profiles
    FOR ALL TO authenticated USING (auth.uid() = id);

-- Electricity demands tablosu için RLS
ALTER TABLE electricity_demands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company demands" ON electricity_demands
    FOR SELECT TO authenticated 
    USING (
        company_id IN (
            SELECT company_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own demands" ON electricity_demands
    FOR INSERT TO authenticated 
    WITH CHECK (user_id = auth.uid());

-- Electricity prices tablosu için RLS
ALTER TABLE electricity_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all prices" ON electricity_prices
    FOR SELECT TO authenticated USING (true);

-- Demand requests tablosu için RLS
ALTER TABLE demand_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own requests" ON demand_requests
    FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own requests" ON demand_requests
    FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own requests" ON demand_requests
    FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- Sample data insertion

-- Örnek şirketler
INSERT INTO companies (name, code) VALUES 
    ('Yeşil Enerji A.Ş.', 'COMP001'),
    ('Ekoloji Teknoloji Ltd.', 'COMP002'),
    ('Sürdürülebilir Çözümler A.Ş.', 'COMP003'),
    ('Enerji Verimliliği Ltd.', 'COMP004'),
    ('Çevre Dostu Teknoloji A.Ş.', 'COMP005')
ON CONFLICT (code) DO NOTHING;

-- Örnek elektrik fiyatları
INSERT INTO electricity_prices (hour_range, unit_price_tl, period_type) VALUES 
    ('00:00-06:00', 1.25, 'off-peak'),
    ('06:00-08:00', 1.65, 'normal'),
    ('08:00-17:00', 2.10, 'peak'),
    ('17:00-22:00', 1.85, 'normal'),
    ('22:00-00:00', 1.45, 'off-peak')
ON CONFLICT DO NOTHING;

-- User profile oluşturma function'ı (signup sonrası otomatik çalışacak)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    company_id_var UUID;
BEGIN
    -- Şirket koduna göre company_id bul
    SELECT id INTO company_id_var 
    FROM companies 
    WHERE code = NEW.raw_user_meta_data->>'company_code';
    
    -- Eğer şirket bulunamazsa, yeni şirket oluştur
    IF company_id_var IS NULL THEN
        INSERT INTO companies (name, code)
        VALUES (
            NEW.raw_user_meta_data->>'company_name',
            NEW.raw_user_meta_data->>'company_code'
        )
        RETURNING id INTO company_id_var;
    END IF;

    -- User profile oluştur
    INSERT INTO user_profiles (
        id, 
        company_id, 
        email, 
        company_name, 
        company_code
    )
    VALUES (
        NEW.id,
        company_id_var,
        NEW.email,
        NEW.raw_user_meta_data->>'company_name',
        NEW.raw_user_meta_data->>'company_code'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Güvenli admin yetkisi: user_profiles.is_admin sütunu ve RLS politikaları
ALTER TABLE IF EXISTS user_profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON user_profiles(is_admin);

-- Eğer demand_shift_recommendations veya approval_workflow tabloları varsa,
-- adminlerin bunları görmesi için güvenli politika ekleyin (user_profiles.is_admin bazlı)
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
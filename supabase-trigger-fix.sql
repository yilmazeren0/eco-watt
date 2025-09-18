-- Debug edilmiş ve basitleştirilmiş trigger function
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Önce eski trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Basit ve güvenli trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    company_id_var UUID;
    comp_name TEXT;
    comp_code TEXT;
BEGIN
    -- Metadata'dan değerleri güvenli şekilde al
    comp_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'Default Company');
    comp_code := COALESCE(NEW.raw_user_meta_data->>'company_code', 'DEFAULT');
    
    -- Şirket koduna göre company_id bul
    SELECT id INTO company_id_var 
    FROM companies 
    WHERE code = comp_code;
    
    -- Eğer şirket bulunamazsa, yeni şirket oluştur
    IF company_id_var IS NULL THEN
        BEGIN
            INSERT INTO companies (name, code)
            VALUES (comp_name, comp_code)
            RETURNING id INTO company_id_var;
        EXCEPTION 
            WHEN unique_violation THEN
                -- Eğer aynı anda başka bir user aynı şirketi oluşturuyorsa
                SELECT id INTO company_id_var FROM companies WHERE code = comp_code;
        END;
    END IF;

    -- User profile oluştur
    BEGIN
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
            comp_name,
            comp_code
        );
    EXCEPTION 
        WHEN OTHERS THEN
            -- Hata durumunda log'a yazdır (Supabase logs'da görünür)
            RAISE LOG 'Error creating user profile for user %: %', NEW.id, SQLERRM;
            -- Trigger'ın başarısız olmaması için hata fırlatma, sadece log'la
    END;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni trigger oluştur
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Test için basit bir check function
CREATE OR REPLACE FUNCTION check_user_profile(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    profile_exists BOOLEAN,
    company_name TEXT,
    error_message TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        (up.id IS NOT NULL) as profile_exists,
        COALESCE(up.company_name, 'No profile') as company_name,
        'OK' as error_message
    FROM auth.users u
    LEFT JOIN user_profiles up ON u.id = up.id
    WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
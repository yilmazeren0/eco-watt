-- Migration to update handle_new_user function to support Individual consumers

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    company_id_var UUID;
    company_name_val TEXT;
    company_code_val TEXT;
BEGIN
    -- Metadata'dan değerleri al
    company_name_val := NEW.raw_user_meta_data->>'company_name';
    company_code_val := NEW.raw_user_meta_data->>'company_code';

    -- Eğer company_code varsa, kurumsal kayıt işlemidir
    IF company_code_val IS NOT NULL AND company_code_val != '' THEN
        -- Şirket koduna göre company_id bul
        SELECT id INTO company_id_var 
        FROM companies 
        WHERE code = company_code_val;
        
        -- Eğer şirket bulunamazsa, yeni şirket oluştur
        IF company_id_var IS NULL THEN
            INSERT INTO companies (name, code)
            VALUES (company_name_val, company_code_val)
            RETURNING id INTO company_id_var;
        END IF;
    ELSE
        -- Bireysel kayıt ise company_id NULL kalır
        company_id_var := NULL;
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
        company_name_val, -- Bireysel ise NULL olabilir
        company_code_val  -- Bireysel ise NULL olabilir
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

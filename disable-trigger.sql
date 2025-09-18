-- Trigger'ı devre dışı bırak ve temizlik yap
-- Bu script'i Supabase SQL Editor'da çalıştırın

-- Trigger'ı kaldır
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Function'ı kaldır
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Test için var olan user profiles'ları kontrol et
SELECT 
    u.email,
    up.company_name,
    up.company_code,
    c.name as company_full_name
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
LEFT JOIN companies c ON up.company_id = c.id
ORDER BY u.created_at DESC
LIMIT 10;

-- Eğer trigger problemi devam ederse, bu script'i çalıştırın:
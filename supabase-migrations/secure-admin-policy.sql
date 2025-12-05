-- Migration: Güvenli admin yetkisi ekle (is_admin)
-- Bu dosyayı Supabase SQL Editor'da çalıştırın.

-- 1) Eski (auth.users referanslı) admin policy'leri kaldır
DROP POLICY IF EXISTS "Admins can view all recommendations" ON public.demand_shift_recommendations;
DROP POLICY IF EXISTS "Admins can view all workflows" ON public.approval_workflow;

-- 2) user_profiles tablosuna is_admin sütunu ekle (varsa atla)
ALTER TABLE IF EXISTS public.user_profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 3) index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);

-- 4) Güvenli admin politikalarını oluştur
DROP POLICY IF EXISTS "Admins can view all recommendations" ON public.demand_shift_recommendations;
CREATE POLICY "Admins can view all recommendations" ON public.demand_shift_recommendations
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.is_admin = TRUE
    )
  );

DROP POLICY IF EXISTS "Admins can view all workflows" ON public.approval_workflow;
CREATE POLICY "Admins can view all workflows" ON public.approval_workflow
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.is_admin = TRUE
    )
  );

-- 5) (Opsiyonel) Bir kullanıcıyı admin yapmak için örnek komut:
-- UPDATE public.user_profiles SET is_admin = TRUE WHERE email = 'admin@example.com';

-- Bu migration idempotenttir; tekrar çalıştırılması güvenlidir.

// Profile kontrol ve oluşturma helper function'ı
// src/utils/profileHelper.ts

import { supabase } from '../lib/supabase';

export const ensureUserProfile = async (user: any) => {
  if (!user) return null;

  // Önce profile var mı kontrol et
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existingProfile) {
    return existingProfile;
  }

  // Profile yoksa ve metadata varsa oluştur
  const companyName = user.user_metadata?.company_name;
  const companyCode = user.user_metadata?.company_code;

  if (companyName && companyCode) {
    try {
      // Şirket kontrol/oluştur
      let { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('code', companyCode)
        .single();

      if (!company) {
        const { data: newCompany } = await supabase
          .from('companies')
          .insert({
            name: companyName,
            code: companyCode,
          })
          .select('id')
          .single();
        company = newCompany;
      }

      // Profile oluştur
      if (company) {
        const { data: newProfile } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            company_id: company.id,
            email: user.email,
            company_name: companyName,
            company_code: companyCode,
          })
          .select('*')
          .single();

        return newProfile;
      }
    } catch (error) {
      console.log('Profile creation error:', error);
    }
  }

  return null;
};
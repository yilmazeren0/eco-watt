import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, companyName: string, companyCode: string) => Promise<any>;
  signOut: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, companyName: string, companyCode: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          company_name: companyName,
          company_code: companyCode,
        },
      },
    });

    // Eğer signup başarılı ise ve trigger çalışmadıysa manuel olarak profile oluştur
    if (data.user && !error) {
      try {
        // Önce şirket var mı kontrol et, yoksa oluştur
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

        // User profile oluştur
        if (company) {
          await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              company_id: company.id,
              email: email,
              company_name: companyName,
              company_code: companyCode,
            });
        }
      } catch (profileError) {
        console.log('Profile creation error (non-critical):', profileError);
        // Profile oluşturma hatası signup'ı iptal etmez
      }
    }

    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
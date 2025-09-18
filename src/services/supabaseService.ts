import { supabase } from '../lib/supabase';

export interface Company {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
}

export interface ElectricityDemand {
  id: string;
  company_id: string;
  user_id: string;
  hour_slot: string;
  demand_kwh: number;
  cost_tl: number;
  demand_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ElectricityPrice {
  id: string;
  hour_range: string;
  unit_price_tl: number;
  period_type: 'peak' | 'normal' | 'off-peak';
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface DemandRequest {
  id: string;
  company_id: string;
  user_id: string;
  company_name: string;
  company_code: string;
  hour_slot: string;
  demand_kwh: number;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  company_id: string;
  email: string;
  company_name: string;
  company_code: string;
  created_at: string;
  updated_at: string;
}

// Company Services
export const companyService = {
  async getAllCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getCompanyByCode(code: string): Promise<Company | null> {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .eq('code', code)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },
};

// Electricity Price Services
export const electricityPriceService = {
  async getAllPrices(): Promise<ElectricityPrice[]> {
    const { data, error } = await supabase
      .from('electricity_prices')
      .select('*')
      .order('hour_range');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getCurrentPrices(): Promise<ElectricityPrice[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('electricity_prices')
      .select('*')
      .eq('effective_date', today)
      .order('hour_range');

    if (error) {
      throw error;
    }

    return data || [];
  },
};

// Electricity Demand Services
export const electricityDemandService = {
  async getUserCompanyDemands(userId: string): Promise<ElectricityDemand[]> {
    const { data, error } = await supabase
      .from('electricity_demands')
      .select('*')
      .eq('user_id', userId)
      .order('hour_slot');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async createDemand(demand: Omit<ElectricityDemand, 'id' | 'created_at' | 'updated_at'>): Promise<ElectricityDemand> {
    const { data, error } = await supabase
      .from('electricity_demands')
      .insert(demand)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getTodayDemands(): Promise<ElectricityDemand[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('electricity_demands')
      .select('*')
      .eq('demand_date', today)
      .order('hour_slot');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getUserTodayDemands(userId: string): Promise<ElectricityDemand[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('electricity_demands')
      .select('*')
      .eq('user_id', userId)
      .eq('demand_date', today)
      .order('hour_slot');

    if (error) {
      throw error;
    }

    return data || [];
  },
};

// Demand Request Services
export const demandRequestService = {
  async createDemandRequest(request: Omit<DemandRequest, 'id' | 'created_at' | 'updated_at'>): Promise<DemandRequest> {
    const { data, error } = await supabase
      .from('demand_requests')
      .insert(request)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getUserDemandRequests(userId: string): Promise<DemandRequest[]> {
    const { data, error } = await supabase
      .from('demand_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getAllDemandRequests(): Promise<DemandRequest[]> {
    const { data, error } = await supabase
      .from('demand_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  async updateDemandRequestStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<DemandRequest> {
    const { data, error } = await supabase
      .from('demand_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};

// User Profile Services
export const userProfileService = {
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },
};
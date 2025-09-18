export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Dashboard: undefined;
  CreateDemand: undefined;
  AllCompanies: undefined;
};

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

export interface Company {
  id: string;
  name: string;
  code: string;
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

export interface CompanyData {
  companyName: string;
  companyCode: string;
  electricityDemands: ElectricityDemand[];
  electricityPrices: ElectricityPrice[];
}

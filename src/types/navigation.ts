export type RootStackParamList = {
  Login: undefined;
  Dashboard: {
    companyName: string;
    companyCode: string;
  };
};

export interface ElectricityDemand {
  hour: string;
  demand: number; // kWh
  cost: number; // TL
}

export interface ElectricityPrice {
  hour: string;
  unitPrice: number; // TL/kWh
  period: 'peak' | 'off-peak' | 'normal';
}

export interface DemandRequest {
  id: string;
  companyCode: string;
  companyName: string;
  hour: string;
  demandKWh: number;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

export interface Company {
  code: string;
  name: string;
  totalDemand: number;
  activeDemands: DemandRequest[];
}

export interface CompanyData {
  companyName: string;
  companyCode: string;
  electricityDemands: ElectricityDemand[];
  electricityPrices: ElectricityPrice[];
}

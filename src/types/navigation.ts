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

export interface CompanyData {
  companyName: string;
  companyCode: string;
  electricityDemands: ElectricityDemand[];
  electricityPrices: ElectricityPrice[];
}

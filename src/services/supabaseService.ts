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

// ============================================
// AKILLI ENERJİ YÖNETİMİ SERVİSLERİ
// ============================================

export interface DynamicTariff {
  id: string;
  hour_slot: string;
  base_price: number;
  peak_multiplier: number;
  off_peak_discount: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface DemandShiftRecommendation {
  id: string;
  company_id: string;
  user_id: string;
  original_hour: string;
  recommended_hour: string;
  original_load_kwh: number;
  potential_savings_tl: number;
  co2_reduction_kg: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  approved_at?: string;
  implemented_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ApprovalWorkflow {
  id: string;
  recommendation_id: string;
  requested_by: string;
  approved_by?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Dinamik Tarife Servisleri
export const dynamicTariffeService = {
  async getTodayTariffs(): Promise<DynamicTariff[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('dynamic_tariffs')
      .select('*')
      .eq('effective_date', today)
      .order('hour_slot');

    if (error) {
      throw error;
    }

    return data || [];
  },

  async getAllTariffs(): Promise<DynamicTariff[]> {
    const { data, error } = await supabase
      .from('dynamic_tariffs')
      .select('*')
      .order('hour_slot');

    if (error) {
      throw error;
    }

    return data || [];
  },
};

// Talep Kaydırma Servisleri
export const demandShiftService = {
  // Ana algoritma: Talep kaydırma önerisi üret
  async generateDemandShiftRecommendations(
    userId: string,
    companyId: string
  ): Promise<DemandShiftRecommendation[]> {
    try {
      // 1. Kullanıcının TÜM taleplerini al (sadece bugün değil)
      let demands = await electricityDemandService.getUserCompanyDemands(userId);
      // Fetch dynamic tariffs and electricity prices. We'll use electricity_prices
      // to compute actual costs (keeps calculations consistent with Dashboard),
      // and use dynamic tariffs only if needed for alternative pricing rules.
      const tariffs = await dynamicTariffeService.getTodayTariffs();
      const prices = await electricityPriceService.getCurrentPrices();

      // Eğer fiyat tablosu yoksa öneri üretilemez
      if (!prices || prices.length === 0) return [];

      // Eğer electricity_demands tablosunda talep yoksa, demand_requests tablosundan al ve maple
      if (!demands || demands.length === 0) {
        const reqs = await demandRequestService.getUserDemandRequests(userId);
        if (reqs && reqs.length > 0) {
          // Map demand_request -> ElectricityDemand-like object
          demands = reqs.map(r => ({
            id: r.id,
            company_id: r.company_id,
            user_id: r.user_id,
            hour_slot: r.hour_slot,
            demand_kwh: r.demand_kwh,
            cost_tl: 0,
            demand_date: r.request_date,
            status: r.status,
            notes: r.notes,
            created_at: r.created_at,
            updated_at: r.updated_at,
          } as ElectricityDemand));
        }
      }

      if (!demands || demands.length === 0) {
        return [];
      }

      const recommendations: Omit<DemandShiftRecommendation, 'id' | 'created_at' | 'updated_at'>[] = [];

      for (const demand of demands) {
        // 2. Her talep için güncel elektrik fiyat tablosundan ilgili saatlerin birim fiyatlarını bul
        const findPriceForSlot = (hourSlot: string) => {
          try {
            const slotStart = hourSlot.split('-')[0].trim(); // e.g. '08:00'
            const slotHour = parseInt(slotStart.split(':')[0], 10);

            for (const p of prices) {
              const range = p.hour_range.split('-');
              const start = parseInt(range[0].split(':')[0], 10);
              const end = parseInt(range[1].split(':')[0], 10);

              if (start <= end) {
                if (slotHour >= start && slotHour < end) {
                  return Number(p.unit_price_tl || 0);
                }
              } else {
                if (slotHour >= start || slotHour < end) {
                  return Number(p.unit_price_tl || 0);
                }
              }
            }

            // fallback: return first price
            return prices.length > 0 ? Number(prices[0].unit_price_tl || 0) : 0;
          } catch (e) {
            return 0;
          }
        };

        const currentUnitPrice = findPriceForSlot(demand.hour_slot);

        // En ucuz birim fiyatı bul (tavsiye edilen saat)
        const cheapestPriceEntry = prices.reduce((prev, cur) => {
          return Number(cur.unit_price_tl) < Number(prev.unit_price_tl) ? cur : prev;
        }, prices[0]);

        const recommendedUnitPrice = Number(cheapestPriceEntry.unit_price_tl || 0);

        // 3. Tasarruf hesapla (electricity_prices üzerinden)
        const currentCost = Number(demand.demand_kwh) * currentUnitPrice;
        const recommendedCost = Number(demand.demand_kwh) * recommendedUnitPrice;
        const savings = currentCost - recommendedCost;

        // 4. CO2 azaltım hesapla (geçici: sabit katsayı 0.5 kg CO2/kWh kullanılıyor)
        // Bu aslında "CO2 etkisi" tahmini; gerçek azaltım için saat başına emisyon verisi gerekir.
        const co2Reduction = Number(demand.demand_kwh) * 0.5;

        // 5. Tasarruf 1 TL'den fazlaysa öneri oluştur
        if (savings > 1 && cheapestPriceEntry && cheapestPriceEntry.hour_range !== demand.hour_slot) {
          recommendations.push({
            company_id: companyId,
            user_id: userId,
            original_hour: demand.hour_slot,
            recommended_hour: cheapestPriceEntry.hour_range,
            original_load_kwh: demand.demand_kwh,
            potential_savings_tl: Math.round(savings * 100) / 100,
            co2_reduction_kg: Math.round(co2Reduction * 100) / 100,
            reason: `${demand.hour_slot} saatinde ${demand.demand_kwh} kWh'yi ${cheapestPriceEntry.hour_range} saatine kaydır. ${Math.round(savings * 100) / 100}₺ tasarruf et!`,
            status: 'pending',
          });
        }
      }

      return recommendations as DemandShiftRecommendation[];
    } catch (error) {
      console.error('Öneriler oluşturulurken hata:', error);
      throw error;
    }
  },

  // Önerileri veritabanına kaydet
  async saveDemandShiftRecommendations(
    recommendations: Omit<DemandShiftRecommendation, 'id' | 'created_at' | 'updated_at'>[]
  ): Promise<DemandShiftRecommendation[]> {
    if (recommendations.length === 0) {
      return [];
    }

    try {
      // Avoid inserting duplicate recommendations: fetch existing recent recommendations
      // for the involved users and compare by key fields (company_id, original_hour, recommended_hour, original_load_kwh).
      const userIds = Array.from(new Set(recommendations.map((r) => r.user_id)));
      const today = new Date().toISOString().split('T')[0];

      // ensure recommendation_date is present on each recommendation (used by DB unique index)
      const recsWithDate = recommendations.map((r) => ({ ...r, recommendation_date: today }));

      const { data: existingData, error: fetchError } = await supabase
        .from('demand_shift_recommendations')
        .select('*')
        .in('user_id', userIds)
        .gte('created_at', today);

      if (fetchError) {
        // If we can't read existing recommendations, fall back to trying to insert (let RLS/policies handle failures)
        const { data, error } = await supabase
          .from('demand_shift_recommendations')
          .insert(recommendations)
          .select();

        if (error) throw error;
        return data || [];
      }

      const existing = existingData || [];

      const isDuplicate = (rec: Omit<DemandShiftRecommendation, 'id' | 'created_at' | 'updated_at'>) => {
        return existing.some((e: any) =>
          e.company_id === rec.company_id &&
          e.user_id === rec.user_id &&
          e.original_hour === rec.original_hour &&
          e.recommended_hour === rec.recommended_hour &&
          Math.abs(Number(e.original_load_kwh) - Number(rec.original_load_kwh)) < 0.01
        );
      };

      const toInsert = recsWithDate.filter((r) => !isDuplicate(r));

      if (toInsert.length === 0) {
        return [];
      }

      try {
        const { data, error: insertError } = await supabase
          .from('demand_shift_recommendations')
          .insert(toInsert)
          .select();

        if (insertError) {
          // If unique violation happens due to race, ignore and return current recommendations
          // Postgres unique violation code is '23505'
          if ((insertError as any)?.code === '23505') {
            return [];
          }
          throw insertError;
        }

        return data || [];
      } catch (ie) {
        // If insert failed due to unique constraint race condition, ignore
        if ((ie as any)?.code === '23505') {
          return [];
        }
        throw ie;
      }
    } catch (err) {
      throw err;
    }
  },

  // Önerileri getir
  async getUserRecommendations(userId: string): Promise<DemandShiftRecommendation[]> {
    const { data, error } = await supabase
      .from('demand_shift_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Bugünün önerilerini getir
  async getTodayRecommendations(userId: string): Promise<DemandShiftRecommendation[]> {
    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('demand_shift_recommendations')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Şirketin tüm önerilerini getir (admin)
  async getCompanyRecommendations(companyId: string): Promise<DemandShiftRecommendation[]> {
    const { data, error } = await supabase
      .from('demand_shift_recommendations')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },

  // Öneriye onay ver/reddet
  async approveRecommendation(
    recommendationId: string,
    approved: boolean,
    notes?: string
  ): Promise<DemandShiftRecommendation> {
    const { data, error } = await supabase
      .from('demand_shift_recommendations')
      .update({
        status: approved ? 'approved' : 'rejected',
        approved_at: new Date().toISOString(),
      })
      .eq('id', recommendationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Workflow'a da kaydet
    if (data) {
      await approvalWorkflowService.createWorkflow(
        recommendationId,
        data.user_id,
        approved ? 'approved' : 'rejected',
        notes
      );
    }

    return data;
  },

  // İstatistikler
  async getRecommendationStats(companyId: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalSavings: number;
    totalCO2Reduction: number;
  }> {
    const { data, error } = await supabase
      .from('demand_shift_recommendations')
      .select('*')
      .eq('company_id', companyId);

    if (error) {
      throw error;
    }

    const recommendations = data || [];

    return {
      total: recommendations.length,
      pending: recommendations.filter(r => r.status === 'pending').length,
      approved: recommendations.filter(r => r.status === 'approved').length,
      rejected: recommendations.filter(r => r.status === 'rejected').length,
      totalSavings: recommendations.reduce((sum, r) => sum + (r.potential_savings_tl || 0), 0),
      totalCO2Reduction: recommendations.reduce((sum, r) => sum + (r.co2_reduction_kg || 0), 0),
    };
  },
};

// Onay Workflow Servisleri
export const approvalWorkflowService = {
  async createWorkflow(
    recommendationId: string,
    requestedBy: string,
    status: 'pending' | 'approved' | 'rejected',
    notes?: string
  ): Promise<ApprovalWorkflow> {
    const { data, error } = await supabase
      .from('approval_workflow')
      .insert({
        recommendation_id: recommendationId,
        requested_by: requestedBy,
        approval_status: status,
        notes,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  async getWorkflowHistory(recommendationId: string): Promise<ApprovalWorkflow[]> {
    const { data, error } = await supabase
      .from('approval_workflow')
      .select('*')
      .eq('recommendation_id', recommendationId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  },
};

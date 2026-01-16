import { supabase } from '../lib/supabase';
import { greenPointsService } from './greenPointsService';

// Karbon ayak izi kategorileri ve katsayıları (kg CO2/birim)
export const CARBON_FACTORS = {
    // Ulaşım (kg CO2 / km)
    transport: {
        car_petrol: 0.21,      // Benzinli araç
        car_diesel: 0.17,      // Dizel araç
        car_electric: 0.05,    // Elektrikli araç
        motorcycle: 0.10,      // Motosiklet
        bus: 0.089,            // Otobüs
        metro: 0.033,          // Metro
        train: 0.041,          // Tren
        plane_domestic: 0.255, // Yurtiçi uçuş
        plane_intl: 0.195,     // Uluslararası uçuş
        bicycle: 0,            // Bisiklet
        walking: 0,            // Yürüyüş
    },
    // Enerji (kg CO2 / kWh - Türkiye elektrik şebekesi ortalaması)
    energy: {
        electricity: 0.47,     // Elektrik
        natural_gas: 0.20,     // Doğalgaz (kg CO2 / kWh)
        lpg: 0.23,             // LPG
    },
    // Yemek (kg CO2 / porsiyon)
    food: {
        beef: 6.0,             // Kırmızı et
        chicken: 1.8,          // Tavuk
        fish: 1.3,             // Balık
        vegetarian: 0.4,       // Vejetaryen
        vegan: 0.3,            // Vegan
    },
    // Atık (kg CO2 / kg atık)
    waste: {
        general: 0.5,          // Genel atık
        recycled: 0.1,         // Geri dönüştürülmüş
        composted: 0.02,       // Kompost
    },
};

// Türkiye ortalamaları (yıllık kg CO2)
export const TURKEY_AVERAGES = {
    individual: 4800,        // Kişi başı yıllık
    household: 12000,        // Hane başı yıllık
    corporate_per_employee: 8500, // Çalışan başı yıllık (ofis)
};

// Karbon hesaplama girdileri
export interface CarbonInput {
    // Ulaşım (haftalık km)
    car_km: number;
    car_type: 'petrol' | 'diesel' | 'electric' | 'hybrid';
    public_transport_km: number;
    flight_hours_yearly: number;

    // Enerji (aylık)
    electricity_kwh: number;
    natural_gas_m3: number;

    // Yemek (haftalık porsiyon)
    meat_portions: number;
    vegetarian_portions: number;

    // Atık (haftalık kg)
    waste_kg: number;
    recycle_percent: number;
}

// Kurumsal karbon girdileri
export interface CorporateCarbonInput {
    employee_count: number;
    office_sqm: number;
    electricity_kwh_monthly: number;
    gas_m3_monthly: number;
    company_vehicles_km_monthly: number;
    business_flights_yearly: number;
    waste_kg_monthly: number;
    recycle_percent: number;
}

// Karbon sonuçları
export interface CarbonResult {
    total_kg_yearly: number;
    breakdown: {
        transport: number;
        energy: number;
        food: number;
        waste: number;
    };
    comparison_to_average: number; // yüzde fark
    rating: 'excellent' | 'good' | 'average' | 'poor';
    tips: string[];
}

export const carbonFootprintService = {
    // Bireysel karbon ayak izi hesapla
    calculateIndividual(input: CarbonInput): CarbonResult {
        // Ulaşım (yıllık)
        let carFactor = CARBON_FACTORS.transport.car_petrol;
        if (input.car_type === 'diesel') carFactor = CARBON_FACTORS.transport.car_diesel;
        if (input.car_type === 'electric') carFactor = CARBON_FACTORS.transport.car_electric;
        if (input.car_type === 'hybrid') carFactor = CARBON_FACTORS.transport.car_petrol * 0.7;

        const transport = (
            (input.car_km * 52 * carFactor) +
            (input.public_transport_km * 52 * CARBON_FACTORS.transport.bus) +
            (input.flight_hours_yearly * 800 * CARBON_FACTORS.transport.plane_domestic) // ~800km/saat
        );

        // Enerji (yıllık)
        const energy = (
            (input.electricity_kwh * 12 * CARBON_FACTORS.energy.electricity) +
            (input.natural_gas_m3 * 12 * 10.5 * CARBON_FACTORS.energy.natural_gas) // 1m3 ≈ 10.5 kWh
        );

        // Yemek (yıllık)
        const food = (
            (input.meat_portions * 52 * CARBON_FACTORS.food.beef) +
            (input.vegetarian_portions * 52 * CARBON_FACTORS.food.vegetarian)
        );

        // Atık (yıllık)
        const recycledWaste = input.waste_kg * (input.recycle_percent / 100);
        const generalWaste = input.waste_kg - recycledWaste;
        const waste = (
            (generalWaste * 52 * CARBON_FACTORS.waste.general) +
            (recycledWaste * 52 * CARBON_FACTORS.waste.recycled)
        );

        const total = transport + energy + food + waste;
        const comparison = ((total - TURKEY_AVERAGES.individual) / TURKEY_AVERAGES.individual) * 100;

        let rating: CarbonResult['rating'] = 'average';
        if (comparison <= -30) rating = 'excellent';
        else if (comparison <= -10) rating = 'good';
        else if (comparison >= 30) rating = 'poor';

        const tips = this.generateTips(input, { transport, energy, food, waste });

        return {
            total_kg_yearly: Math.round(total),
            breakdown: {
                transport: Math.round(transport),
                energy: Math.round(energy),
                food: Math.round(food),
                waste: Math.round(waste),
            },
            comparison_to_average: Math.round(comparison),
            rating,
            tips,
        };
    },

    // Kurumsal karbon ayak izi hesapla
    calculateCorporate(input: CorporateCarbonInput): CarbonResult {
        // Enerji (yıllık)
        const energy = (
            (input.electricity_kwh_monthly * 12 * CARBON_FACTORS.energy.electricity) +
            (input.gas_m3_monthly * 12 * 10.5 * CARBON_FACTORS.energy.natural_gas)
        );

        // Ulaşım (yıllık)
        const transport = (
            (input.company_vehicles_km_monthly * 12 * CARBON_FACTORS.transport.car_petrol) +
            (input.business_flights_yearly * 800 * CARBON_FACTORS.transport.plane_intl)
        );

        // Atık (yıllık)
        const recycledWaste = input.waste_kg_monthly * (input.recycle_percent / 100);
        const generalWaste = input.waste_kg_monthly - recycledWaste;
        const waste = (
            (generalWaste * 12 * CARBON_FACTORS.waste.general) +
            (recycledWaste * 12 * CARBON_FACTORS.waste.recycled)
        );

        const total = transport + energy + waste;
        const perEmployee = total / input.employee_count;
        const comparison = ((perEmployee - TURKEY_AVERAGES.corporate_per_employee) / TURKEY_AVERAGES.corporate_per_employee) * 100;

        let rating: CarbonResult['rating'] = 'average';
        if (comparison <= -30) rating = 'excellent';
        else if (comparison <= -10) rating = 'good';
        else if (comparison >= 30) rating = 'poor';

        const tips = [
            'LED aydınlatmaya geçin',
            'Uzaktan çalışma günleri ekleyin',
            'Video konferans ile iş seyahatlerini azaltın',
            'Geri dönüşüm programı başlatın',
            'Yenilenebilir enerji sözleşmesi yapın',
        ];

        return {
            total_kg_yearly: Math.round(total),
            breakdown: {
                transport: Math.round(transport),
                energy: Math.round(energy),
                food: 0,
                waste: Math.round(waste),
            },
            comparison_to_average: Math.round(comparison),
            rating,
            tips,
        };
    },

    // Kişiselleştirilmiş ipuçları oluştur
    generateTips(input: CarbonInput, breakdown: { transport: number; energy: number; food: number; waste: number }): string[] {
        const tips: string[] = [];
        const total = breakdown.transport + breakdown.energy + breakdown.food + breakdown.waste;

        // En büyük kaynağa göre öneri
        if (breakdown.transport / total > 0.4) {
            tips.push('Toplu taşıma veya bisiklet kullanarak ulaşım emisyonlarınızı %50 azaltabilirsiniz');
        }
        if (breakdown.energy / total > 0.3) {
            tips.push('LED ampuller ve enerji verimli cihazlar ile elektrik tüketiminizi düşürün');
        }
        if (breakdown.food / total > 0.25) {
            tips.push('Haftada 2 gün etsiz beslenme ile yemek emisyonlarınızı %30 azaltın');
        }
        if (input.recycle_percent < 50) {
            tips.push('Geri dönüşüm oranınızı artırarak atık emisyonlarınızı yarıya indirin');
        }
        if (input.car_type === 'petrol' || input.car_type === 'diesel') {
            tips.push('Elektrikli veya hibrit araca geçiş düşünün');
        }

        // Varsayılan ipuçları ekle
        if (tips.length < 3) {
            tips.push('Yerel ve mevsiminde ürünler tercih edin');
            tips.push('Su tüketiminizi azaltın');
        }

        return tips.slice(0, 4);
    },

    // Karbon kaydı kaydet ve puan ver
    async saveAndReward(userId: string, result: CarbonResult, isIndividual: boolean): Promise<void> {
        try {
            // Karbon kaydını veritabanına kaydet
            const { error } = await supabase
                .from('carbon_footprint_logs')
                .insert({
                    user_id: userId,
                    total_kg_yearly: result.total_kg_yearly,
                    transport_kg: result.breakdown.transport,
                    energy_kg: result.breakdown.energy,
                    food_kg: result.breakdown.food,
                    waste_kg: result.breakdown.waste,
                    rating: result.rating,
                    is_corporate: !isIndividual,
                });

            if (error) {
                console.log('Carbon log save error (table may not exist):', error);
            }

            // İyi rating için puan ver
            if (result.rating === 'excellent' || result.rating === 'good') {
                const points = result.rating === 'excellent' ? 20 : 10;
                await greenPointsService.addPoints(
                    userId,
                    points,
                    'daily_login', // action_type
                    `Düşük karbon ayak izi başarısı! 🌍 (+${points} puan)`
                );
            }
        } catch (e) {
            console.log('Save and reward error:', e);
        }
    },

    // Rating rengi
    getRatingColor(rating: CarbonResult['rating']): string {
        switch (rating) {
            case 'excellent': return '#4CAF50';
            case 'good': return '#8BC34A';
            case 'average': return '#FFC107';
            case 'poor': return '#F44336';
        }
    },

    // Rating emoji
    getRatingEmoji(rating: CarbonResult['rating']): string {
        switch (rating) {
            case 'excellent': return '🌟';
            case 'good': return '👍';
            case 'average': return '😐';
            case 'poor': return '⚠️';
        }
    },

    // Rating text
    getRatingText(rating: CarbonResult['rating']): string {
        switch (rating) {
            case 'excellent': return 'Mükemmel';
            case 'good': return 'İyi';
            case 'average': return 'Ortalama';
            case 'poor': return 'Yüksek';
        }
    },
};

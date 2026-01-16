import { supabase } from '../lib/supabase';

// Types
export interface UserGreenPoints {
    id: string;
    user_id: string;
    total_points: number;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string | null;
    tree_level: number;
    created_at: string;
    updated_at: string;
}

export interface PointsHistoryItem {
    id: string;
    user_id: string;
    points_earned: number;
    action_type: 'waste_classification' | 'demand_shift' | 'daily_login' | 'streak_bonus';
    description: string | null;
    created_at: string;
}

// Puan değerleri
export const POINTS_VALUES = {
    WASTE_CLASSIFICATION: 10,
    DEMAND_SHIFT_APPROVED: 25,
    DAILY_LOGIN: 5,
    STREAK_BONUS_7_DAYS: 50,
    STREAK_BONUS_30_DAYS: 200,
};

// Ağaç seviyeleri
export const TREE_LEVELS = {
    1: { name: 'Tohum', minPoints: 0, emoji: '🌱' },
    2: { name: 'Fide', minPoints: 100, emoji: '🌿' },
    3: { name: 'Küçük Ağaç', minPoints: 500, emoji: '🌳' },
    4: { name: 'Orta Ağaç', minPoints: 1000, emoji: '🌲' },
    5: { name: 'Büyük Ağaç', minPoints: 2500, emoji: '🌴' },
};

// Ağaç seviyesi hesapla
export const calculateTreeLevel = (totalPoints: number): number => {
    if (totalPoints >= 2500) return 5;
    if (totalPoints >= 1000) return 4;
    if (totalPoints >= 500) return 3;
    if (totalPoints >= 100) return 2;
    return 1;
};

// Sonraki seviyeye kalan puan
export const getPointsToNextLevel = (totalPoints: number): { current: number; next: number; remaining: number } => {
    const level = calculateTreeLevel(totalPoints);
    if (level >= 5) {
        return { current: totalPoints, next: totalPoints, remaining: 0 };
    }
    const thresholds = [0, 100, 500, 1000, 2500];
    const nextThreshold = thresholds[level];
    return {
        current: totalPoints,
        next: nextThreshold,
        remaining: nextThreshold - totalPoints,
    };
};

// Green Points Service
export const greenPointsService = {
    // Kullanıcının yeşil puanlarını getir
    async getUserPoints(userId: string): Promise<UserGreenPoints | null> {
        const { data, error } = await supabase
            .from('user_green_points')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user green points:', error);
            throw error;
        }

        return data;
    },

    // Kullanıcı için yeşil puan kaydı oluştur (yoksa)
    async ensureUserPointsExist(userId: string): Promise<UserGreenPoints> {
        let points = await this.getUserPoints(userId);

        if (!points) {
            const { data, error } = await supabase
                .from('user_green_points')
                .insert({
                    user_id: userId,
                    total_points: 0,
                    current_streak: 0,
                    longest_streak: 0,
                    tree_level: 1,
                })
                .select()
                .single();

            if (error) {
                console.error('Error creating user green points:', error);
                throw error;
            }
            points = data;
        }

        return points!;
    },

    // Puan ekle
    async addPoints(
        userId: string,
        points: number,
        actionType: 'waste_classification' | 'demand_shift' | 'daily_login' | 'streak_bonus',
        description: string
    ): Promise<UserGreenPoints> {
        // Önce mevcut puanları al
        const currentPoints = await this.ensureUserPointsExist(userId);
        const newTotalPoints = currentPoints.total_points + points;
        const newTreeLevel = calculateTreeLevel(newTotalPoints);

        // Puanları güncelle
        const { data: updatedPoints, error: updateError } = await supabase
            .from('user_green_points')
            .update({
                total_points: newTotalPoints,
                tree_level: newTreeLevel,
                last_activity_date: new Date().toISOString().split('T')[0],
            })
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating user green points:', updateError);
            throw updateError;
        }

        // Geçmişe kaydet
        const { error: historyError } = await supabase
            .from('green_points_history')
            .insert({
                user_id: userId,
                points_earned: points,
                action_type: actionType,
                description,
            });

        if (historyError) {
            console.error('Error adding points history:', historyError);
            // Geçmiş kaydı başarısız olsa bile puan eklendi, hata fırlatma
        }

        return updatedPoints;
    },

    // Streak güncelle
    async updateStreak(userId: string): Promise<number> {
        const points = await this.ensureUserPointsExist(userId);
        const today = new Date().toISOString().split('T')[0];
        const lastActivity = points.last_activity_date;

        let newStreak = points.current_streak;
        let bonusAwarded = false;

        if (!lastActivity) {
            // İlk aktivite
            newStreak = 1;
        } else {
            const lastDate = new Date(lastActivity);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Ardışık gün - streak devam
                newStreak = points.current_streak + 1;
            } else if (diffDays === 0) {
                // Aynı gün - streak değişmez
                newStreak = points.current_streak;
            } else {
                // Streak kırıldı
                newStreak = 1;
            }
        }

        const newLongestStreak = Math.max(newStreak, points.longest_streak);

        // Streak güncelle
        const { error } = await supabase
            .from('user_green_points')
            .update({
                current_streak: newStreak,
                longest_streak: newLongestStreak,
                last_activity_date: today,
            })
            .eq('user_id', userId);

        if (error) {
            console.error('Error updating streak:', error);
            throw error;
        }

        // 7 günlük streak bonusu
        if (newStreak === 7 && points.current_streak < 7) {
            await this.addPoints(userId, POINTS_VALUES.STREAK_BONUS_7_DAYS, 'streak_bonus', '7 günlük streak bonusu! 🎉');
        }

        // 30 günlük streak bonusu
        if (newStreak === 30 && points.current_streak < 30) {
            await this.addPoints(userId, POINTS_VALUES.STREAK_BONUS_30_DAYS, 'streak_bonus', '30 günlük streak bonusu! 🏆');
        }

        return newStreak;
    },

    // Puan geçmişini getir
    async getPointsHistory(userId: string, limit: number = 20): Promise<PointsHistoryItem[]> {
        const { data, error } = await supabase
            .from('green_points_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching points history:', error);
            throw error;
        }

        return data || [];
    },

    // Atık sınıflandırma için puan ekle
    async addWasteClassificationPoints(userId: string, wasteType: string): Promise<UserGreenPoints> {
        await this.updateStreak(userId);
        return this.addPoints(
            userId,
            POINTS_VALUES.WASTE_CLASSIFICATION,
            'waste_classification',
            `${wasteType} atığı başarıyla sınıflandırıldı! ♻️`
        );
    },

    // Talep kaydırma onayı için puan ekle
    async addDemandShiftPoints(userId: string, savingsTL: number): Promise<UserGreenPoints> {
        await this.updateStreak(userId);
        return this.addPoints(
            userId,
            POINTS_VALUES.DEMAND_SHIFT_APPROVED,
            'demand_shift',
            `Talep kaydırma onaylandı! ${savingsTL.toFixed(2)}₺ tasarruf sağlandı. ⚡`
        );
    },

    // Günlük giriş puanı
    async addDailyLoginPoints(userId: string): Promise<UserGreenPoints | null> {
        const points = await this.ensureUserPointsExist(userId);
        const today = new Date().toISOString().split('T')[0];

        // Bugün zaten giriş puanı aldı mı kontrol et
        const { data: todayHistory } = await supabase
            .from('green_points_history')
            .select('*')
            .eq('user_id', userId)
            .eq('action_type', 'daily_login')
            .gte('created_at', today)
            .limit(1);

        if (todayHistory && todayHistory.length > 0) {
            // Bugün zaten puan almış
            return null;
        }

        await this.updateStreak(userId);
        return this.addPoints(
            userId,
            POINTS_VALUES.DAILY_LOGIN,
            'daily_login',
            'Günlük giriş bonusu! 🌟'
        );
    },
};

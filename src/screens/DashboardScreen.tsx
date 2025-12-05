import React, { useState, useEffect } from 'react';
import { Colors } from '../constants/Colors';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { electricityDemandService, electricityPriceService, demandRequestService } from '../services/supabaseService';
import type { ElectricityDemand, ElectricityPrice } from '../services/supabaseService';

type DashboardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Dashboard'>;

interface Props {
  navigation: DashboardScreenNavigationProp;
}

const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [electricityDemands, setElectricityDemands] = useState<ElectricityDemand[]>([]);
  const [electricityPrices, setElectricityPrices] = useState<ElectricityPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // User metadata'dan şirket bilgilerini al
  const companyName = user?.user_metadata?.company_name || 'Şirket Adı';
  const companyCode = user?.user_metadata?.company_code || 'COMP000';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // İlk olarak güncel elektrik fiyatlarını çek (fiyatlar talep maliyetini hesaplamak için gerekli)
      const prices = await electricityPriceService.getCurrentPrices();
      setElectricityPrices(prices);

      if (user?.id) {
        // Öncelikle electricity_demands tablosundaki şirket/kullanıcı taleplerini çek
        let demands = await electricityDemandService.getUserCompanyDemands(user.id);

        // Eğer electricity_demands boşsa (ör. talep request mekanizmi kullanıldıysa),
        // demand_requests tablosundan çek ve electricityDemand tipine map et
        if ((!demands || demands.length === 0)) {
          const reqs = await demandRequestService.getUserDemandRequests(user.id);
          if (reqs && reqs.length > 0) {
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

        // Eğer gelen taleplerin `cost_tl` alanı 0 ise, mevcut fiyat tablosuna göre hesapla
        const computeCostFromPrices = (item: ElectricityDemand, pricesList: ElectricityPrice[]) => {
          try {
            const slotStart = item.hour_slot.split('-')[0].trim(); // e.g. '08:00'
            const slotHour = parseInt(slotStart.split(':')[0], 10);

            for (const p of pricesList) {
              const range = p.hour_range.split('-');
              const start = parseInt(range[0].split(':')[0], 10);
              const end = parseInt(range[1].split(':')[0], 10);

              // handle ranges that don't wrap midnight
              if (start <= end) {
                if (slotHour >= start && slotHour < end) {
                  return Number(item.demand_kwh) * Number(p.unit_price_tl || 0);
                }
              } else {
                // range wraps midnight (e.g. 22:00-06:00)
                if (slotHour >= start || slotHour < end) {
                  return Number(item.demand_kwh) * Number(p.unit_price_tl || 0);
                }
              }
            }

            // fallback: use first price if no match
            if (pricesList && pricesList.length > 0) {
              return Number(item.demand_kwh) * Number(pricesList[0].unit_price_tl || 0);
            }

            return 0;
          } catch (e) {
            return 0;
          }
        };

        const demandsWithCosts = (demands || []).map(d => {
          if (d.cost_tl && Number(d.cost_tl) > 0) return d;
          const calculated = computeCostFromPrices(d, prices || []);
          return { ...d, cost_tl: Math.round(calculated * 100) / 100 } as ElectricityDemand;
        });

        setElectricityDemands(demandsWithCosts);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'Hayır', style: 'cancel' },
        {
          text: 'Evet', onPress: async () => {
            const { error } = await signOut();
            if (error) {
              Alert.alert('Hata', 'Çıkış yapılırken bir hata oluştu.');
            }
          }
        },
      ]
    );
  };

  const getPeriodColor = (period: string) => {
    switch (period) {
      case 'peak':
        return Colors.danger;
      case 'normal':
        return Colors.normal;
      case 'off-peak':
        return Colors.offPeak;
      default:
        return Colors.secondary;
    }
  };

  const getPeriodText = (period: string) => {
    switch (period) {
      case 'peak':
        return 'Yoğun';
      case 'normal':
        return 'Normal';
      case 'off-peak':
        return 'Düşük';
      default:
        return period;
    }
  };

  const totalDemand = electricityDemands.reduce((sum, item) => sum + item.demand_kwh, 0);
  const totalCost = electricityDemands.reduce((sum, item) => sum + item.cost_tl, 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyCode}>Kod: {companyCode}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalDemand.toLocaleString()}</Text>
          <Text style={styles.summaryLabel}>Günlük Toplam Talep (kWh)</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCost.toLocaleString()} ₺</Text>
          <Text style={styles.summaryLabel}>Günlük Toplam Maliyet</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.createDemandButton]}
          onPress={() => navigation.navigate('CreateDemand')}>
          <Text style={styles.actionButtonText}>⚡ Talep Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.viewAllButton]}
          onPress={() => navigation.navigate('AllCompanies')}>
          <Text style={styles.actionButtonText}>🏢 Tüm Şirketler</Text>
        </TouchableOpacity>
      </View>

      {/* Akıllı Enerji Yönetimi Butonu */}
      <View style={styles.smartEnergySection}>
        <TouchableOpacity
          style={[styles.actionButton, styles.smartEnergyButton]}
          onPress={() => navigation.navigate('DemandShift')}>
          <Text style={styles.actionButtonText}>⚡ Akıllı Enerji Önerileri</Text>
        </TouchableOpacity>
        <Text style={styles.smartEnergyDescription}>
          Dinamik tarifelerden yararlanarak talep kaydırma önerileri al
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elektrik Talep Tablosu</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Saat</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Talep (kWh)</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Maliyet (₺)</Text>
          </View>
          {electricityDemands.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.hour_slot}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.demand_kwh}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.cost_tl.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elektrik Fiyat Tablosu</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Saat Aralığı</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Birim Fiyat</Text>
            <Text style={[styles.tableHeaderText, { flex: 1.5 }]}>Dönem</Text>
          </View>
          {electricityPrices.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.tableCell, { flex: 2 }]}>{item.hour_range}</Text>
              <Text style={[styles.tableCell, { flex: 1.5 }]}>{item.unit_price_tl.toFixed(2)} ₺/kWh</Text>
              <View style={[styles.periodBadge, { backgroundColor: getPeriodColor(item.period_type), flex: 1.5 }]}>
                <Text style={styles.periodText}>{getPeriodText(item.period_type)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.secondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  companyCode: {
    fontSize: 16,
    color: Colors.secondary,
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: Colors.danger,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },
  summaryContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.secondary,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.secondary,
    textAlign: 'center',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 15,
  },
  table: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.secondary,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  tableHeaderText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 14,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: Colors.inputBackground,
  },
  tableCell: {
    textAlign: 'center',
    fontSize: 13,
    color: Colors.textDark,
  },
  periodBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  periodText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  createDemandButton: {
    backgroundColor: Colors.danger,
  },
  viewAllButton: {
    backgroundColor: Colors.normal,
  },
  smartEnergySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  smartEnergyButton: {
    backgroundColor: '#2196F3',
    marginBottom: 8,
  },
  smartEnergyDescription: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

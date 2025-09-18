import React, { useState, useEffect } from 'react';
import { Colors } from '../constants/Colors';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { demandRequestService, companyService } from '../services/supabaseService';
import type { Company, DemandRequest } from '../services/supabaseService';

type AllCompaniesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AllCompanies'>;

interface AllCompaniesScreenProps {
  navigation: AllCompaniesScreenNavigationProp;
}

const AllCompaniesScreen: React.FC<AllCompaniesScreenProps> = ({ navigation }) => {
  const [selectedHour, setSelectedHour] = useState<string>('all');
  const [demandRequests, setDemandRequests] = useState<DemandRequest[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Tüm talepleri ve şirketleri paralel olarak çek
      const [requests, companiesData] = await Promise.all([
        demandRequestService.getAllDemandRequests(),
        companyService.getAllCompanies()
      ]);
      
      setDemandRequests(requests);
      setCompanies(companiesData);
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      Alert.alert('Hata', 'Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Saat filtreleme
  const hours = ['all', ...Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00-${(i + 1).toString().padStart(2, '0')}:00`;
  })];

  const getFilteredDemands = () => {
    if (selectedHour === 'all') {
      return demandRequests;
    }
    
    return demandRequests.filter(demand => demand.hour_slot === selectedHour);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return Colors.approved;
      case 'pending': return Colors.pending;
      case 'rejected': return Colors.rejected;
      default: return Colors.defaultStatus;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Onaylandı';
      case 'pending': return 'Beklemede';
      case 'rejected': return 'Reddedildi';
      default: return status;
    }
  };

  const getHourPeriod = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 17 && hourNum <= 22) return 'Yoğun';
    if (hourNum >= 23 || hourNum <= 6) return 'Düşük';
    return 'Normal';
  };

  const getTotalDemandForHour = (hour: string) => {
    return getFilteredDemands()
      .filter(demand => demand.hour_slot === hour && demand.status === 'approved')
      .reduce((total, demand) => total + demand.demand_kwh, 0);
  };

  const renderDemandItem = ({ item }: { item: DemandRequest }) => (
    <View style={styles.demandCard}>
      <View style={styles.demandHeader}>
        <View>
          <Text style={styles.companyName}>{item.company_name}</Text>
          <Text style={styles.companyCode}>{item.company_code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.demandDetails}>
        <View style={styles.demandRow}>
          <Text style={styles.label}>Saat:</Text>
          <Text style={styles.value}>{item.hour_slot}</Text>
          <Text style={[styles.period, { color: getStatusColor(item.status) }]}>
            ({getHourPeriod(item.hour_slot)})
          </Text>
        </View>
        
        <View style={styles.demandRow}>
          <Text style={styles.label}>Talep:</Text>
          <Text style={styles.demand}>{item.demand_kwh} kWh</Text>
        </View>
        
        <View style={styles.demandRow}>
          <Text style={styles.label}>Tarih:</Text>
          <Text style={styles.value}>{new Date(item.request_date).toLocaleDateString('tr-TR')}</Text>
        </View>
        
        {item.notes && (
          <View style={styles.notesRow}>
            <Text style={styles.label}>Not:</Text>
            <Text style={styles.notes}>{item.notes}</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Veriler yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tüm Şirket Talepleri</Text>
      </View>

      {/* Özet */}
      <View style={styles.summary}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Toplam Şirket</Text>
          <Text style={styles.summaryValue}>{companies.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aktif Talep</Text>
          <Text style={styles.summaryValue}>{demandRequests.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Onaylı Talep</Text>
          <Text style={styles.summaryValue}>
            {demandRequests.filter(req => req.status === 'approved').length}
          </Text>
        </View>
      </View>

      {/* Saat Filtresi */}
      <Text style={styles.filterTitle}>Saat Filtresi</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}>
        {hours.map((hour) => (
          <TouchableOpacity
            key={hour}
            style={[
              styles.filterButton,
              selectedHour === hour && styles.filterButtonActive
            ]}
            onPress={() => setSelectedHour(hour)}>
            <Text style={[
              styles.filterText,
              selectedHour === hour && styles.filterTextActive
            ]}>
              {hour === 'all' ? 'Tümü' : hour}
            </Text>
            {hour !== 'all' && (
              <Text style={styles.filterDemand}>
                {getTotalDemandForHour(hour)} kWh
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Talep Listesi */}
      <FlatList
        data={getFilteredDemands()}
        renderItem={renderDemandItem}
        keyExtractor={(item) => item.id}
        style={styles.demandList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {selectedHour === 'all' 
                ? 'Henüz talep bulunmuyor.' 
                : `${selectedHour} saati için talep bulunmuyor.`}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
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
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  summary: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between',
  },
  summaryCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: Colors.secondary,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 5,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 14,
    color: Colors.textDark,
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  filterDemand: {
    fontSize: 10,
    color: Colors.secondary,
    marginTop: 2,
  },
  demandList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  demandCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  demandHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  companyCode: {
    fontSize: 12,
    color: Colors.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  demandDetails: {
    gap: 8,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notesRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    color: Colors.secondary,
    width: 60,
  },
  value: {
    fontSize: 14,
    color: Colors.textDark,
    flex: 1,
  },
  demand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    flex: 1,
  },
  period: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  notes: {
    fontSize: 14,
    color: Colors.secondary,
    flex: 1,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
  },
});

export default AllCompaniesScreen;
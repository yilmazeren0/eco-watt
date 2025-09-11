import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { Company, DemandRequest } from '../types/navigation';

interface AllCompaniesScreenProps {
  navigation: any;
}

const AllCompaniesScreen: React.FC<AllCompaniesScreenProps> = ({ navigation }) => {
  const [selectedHour, setSelectedHour] = useState<string>('all');

  // Mock veri - gerçek uygulamada API'den gelecek
  const mockCompanies: Company[] = [
    {
      code: 'COMP001',
      name: 'Teknoloji A.Ş.',
      totalDemand: 750,
      activeDemands: [
        {
          id: '1',
          companyCode: 'COMP001',
          companyName: 'Teknoloji A.Ş.',
          hour: '08:00-09:00',
          demandKWh: 150,
          requestDate: '11.09.2025',
          status: 'approved',
        },
        {
          id: '2',
          companyCode: 'COMP001',
          companyName: 'Teknoloji A.Ş.',
          hour: '14:00-15:00',
          demandKWh: 200,
          requestDate: '11.09.2025',
          status: 'pending',
        },
        {
          id: '3',
          companyCode: 'COMP001',
          companyName: 'Teknoloji A.Ş.',
          hour: '18:00-19:00',
          demandKWh: 300,
          requestDate: '11.09.2025',
          status: 'approved',
        },
      ]
    },
    {
      code: 'COMP002',
      name: 'Üretim Ltd.',
      totalDemand: 1200,
      activeDemands: [
        {
          id: '4',
          companyCode: 'COMP002',
          companyName: 'Üretim Ltd.',
          hour: '06:00-07:00',
          demandKWh: 500,
          requestDate: '11.09.2025',
          status: 'approved',
        },
        {
          id: '5',
          companyCode: 'COMP002',
          companyName: 'Üretim Ltd.',
          hour: '13:00-14:00',
          demandKWh: 400,
          requestDate: '11.09.2025',
          status: 'approved',
        },
        {
          id: '6',
          companyCode: 'COMP002',
          companyName: 'Üretim Ltd.',
          hour: '20:00-21:00',
          demandKWh: 300,
          requestDate: '11.09.2025',
          status: 'pending',
        },
      ]
    },
    {
      code: 'COMP003',
      name: 'Enerji San.',
      totalDemand: 950,
      activeDemands: [
        {
          id: '7',
          companyCode: 'COMP003',
          companyName: 'Enerji San.',
          hour: '09:00-10:00',
          demandKWh: 250,
          requestDate: '11.09.2025',
          status: 'approved',
        },
        {
          id: '8',
          companyCode: 'COMP003',
          companyName: 'Enerji San.',
          hour: '15:00-16:00',
          demandKWh: 350,
          requestDate: '11.09.2025',
          status: 'rejected',
        },
        {
          id: '9',
          companyCode: 'COMP003',
          companyName: 'Enerji San.',
          hour: '22:00-23:00',
          demandKWh: 350,
          requestDate: '11.09.2025',
          status: 'approved',
        },
      ]
    },
  ];

  // Saat filtreleme
  const hours = ['all', ...Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00-${(i + 1).toString().padStart(2, '0')}:00`;
  })];

  const getFilteredDemands = () => {
    if (selectedHour === 'all') {
      return mockCompanies.flatMap(company => 
        company.activeDemands.map(demand => ({
          ...demand,
          companyName: company.name,
        }))
      );
    }
    
    return mockCompanies.flatMap(company => 
      company.activeDemands
        .filter(demand => demand.hour === selectedHour)
        .map(demand => ({
          ...demand,
          companyName: company.name,
        }))
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#999';
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
      .filter(demand => demand.hour === hour && demand.status === 'approved')
      .reduce((total, demand) => total + demand.demandKWh, 0);
  };

  const renderDemandItem = ({ item }: { item: DemandRequest }) => (
    <View style={styles.demandCard}>
      <View style={styles.demandHeader}>
        <View>
          <Text style={styles.companyName}>{item.companyName}</Text>
          <Text style={styles.companyCode}>{item.companyCode}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.demandDetails}>
        <View style={styles.demandRow}>
          <Text style={styles.label}>Saat:</Text>
          <Text style={styles.value}>{item.hour}</Text>
          <Text style={[styles.period, { color: getStatusColor(item.status) }]}>
            ({getHourPeriod(item.hour)})
          </Text>
        </View>
        
        <View style={styles.demandRow}>
          <Text style={styles.label}>Talep:</Text>
          <Text style={styles.demand}>{item.demandKWh} kWh</Text>
        </View>
        
        <View style={styles.demandRow}>
          <Text style={styles.label}>Tarih:</Text>
          <Text style={styles.value}>{item.requestDate}</Text>
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
          <Text style={styles.summaryValue}>{mockCompanies.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Aktif Talep</Text>
          <Text style={styles.summaryValue}>
            {mockCompanies.reduce((total, company) => total + company.activeDemands.length, 0)}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Toplam Kapasite</Text>
          <Text style={styles.summaryValue}>
            {mockCompanies.reduce((total, company) => total + company.totalDemand, 0)} kWh
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2E8B57',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E8B57',
    marginTop: 5,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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
    borderColor: '#ddd',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  filterText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  filterTextActive: {
    color: 'white',
  },
  filterDemand: {
    fontSize: 10,
    color: '#666',
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
    shadowColor: '#000',
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
    color: '#333',
  },
  companyCode: {
    fontSize: 12,
    color: '#666',
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
    color: '#666',
    width: 60,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  demand: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E8B57',
    flex: 1,
  },
  period: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 5,
  },
  notes: {
    fontSize: 14,
    color: '#666',
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
    color: '#666',
    textAlign: 'center',
  },
});

export default AllCompaniesScreen;
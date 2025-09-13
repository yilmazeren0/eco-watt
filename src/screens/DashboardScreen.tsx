import React from 'react';
import { Colors } from '../constants/Colors';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {ElectricityDemand, ElectricityPrice} from '../types/navigation';

interface Props {
  navigation: {
    navigate: (screen: string, params?: any) => void;
  };
  route: {
    params: {
      companyName: string;
      companyCode: string;
    };
  };
}

const DashboardScreen: React.FC<Props> = ({navigation, route}) => {
  const {companyName, companyCode} = route.params;

  // Örnek elektrik talep verileri
  const electricityDemands: ElectricityDemand[] = [
    {hour: '00:00-01:00', demand: 120, cost: 150.5},
    {hour: '01:00-02:00', demand: 100, cost: 125.0},
    {hour: '02:00-03:00', demand: 95, cost: 118.75},
    {hour: '03:00-04:00', demand: 90, cost: 112.5},
    {hour: '04:00-05:00', demand: 85, cost: 106.25},
    {hour: '05:00-06:00', demand: 110, cost: 137.5},
    {hour: '06:00-07:00', demand: 140, cost: 175.0},
    {hour: '07:00-08:00', demand: 180, cost: 225.0},
    {hour: '08:00-09:00', demand: 220, cost: 275.0},
    {hour: '09:00-10:00', demand: 250, cost: 312.5},
    {hour: '10:00-11:00', demand: 280, cost: 350.0},
    {hour: '11:00-12:00', demand: 300, cost: 375.0},
    {hour: '12:00-13:00', demand: 320, cost: 400.0},
    {hour: '13:00-14:00', demand: 310, cost: 387.5},
    {hour: '14:00-15:00', demand: 290, cost: 362.5},
    {hour: '15:00-16:00', demand: 270, cost: 337.5},
    {hour: '16:00-17:00', demand: 260, cost: 325.0},
    {hour: '17:00-18:00', demand: 240, cost: 300.0},
    {hour: '18:00-19:00', demand: 220, cost: 275.0},
    {hour: '19:00-20:00', demand: 200, cost: 250.0},
    {hour: '20:00-21:00', demand: 180, cost: 225.0},
    {hour: '21:00-22:00', demand: 160, cost: 200.0},
    {hour: '22:00-23:00', demand: 140, cost: 175.0},
    {hour: '23:00-00:00', demand: 130, cost: 162.5},
  ];

  // Örnek elektrik fiyat verileri
  const electricityPrices: ElectricityPrice[] = [
    {hour: '00:00-06:00', unitPrice: 1.25, period: 'off-peak'},
    {hour: '06:00-08:00', unitPrice: 1.65, period: 'normal'},
    {hour: '08:00-17:00', unitPrice: 2.10, period: 'peak'},
    {hour: '17:00-22:00', unitPrice: 1.85, period: 'normal'},
    {hour: '22:00-00:00', unitPrice: 1.45, period: 'off-peak'},
  ];

  const handleLogout = () => {
    Alert.alert(
      'Çıkış',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        {text: 'Hayır', style: 'cancel'},
        {text: 'Evet', onPress: () => navigation.navigate('Login')},
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

  const totalDemand = electricityDemands.reduce((sum, item) => sum + item.demand, 0);
  const totalCost = electricityDemands.reduce((sum, item) => sum + item.cost, 0);

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
          <Text style={styles.summaryLabel}>Toplam Talep (kWh)</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>{totalCost.toLocaleString()} ₺</Text>
          <Text style={styles.summaryLabel}>Toplam Maliyet</Text>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elektrik Talep Tablosu</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, {flex: 2}]}>Saat</Text>
            <Text style={[styles.tableHeaderText, {flex: 1.5}]}>Talep (kWh)</Text>
            <Text style={[styles.tableHeaderText, {flex: 1.5}]}>Maliyet (₺)</Text>
          </View>
          {electricityDemands.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.tableCell, {flex: 2}]}>{item.hour}</Text>
              <Text style={[styles.tableCell, {flex: 1.5}]}>{item.demand}</Text>
              <Text style={[styles.tableCell, {flex: 1.5}]}>{item.cost.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Elektrik Fiyat Tablosu</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, {flex: 2}]}>Saat Aralığı</Text>
            <Text style={[styles.tableHeaderText, {flex: 1.5}]}>Birim Fiyat</Text>
            <Text style={[styles.tableHeaderText, {flex: 1.5}]}>Dönem</Text>
          </View>
          {electricityPrices.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.tableRowEven]}>
              <Text style={[styles.tableCell, {flex: 2}]}>{item.hour}</Text>
              <Text style={[styles.tableCell, {flex: 1.5}]}>{item.unitPrice.toFixed(2)} ₺/kWh</Text>
              <View style={[styles.periodBadge, {backgroundColor: getPeriodColor(item.period), flex: 1.5}]}>
                <Text style={styles.periodText}>{getPeriodText(item.period)}</Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.black,
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 2},
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
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default DashboardScreen;

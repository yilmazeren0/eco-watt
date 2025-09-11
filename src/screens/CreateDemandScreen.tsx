import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { DemandRequest } from '../types/navigation';

interface CreateDemandScreenProps {
  navigation: any;
  route: any;
}

const CreateDemandScreen: React.FC<CreateDemandScreenProps> = ({ navigation, route }) => {
  const { companyName, companyCode } = route.params;
  const [selectedHour, setSelectedHour] = useState('');
  const [demandKWh, setDemandKWh] = useState('');
  const [notes, setNotes] = useState('');

  // Saat seçenekleri (00:00 - 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00-${(i + 1).toString().padStart(2, '0')}:00`;
  });

  const handleSubmitDemand = () => {
    if (!selectedHour || !demandKWh) {
      Alert.alert('Hata', 'Lütfen saat ve talep miktarını giriniz.');
      return;
    }

    const demand = parseFloat(demandKWh);
    if (isNaN(demand) || demand <= 0) {
      Alert.alert('Hata', 'Geçerli bir talep miktarı giriniz.');
      return;
    }

    // Yeni talep oluştur
    const newDemand: DemandRequest = {
      id: Date.now().toString(),
      companyCode,
      companyName,
      hour: selectedHour,
      demandKWh: demand,
      requestDate: new Date().toLocaleDateString('tr-TR'),
      status: 'pending',
      notes: notes.trim() || undefined,
    };

    // Burada normalde API'ye gönderilir, şimdi mock data olarak saklanır
    console.log('Yeni Talep Oluşturuldu:', newDemand);

    Alert.alert(
      'Başarılı',
      `${selectedHour} saati için ${demand} kWh elektrik talebi oluşturuldu.`,
      [
        {
          text: 'Tamam',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const getHourColor = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 17 && hourNum <= 22) return '#FF6B6B'; // Peak
    if (hourNum >= 23 || hourNum <= 6) return '#45B7D1'; // Off-peak
    return '#4ECDC4'; // Normal
  };

  const getHourPeriod = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 17 && hourNum <= 22) return 'Yoğun';
    if (hourNum >= 23 || hourNum <= 6) return 'Düşük';
    return 'Normal';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Elektrik Talebi Oluştur</Text>
        </View>

        {/* Şirket Bilgileri */}
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>{companyName}</Text>
          <Text style={styles.companyCode}>Kod: {companyCode}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Saat Seçimi */}
          <Text style={styles.sectionTitle}>Saat Aralığı Seçin</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.hoursContainer}>
            {hours.map((hour) => (
              <TouchableOpacity
                key={hour}
                style={[
                  styles.hourButton,
                  selectedHour === hour && styles.hourButtonSelected,
                  { borderColor: getHourColor(hour) }
                ]}
                onPress={() => setSelectedHour(hour)}>
                <Text style={[
                  styles.hourText,
                  selectedHour === hour && styles.hourTextSelected
                ]}>
                  {hour}
                </Text>
                <Text style={[
                  styles.periodText,
                  { color: getHourColor(hour) }
                ]}>
                  {getHourPeriod(hour)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Talep Miktarı */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Talep Miktarı (kWh)</Text>
            <TextInput
              style={styles.input}
              value={demandKWh}
              onChangeText={setDemandKWh}
              placeholder="Örn: 150"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          {/* Notlar */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notlar (Opsiyonel)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Ek bilgiler..."
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </View>

          {/* Fiyat Bilgisi */}
          {selectedHour && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceTitle}>Tahmini Maliyet</Text>
              <Text style={styles.priceText}>
                Dönem: <Text style={{ color: getHourColor(selectedHour) }}>
                  {getHourPeriod(selectedHour)}
                </Text>
              </Text>
              {demandKWh && (
                <Text style={styles.totalPrice}>
                  {demandKWh} kWh × {getHourPeriod(selectedHour) === 'Yoğun' ? '2.50' : 
                                   getHourPeriod(selectedHour) === 'Düşük' ? '1.20' : '1.80'} TL = {' '}
                  <Text style={styles.priceAmount}>
                    {(parseFloat(demandKWh || '0') * 
                     (getHourPeriod(selectedHour) === 'Yoğun' ? 2.50 : 
                      getHourPeriod(selectedHour) === 'Düşük' ? 1.20 : 1.80)
                    ).toFixed(2)} TL
                  </Text>
                </Text>
              )}
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!selectedHour || !demandKWh) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitDemand}
            disabled={!selectedHour || !demandKWh}>
            <Text style={styles.submitButtonText}>Talep Oluştur</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
  companyInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E8B57',
  },
  companyCode: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  form: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  hoursContainer: {
    marginBottom: 25,
  },
  hourButton: {
    borderWidth: 2,
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    minWidth: 100,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  hourButtonSelected: {
    backgroundColor: '#f0f9ff',
  },
  hourText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  hourTextSelected: {
    color: '#2E8B57',
  },
  periodText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  priceAmount: {
    fontWeight: 'bold',
    color: '#2E8B57',
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateDemandScreen;
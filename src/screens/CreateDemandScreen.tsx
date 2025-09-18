import React, { useState } from 'react';
import { Colors } from '../constants/Colors';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../contexts/AuthContext';
import { demandRequestService, userProfileService } from '../services/supabaseService';

type CreateDemandScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CreateDemand'>;

interface CreateDemandScreenProps {
  navigation: CreateDemandScreenNavigationProp;
}

const CreateDemandScreen: React.FC<CreateDemandScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const companyName = user?.user_metadata?.company_name || 'Şirket Adı';
  const companyCode = user?.user_metadata?.company_code || 'COMP000';
  
  const [selectedHour, setSelectedHour] = useState('');
  const [demandKWh, setDemandKWh] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Saat seçenekleri (00:00 - 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00-${(i + 1).toString().padStart(2, '0')}:00`;
  });

  const handleSubmitDemand = async () => {
    if (!selectedHour || !demandKWh) {
      Alert.alert('Hata', 'Lütfen saat ve talep miktarını giriniz.');
      return;
    }

    const demand = parseFloat(demandKWh);
    if (isNaN(demand) || demand <= 0) {
      Alert.alert('Hata', 'Geçerli bir talep miktarı giriniz.');
      return;
    }

    if (!user?.id) {
      Alert.alert('Hata', 'Kullanıcı bilgisi bulunamadı.');
      return;
    }

    try {
      setLoading(true);

      // Kullanıcı profil bilgilerini al
      const userProfile = await userProfileService.getUserProfile(user.id);
      
      // Yeni talep oluştur
      const newDemandRequest = {
        company_id: userProfile?.company_id || '',
        user_id: user.id,
        company_name: companyName,
        company_code: companyCode,
        hour_slot: selectedHour,
        demand_kwh: demand,
        request_date: new Date().toISOString().split('T')[0],
        status: 'pending' as const,
        notes: notes.trim() || undefined,
      };

      await demandRequestService.createDemandRequest(newDemandRequest);

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
    } catch (error) {
      console.error('Talep oluşturma hatası:', error);
      Alert.alert('Hata', 'Talep oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const getHourColor = (hour: string) => {
    const hourNum = parseInt(hour.split(':')[0]);
    if (hourNum >= 17 && hourNum <= 22) return Colors.danger; // Peak
    if (hourNum >= 23 || hourNum <= 6) return Colors.offPeak; // Off-peak
    return Colors.normal; // Normal
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
              placeholderTextColor={Colors.defaultStatus}
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
              placeholderTextColor={Colors.defaultStatus}
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
              (!selectedHour || !demandKWh || loading) && styles.submitButtonDisabled
            ]}
            onPress={handleSubmitDemand}
            disabled={!selectedHour || !demandKWh || loading}>
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Talep Oluştur</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
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
  companyInfo: {
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  companyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
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
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
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
    backgroundColor: Colors.buttonSelected,
  },
  hourText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.textDark,
  },
  hourTextSelected: {
    color: Colors.primary,
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
    color: Colors.textDark,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: Colors.inputBackground,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  priceInfo: {
    backgroundColor: Colors.priceBackground,
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  priceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  totalPrice: {
    fontSize: 16,
    color: Colors.textDark,
    marginTop: 8,
  },
  priceAmount: {
    fontWeight: 'bold',
    color: Colors.primary,
    fontSize: 18,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: Colors.buttonDisabled,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateDemandScreen;
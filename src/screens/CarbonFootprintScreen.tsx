import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import {
    carbonFootprintService,
    CarbonInput,
    CorporateCarbonInput,
    CarbonResult,
    TURKEY_AVERAGES,
} from '../services/carbonFootprintService';

type CarbonFootprintScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CarbonFootprint'>;

interface Props {
    navigation: CarbonFootprintScreenNavigationProp;
}

const CarbonFootprintScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const isIndividual = !user?.user_metadata?.company_code;

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<CarbonResult | null>(null);

    // Bireysel girdiler
    const [carKm, setCarKm] = useState('50');
    const [carType, setCarType] = useState<'petrol' | 'diesel' | 'electric' | 'hybrid'>('petrol');
    const [publicTransportKm, setPublicTransportKm] = useState('30');
    const [flightHours, setFlightHours] = useState('4');
    const [electricityKwh, setElectricityKwh] = useState('200');
    const [gasM3, setGasM3] = useState('50');
    const [meatPortions, setMeatPortions] = useState('7');
    const [vegPortions, setVegPortions] = useState('7');
    const [wasteKg, setWasteKg] = useState('5');
    const [recyclePercent, setRecyclePercent] = useState('30');

    // Kurumsal girdiler
    const [employeeCount, setEmployeeCount] = useState('50');
    const [officeSqm, setOfficeSqm] = useState('500');
    const [corpElectricity, setCorpElectricity] = useState('5000');
    const [corpGas, setCorpGas] = useState('1000');
    const [corpVehicleKm, setCorpVehicleKm] = useState('2000');
    const [corpFlights, setCorpFlights] = useState('20');
    const [corpWaste, setCorpWaste] = useState('200');
    const [corpRecycle, setCorpRecycle] = useState('40');

    const handleCalculate = async () => {
        setLoading(true);
        try {
            let calculatedResult: CarbonResult;

            if (isIndividual) {
                const input: CarbonInput = {
                    car_km: parseFloat(carKm) || 0,
                    car_type: carType,
                    public_transport_km: parseFloat(publicTransportKm) || 0,
                    flight_hours_yearly: parseFloat(flightHours) || 0,
                    electricity_kwh: parseFloat(electricityKwh) || 0,
                    natural_gas_m3: parseFloat(gasM3) || 0,
                    meat_portions: parseFloat(meatPortions) || 0,
                    vegetarian_portions: parseFloat(vegPortions) || 0,
                    waste_kg: parseFloat(wasteKg) || 0,
                    recycle_percent: parseFloat(recyclePercent) || 0,
                };
                calculatedResult = carbonFootprintService.calculateIndividual(input);
            } else {
                const input: CorporateCarbonInput = {
                    employee_count: parseFloat(employeeCount) || 1,
                    office_sqm: parseFloat(officeSqm) || 0,
                    electricity_kwh_monthly: parseFloat(corpElectricity) || 0,
                    gas_m3_monthly: parseFloat(corpGas) || 0,
                    company_vehicles_km_monthly: parseFloat(corpVehicleKm) || 0,
                    business_flights_yearly: parseFloat(corpFlights) || 0,
                    waste_kg_monthly: parseFloat(corpWaste) || 0,
                    recycle_percent: parseFloat(corpRecycle) || 0,
                };
                calculatedResult = carbonFootprintService.calculateCorporate(input);
            }

            setResult(calculatedResult);

            // Kaydet ve puan ver
            if (user?.id) {
                await carbonFootprintService.saveAndReward(user.id, calculatedResult, isIndividual);
            }
        } catch (error) {
            Alert.alert('Hata', 'Hesaplama sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const renderInput = (label: string, value: string, setter: (v: string) => void, unit: string) => (
        <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={setter}
                    keyboardType="numeric"
                    placeholder="0"
                />
                <Text style={styles.inputUnit}>{unit}</Text>
            </View>
        </View>
    );

    const renderCarTypeSelector = () => (
        <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Araç Tipi</Text>
            <View style={styles.carTypeContainer}>
                {(['petrol', 'diesel', 'electric', 'hybrid'] as const).map((type) => (
                    <TouchableOpacity
                        key={type}
                        style={[styles.carTypeButton, carType === type && styles.carTypeButtonActive]}
                        onPress={() => setCarType(type)}
                    >
                        <Text style={[styles.carTypeText, carType === type && styles.carTypeTextActive]}>
                            {type === 'petrol' ? '⛽' : type === 'diesel' ? '🛢️' : type === 'electric' ? '🔌' : '🔋'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    const renderResult = () => {
        if (!result) return null;

        const ratingColor = carbonFootprintService.getRatingColor(result.rating);
        const ratingEmoji = carbonFootprintService.getRatingEmoji(result.rating);
        const ratingText = carbonFootprintService.getRatingText(result.rating);
        const average = isIndividual ? TURKEY_AVERAGES.individual : TURKEY_AVERAGES.corporate_per_employee;

        return (
            <View style={styles.resultContainer}>
                <View style={[styles.resultHeader, { backgroundColor: ratingColor }]}>
                    <Text style={styles.resultEmoji}>{ratingEmoji}</Text>
                    <View>
                        <Text style={styles.resultTitle}>Karbon Ayak İziniz</Text>
                        <Text style={styles.resultSubtitle}>{ratingText}</Text>
                    </View>
                </View>

                <View style={styles.resultBody}>
                    <View style={styles.totalBox}>
                        <Text style={styles.totalValue}>{result.total_kg_yearly.toLocaleString()}</Text>
                        <Text style={styles.totalUnit}>kg CO₂/yıl</Text>
                    </View>

                    <Text style={styles.comparisonText}>
                        {result.comparison_to_average >= 0 ? '📈' : '📉'} Türkiye ortalamasına göre{' '}
                        <Text style={{ color: result.comparison_to_average >= 0 ? '#F44336' : '#4CAF50', fontWeight: 'bold' }}>
                            %{Math.abs(result.comparison_to_average)} {result.comparison_to_average >= 0 ? 'fazla' : 'az'}
                        </Text>
                    </Text>

                    <Text style={styles.sectionTitle}>📊 Dağılım</Text>
                    <View style={styles.breakdownContainer}>
                        {[
                            { label: '🚗 Ulaşım', value: result.breakdown.transport },
                            { label: '💡 Enerji', value: result.breakdown.energy },
                            { label: '🍽️ Yemek', value: result.breakdown.food },
                            { label: '🗑️ Atık', value: result.breakdown.waste },
                        ].filter(item => item.value > 0).map((item, index) => (
                            <View key={index} style={styles.breakdownItem}>
                                <Text style={styles.breakdownLabel}>{item.label}</Text>
                                <View style={styles.breakdownBarContainer}>
                                    <View
                                        style={[
                                            styles.breakdownBar,
                                            { width: `${(item.value / result.total_kg_yearly) * 100}%` },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.breakdownValue}>{item.value.toLocaleString()} kg</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>💡 Öneriler</Text>
                    {result.tips.map((tip, index) => (
                        <View key={index} style={styles.tipItem}>
                            <Text style={styles.tipBullet}>•</Text>
                            <Text style={styles.tipText}>{tip}</Text>
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.recalculateButton} onPress={() => setResult(null)}>
                    <Text style={styles.recalculateButtonText}>🔄 Yeniden Hesapla</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (result) {
        return (
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                {renderResult()}
            </ScrollView>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.headerEmoji}>👣</Text>
                <Text style={styles.headerTitle}>Karbon Ayak İzi Hesaplayıcı</Text>
                <Text style={styles.headerSubtitle}>
                    {isIndividual ? 'Kişisel karbon emisyonlarınızı hesaplayın' : 'Şirketinizin karbon emisyonlarını hesaplayın'}
                </Text>
            </View>

            {isIndividual ? (
                <>
                    <Text style={styles.sectionHeader}>🚗 Ulaşım (Haftalık)</Text>
                    {renderInput('Araç ile gidilen mesafe', carKm, setCarKm, 'km')}
                    {renderCarTypeSelector()}
                    {renderInput('Toplu taşıma', publicTransportKm, setPublicTransportKm, 'km')}
                    {renderInput('Uçak yolculuğu (yıllık)', flightHours, setFlightHours, 'saat')}

                    <Text style={styles.sectionHeader}>💡 Enerji (Aylık)</Text>
                    {renderInput('Elektrik tüketimi', electricityKwh, setElectricityKwh, 'kWh')}
                    {renderInput('Doğalgaz tüketimi', gasM3, setGasM3, 'm³')}

                    <Text style={styles.sectionHeader}>🍽️ Yemek (Haftalık)</Text>
                    {renderInput('Et porsiyon sayısı', meatPortions, setMeatPortions, 'porsiyon')}
                    {renderInput('Vejetaryen porsiyon', vegPortions, setVegPortions, 'porsiyon')}

                    <Text style={styles.sectionHeader}>🗑️ Atık (Haftalık)</Text>
                    {renderInput('Toplam atık', wasteKg, setWasteKg, 'kg')}
                    {renderInput('Geri dönüşüm oranı', recyclePercent, setRecyclePercent, '%')}
                </>
            ) : (
                <>
                    <Text style={styles.sectionHeader}>🏢 Şirket Bilgileri</Text>
                    {renderInput('Çalışan sayısı', employeeCount, setEmployeeCount, 'kişi')}
                    {renderInput('Ofis alanı', officeSqm, setOfficeSqm, 'm²')}

                    <Text style={styles.sectionHeader}>💡 Enerji (Aylık)</Text>
                    {renderInput('Elektrik tüketimi', corpElectricity, setCorpElectricity, 'kWh')}
                    {renderInput('Doğalgaz tüketimi', corpGas, setCorpGas, 'm³')}

                    <Text style={styles.sectionHeader}>🚗 Ulaşım</Text>
                    {renderInput('Şirket araçları (aylık)', corpVehicleKm, setCorpVehicleKm, 'km')}
                    {renderInput('İş seyahatleri (yıllık)', corpFlights, setCorpFlights, 'uçuş')}

                    <Text style={styles.sectionHeader}>🗑️ Atık (Aylık)</Text>
                    {renderInput('Toplam atık', corpWaste, setCorpWaste, 'kg')}
                    {renderInput('Geri dönüşüm oranı', corpRecycle, setCorpRecycle, '%')}
                </>
            )}

            <TouchableOpacity
                style={styles.calculateButton}
                onPress={handleCalculate}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={styles.calculateButtonText}>🌍 Hesapla</Text>
                )}
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 25,
    },
    headerEmoji: {
        fontSize: 48,
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: Colors.secondary,
        textAlign: 'center',
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginTop: 20,
        marginBottom: 15,
    },
    inputRow: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 14,
        color: Colors.textDark,
        marginBottom: 6,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    input: {
        flex: 1,
        padding: 12,
        fontSize: 16,
    },
    inputUnit: {
        paddingRight: 12,
        color: Colors.secondary,
        fontSize: 14,
    },
    carTypeContainer: {
        flexDirection: 'row',
        gap: 10,
    },
    carTypeButton: {
        flex: 1,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    carTypeButtonActive: {
        backgroundColor: '#E8F5E9',
        borderColor: Colors.primary,
    },
    carTypeText: {
        fontSize: 24,
    },
    carTypeTextActive: {
        transform: [{ scale: 1.1 }],
    },
    calculateButton: {
        backgroundColor: Colors.primary,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 25,
    },
    calculateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    // Result styles
    resultContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
    },
    resultEmoji: {
        fontSize: 40,
        marginRight: 15,
    },
    resultTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    resultSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
    },
    resultBody: {
        padding: 20,
    },
    totalBox: {
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        marginBottom: 15,
    },
    totalValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    totalUnit: {
        fontSize: 14,
        color: Colors.secondary,
    },
    comparisonText: {
        fontSize: 14,
        color: Colors.textDark,
        textAlign: 'center',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginTop: 15,
        marginBottom: 10,
    },
    breakdownContainer: {
        gap: 10,
    },
    breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breakdownLabel: {
        width: 90,
        fontSize: 13,
        color: Colors.textDark,
    },
    breakdownBarContainer: {
        flex: 1,
        height: 8,
        backgroundColor: '#E0E0E0',
        borderRadius: 4,
        marginHorizontal: 10,
    },
    breakdownBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 4,
    },
    breakdownValue: {
        width: 70,
        fontSize: 12,
        color: Colors.secondary,
        textAlign: 'right',
    },
    tipItem: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    tipBullet: {
        color: Colors.primary,
        marginRight: 8,
        fontSize: 14,
    },
    tipText: {
        flex: 1,
        fontSize: 14,
        color: Colors.textDark,
        lineHeight: 20,
    },
    recalculateButton: {
        padding: 15,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: Colors.border,
    },
    recalculateButtonText: {
        color: Colors.primary,
        fontSize: 16,
        fontWeight: '600',
    },
});

export default CarbonFootprintScreen;

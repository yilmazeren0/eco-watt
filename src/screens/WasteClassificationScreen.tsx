import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import { launchCamera, launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';
import { classifyImage, WasteClassificationResult } from '../services/WasteClassifier';
import { useAuth } from '../contexts/AuthContext';
import { greenPointsService, POINTS_VALUES } from '../services/greenPointsService';

type WasteClassificationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'WasteClassification'>;

interface Props {
    navigation: WasteClassificationScreenNavigationProp;
}

const WasteClassificationScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [result, setResult] = useState<WasteClassificationResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [base64Image, setBase64Image] = useState<string | undefined>(undefined);
    const [pointsEarned, setPointsEarned] = useState<number | null>(null);

    const handleImageSelection = async (type: 'camera' | 'gallery') => {
        const options = {
            mediaType: 'photo' as const,
            includeBase64: true,
            maxHeight: 1024,
            maxWidth: 1024,
            quality: 0.8 as 0.8,
        };

        try {
            const response = type === 'camera'
                ? await launchCamera(options)
                : await launchImageLibrary(options);

            if (response.didCancel) {
                return;
            }

            if (response.errorCode) {
                Alert.alert('Hata', response.errorMessage || 'Resim seçilirken bir hata oluştu');
                return;
            }

            if (response.assets && response.assets[0].uri) {
                setSelectedImage(response.assets[0].uri);
                setBase64Image(response.assets[0].base64);
                setResult(null);
            }
        } catch (error) {
            Alert.alert('Hata', 'Beklenmeyen bir hata oluştu');
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage || !base64Image) {
            Alert.alert('Hata', 'Resim verisi bulunamadı.');
            return;
        }

        setLoading(true);
        setPointsEarned(null);
        try {
            const classificationResult = await classifyImage(selectedImage, base64Image);
            setResult(classificationResult);

            // Başarılı sınıflandırma için yeşil puan ekle
            if (user?.id && classificationResult.type !== 'Unknown') {
                try {
                    await greenPointsService.addWasteClassificationPoints(user.id, classificationResult.type);
                    setPointsEarned(POINTS_VALUES.WASTE_CLASSIFICATION);
                } catch (pointsError) {
                    console.log('Puan eklenemedi:', pointsError);
                }
            }
        } catch (error: any) {
            Alert.alert('Hata', error.message || 'Analiz sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Atık Ayrıştırma Asistanı</Text>
                <Text style={styles.subtitle}>
                    Atığınızı doğru kutuya atmak için fotoğrafını çekin veya yükleyin.
                </Text>
            </View>

            <View style={styles.imageContainer}>
                {selectedImage ? (
                    <Image source={{ uri: selectedImage }} style={styles.previewImage} />
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Text style={styles.placeholderText}>Fotoğraf yok</Text>
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleImageSelection('camera')}>
                    <Text style={styles.buttonText}>📷 Fotoğraf Çek</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleImageSelection('gallery')}>
                    <Text style={styles.buttonText}>🖼️ Galeriden Seç</Text>
                </TouchableOpacity>
            </View>

            {selectedImage && !result && (
                <TouchableOpacity
                    style={[styles.analyzeButton, loading && styles.disabledButton]}
                    onPress={handleAnalyze}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.analyzeButtonText}>Analiz Et 🔍</Text>
                    )}
                </TouchableOpacity>
            )}

            {result && (
                <View style={styles.resultContainer}>
                    <View style={[styles.resultHeader, { backgroundColor: result.binColor }]}>
                        <Text style={styles.resultTitle}>{result.type}</Text>
                    </View>
                    <View style={styles.resultBody}>
                        <Text style={styles.resultDescription}>{result.description}</Text>
                        <Text style={styles.confidenceText}>
                            Güven Oranı: %{(result.confidence * 100).toFixed(0)}
                        </Text>
                        {pointsEarned && (
                            <View style={styles.pointsEarnedBadge}>
                                <Text style={styles.pointsEarnedText}>+{pointsEarned} Yeşil Puan Kazandın! 🌱</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: Colors.background,
    },
    header: {
        marginBottom: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: Colors.secondary,
        textAlign: 'center',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#f0f0f0',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#e0e0e0',
    },
    previewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholderContainer: {
        alignItems: 'center',
    },
    placeholderText: {
        color: '#888',
        fontSize: 16,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    actionButton: {
        flex: 0.48,
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    buttonText: {
        color: Colors.textDark,
        fontWeight: '600',
    },
    analyzeButton: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 6,
    },
    disabledButton: {
        opacity: 0.7,
    },
    analyzeButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
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
        padding: 16,
        alignItems: 'center',
    },
    resultTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
    resultBody: {
        padding: 20,
    },
    resultDescription: {
        fontSize: 16,
        color: Colors.textDark,
        lineHeight: 24,
        marginBottom: 12,
    },
    confidenceText: {
        fontSize: 14,
        color: Colors.secondary,
        fontStyle: 'italic',
        textAlign: 'right',
    },
    pointsEarnedBadge: {
        backgroundColor: Colors.primary,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginTop: 15,
        alignSelf: 'center',
    },
    pointsEarnedText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default WasteClassificationScreen;

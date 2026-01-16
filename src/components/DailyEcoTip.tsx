import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ecoService, EcoTip } from '../services/ecoService';

interface DailyEcoTipProps {
    onRead?: () => void;
}

const DailyEcoTip: React.FC<DailyEcoTipProps> = ({ onRead }) => {
    const [tip, setTip] = useState<EcoTip | null>(null);
    const [aiTip, setAiTip] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [showAI, setShowAI] = useState(false);

    useEffect(() => {
        const dailyTip = ecoService.getDailyTip();
        setTip(dailyTip);
    }, []);

    const handleGetAITip = async () => {
        setLoading(true);
        setShowAI(true);
        try {
            const aiResponse = await ecoService.getAITip();
            setAiTip(aiResponse);
        } catch (error) {
            console.error('AI tip error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'water': return '#2196F3';
            case 'energy': return '#FFC107';
            case 'waste': return '#4CAF50';
            case 'transport': return '#9C27B0';
            case 'food': return '#FF5722';
            default: return Colors.primary;
        }
    };

    if (!tip) return null;

    return (
        <View style={styles.container}>
            <View style={[styles.header, { backgroundColor: getCategoryColor(tip.category) }]}>
                <Text style={styles.icon}>{tip.icon}</Text>
                <Text style={styles.headerTitle}>Günün Eko İpucu</Text>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>{tip.title}</Text>
                <Text style={styles.description}>{tip.description}</Text>

                {showAI && (
                    <View style={styles.aiSection}>
                        <Text style={styles.aiLabel}>🤖 AI Önerisi:</Text>
                        {loading ? (
                            <ActivityIndicator size="small" color={Colors.primary} />
                        ) : (
                            <Text style={styles.aiTip}>{aiTip}</Text>
                        )}
                    </View>
                )}

                {!showAI && (
                    <TouchableOpacity style={styles.aiButton} onPress={handleGetAITip}>
                        <Text style={styles.aiButtonText}>✨ AI'dan Yeni İpucu Al</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
    },
    icon: {
        fontSize: 24,
        marginRight: 10,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
    },
    content: {
        padding: 15,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.secondary,
        lineHeight: 22,
    },
    aiSection: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#F3E5F5',
        borderRadius: 10,
    },
    aiLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#7B1FA2',
        marginBottom: 6,
    },
    aiTip: {
        fontSize: 14,
        color: Colors.textDark,
        fontStyle: 'italic',
    },
    aiButton: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#E8F5E9',
        borderRadius: 10,
        alignItems: 'center',
    },
    aiButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.primary,
    },
});

export default DailyEcoTip;

import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { Colors } from '../constants/Colors';
import { useAuth } from '../contexts/AuthContext';
import GrowingTree from '../components/GrowingTree';
import { greenPointsService, UserGreenPoints, PointsHistoryItem, TREE_LEVELS } from '../services/greenPointsService';

type GreenPointsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'GreenPoints'>;

interface Props {
    navigation: GreenPointsScreenNavigationProp;
}

const GreenPointsScreen: React.FC<Props> = ({ navigation }) => {
    const { user } = useAuth();
    const [points, setPoints] = useState<UserGreenPoints | null>(null);
    const [history, setHistory] = useState<PointsHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        if (!user?.id) return;

        try {
            setLoading(true);
            const [userPoints, pointsHistory] = await Promise.all([
                greenPointsService.getUserPoints(user.id),
                greenPointsService.getPointsHistory(user.id, 10),
            ]);

            if (userPoints) {
                setPoints(userPoints);
            }
            setHistory(pointsHistory);
        } catch (error) {
            console.error('Veri yükleme hatası:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionIcon = (actionType: string) => {
        switch (actionType) {
            case 'waste_classification':
                return '♻️';
            case 'demand_shift':
                return '⚡';
            case 'daily_login':
                return '🌟';
            case 'streak_bonus':
                return '🔥';
            default:
                return '🌱';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    if (!points) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Puan bilgisi bulunamadı</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Ağaç Görünümü */}
            <GrowingTree
                treeLevel={points.tree_level}
                totalPoints={points.total_points}
                currentStreak={points.current_streak}
            />

            {/* Seviye Listesi */}
            <View style={styles.levelSection}>
                <Text style={styles.sectionTitle}>Ağaç Seviyeleri</Text>
                <View style={styles.levelList}>
                    {Object.entries(TREE_LEVELS).map(([level, info]) => {
                        const levelNum = parseInt(level);
                        const isCurrentLevel = levelNum === points.tree_level;
                        const isUnlocked = levelNum <= points.tree_level;

                        return (
                            <View
                                key={level}
                                style={[
                                    styles.levelItem,
                                    isCurrentLevel && styles.currentLevelItem,
                                    !isUnlocked && styles.lockedLevelItem,
                                ]}
                            >
                                <Text style={styles.levelEmoji}>{info.emoji}</Text>
                                <View style={styles.levelInfo}>
                                    <Text style={[
                                        styles.levelName,
                                        !isUnlocked && styles.lockedText,
                                    ]}>
                                        {info.name}
                                    </Text>
                                    <Text style={[
                                        styles.levelPoints,
                                        !isUnlocked && styles.lockedText,
                                    ]}>
                                        {info.minPoints}+ puan
                                    </Text>
                                </View>
                                {isCurrentLevel && (
                                    <View style={styles.currentBadge}>
                                        <Text style={styles.currentBadgeText}>Şu an</Text>
                                    </View>
                                )}
                                {!isUnlocked && (
                                    <Text style={styles.lockIcon}>🔒</Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>

            {/* Puan Geçmişi */}
            <View style={styles.historySection}>
                <Text style={styles.sectionTitle}>Son Aktiviteler</Text>
                {history.length > 0 ? (
                    <View style={styles.historyList}>
                        {history.map((item) => (
                            <View key={item.id} style={styles.historyItem}>
                                <Text style={styles.historyIcon}>{getActionIcon(item.action_type)}</Text>
                                <View style={styles.historyInfo}>
                                    <Text style={styles.historyDescription} numberOfLines={1}>
                                        {item.description}
                                    </Text>
                                    <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
                                </View>
                                <Text style={styles.historyPoints}>+{item.points_earned}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyHistory}>
                        <Text style={styles.emptyHistoryText}>Henüz aktivite yok</Text>
                        <Text style={styles.emptyHistorySubtext}>
                            Atık sınıflandırarak puan kazanmaya başlayın!
                        </Text>
                    </View>
                )}
            </View>
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

    // Seviye listesi
    levelSection: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textDark,
        marginBottom: 15,
    },
    levelList: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    levelItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    currentLevelItem: {
        backgroundColor: '#E8F5E9',
    },
    lockedLevelItem: {
        opacity: 0.6,
    },
    levelEmoji: {
        fontSize: 30,
        marginRight: 15,
    },
    levelInfo: {
        flex: 1,
    },
    levelName: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textDark,
    },
    levelPoints: {
        fontSize: 13,
        color: Colors.secondary,
        marginTop: 2,
    },
    lockedText: {
        color: Colors.secondary,
    },
    currentBadge: {
        backgroundColor: Colors.primary,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    currentBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    lockIcon: {
        fontSize: 18,
    },

    // Geçmiş
    historySection: {
        marginTop: 25,
    },
    historyList: {
        backgroundColor: 'white',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    historyIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    historyInfo: {
        flex: 1,
    },
    historyDescription: {
        fontSize: 14,
        color: Colors.textDark,
    },
    historyDate: {
        fontSize: 12,
        color: Colors.secondary,
        marginTop: 2,
    },
    historyPoints: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    emptyHistory: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 30,
        alignItems: 'center',
    },
    emptyHistoryText: {
        fontSize: 16,
        color: Colors.secondary,
        marginBottom: 8,
    },
    emptyHistorySubtext: {
        fontSize: 14,
        color: Colors.secondary,
        textAlign: 'center',
    },
});

export default GreenPointsScreen;

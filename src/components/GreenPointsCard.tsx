import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { TREE_LEVELS, getPointsToNextLevel } from '../services/greenPointsService';

interface GreenPointsCardProps {
    totalPoints: number;
    currentStreak: number;
    treeLevel: number;
    onPress?: () => void;
}

const GreenPointsCard: React.FC<GreenPointsCardProps> = ({
    totalPoints,
    currentStreak,
    treeLevel,
    onPress,
}) => {
    const levelInfo = TREE_LEVELS[treeLevel as keyof typeof TREE_LEVELS] || TREE_LEVELS[1];
    const progressInfo = getPointsToNextLevel(totalPoints);

    const progressPercent = treeLevel >= 5
        ? 100
        : Math.min(100, ((totalPoints - (TREE_LEVELS[(treeLevel) as keyof typeof TREE_LEVELS]?.minPoints || 0)) /
            (progressInfo.next - (TREE_LEVELS[(treeLevel) as keyof typeof TREE_LEVELS]?.minPoints || 0))) * 100);

    const CardContent = () => (
        <View style={styles.container}>
            {/* Sol Kısım - Ağaç ve Seviye */}
            <View style={styles.treeSection}>
                <Text style={styles.treeEmoji}>{levelInfo.emoji}</Text>
                <Text style={styles.levelText}>Lv. {treeLevel}</Text>
            </View>

            {/* Orta Kısım - Puan ve Progress */}
            <View style={styles.pointsSection}>
                <View style={styles.pointsRow}>
                    <Text style={styles.pointsValue}>{totalPoints}</Text>
                    <Text style={styles.pointsLabel}> Yeşil Puan</Text>
                </View>

                {treeLevel < 5 ? (
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{progressInfo.remaining} puan sonraki seviyeye</Text>
                    </View>
                ) : (
                    <Text style={styles.maxLevelText}>🏆 Maksimum seviye!</Text>
                )}
            </View>

            {/* Sağ Kısım - Streak */}
            {currentStreak > 0 && (
                <View style={styles.streakSection}>
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakEmoji}>🔥</Text>
                        <Text style={styles.streakValue}>{currentStreak}</Text>
                    </View>
                    <Text style={styles.streakLabel}>gün</Text>
                </View>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                <CardContent />
            </TouchableOpacity>
        );
    }

    return <CardContent />;
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
    },
    treeSection: {
        alignItems: 'center',
        marginRight: 15,
    },
    treeEmoji: {
        fontSize: 40,
    },
    levelText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
        marginTop: 4,
    },
    pointsSection: {
        flex: 1,
    },
    pointsRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 8,
    },
    pointsValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    pointsLabel: {
        fontSize: 14,
        color: Colors.secondary,
    },
    progressContainer: {
        width: '100%',
    },
    progressBar: {
        height: 6,
        backgroundColor: Colors.inputBackground,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 3,
    },
    progressText: {
        fontSize: 10,
        color: Colors.secondary,
    },
    maxLevelText: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: 'bold',
    },
    streakSection: {
        alignItems: 'center',
        marginLeft: 15,
    },
    streakBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    streakEmoji: {
        fontSize: 16,
        marginRight: 4,
    },
    streakValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FF6B6B',
    },
    streakLabel: {
        fontSize: 10,
        color: Colors.secondary,
        marginTop: 2,
    },
});

export default GreenPointsCard;

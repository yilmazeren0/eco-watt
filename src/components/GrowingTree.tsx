import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { TREE_LEVELS, getPointsToNextLevel } from '../services/greenPointsService';

interface GrowingTreeProps {
    treeLevel: number;
    totalPoints: number;
    currentStreak: number;
    compact?: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GrowingTree: React.FC<GrowingTreeProps> = ({
    treeLevel,
    totalPoints,
    currentStreak,
    compact = false,
}) => {
    const levelInfo = TREE_LEVELS[treeLevel as keyof typeof TREE_LEVELS] || TREE_LEVELS[1];
    const progressInfo = getPointsToNextLevel(totalPoints);

    // Animations
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const swayAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Scale in animation
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
        }).start();

        // Gentle sway animation for the tree
        if (treeLevel >= 3) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(swayAnim, {
                        toValue: 1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(swayAnim, {
                        toValue: -1,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(swayAnim, {
                        toValue: 0,
                        duration: 2000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [treeLevel]);

    const swayInterpolation = swayAnim.interpolate({
        inputRange: [-1, 0, 1],
        outputRange: ['-3deg', '0deg', '3deg'],
    });

    // Progress yüzdesi
    const progressPercent = treeLevel >= 5
        ? 100
        : Math.min(100, ((totalPoints - (TREE_LEVELS[(treeLevel) as keyof typeof TREE_LEVELS]?.minPoints || 0)) /
            (progressInfo.next - (TREE_LEVELS[(treeLevel) as keyof typeof TREE_LEVELS]?.minPoints || 0))) * 100);

    // Render tree based on level - Forest style
    const renderTree = () => {
        const treeScale = compact ? 0.6 : 1;

        switch (treeLevel) {
            case 1: // Tohum
                return (
                    <View style={[styles.treeWrapper, { transform: [{ scale: treeScale }] }]}>
                        {/* Toprak */}
                        <View style={styles.soil}>
                            <View style={styles.soilDark} />
                        </View>
                        {/* Tohum */}
                        <Animated.View style={[styles.seed, { transform: [{ scale: scaleAnim }] }]}>
                            <View style={styles.seedInner} />
                        </Animated.View>
                        {/* Küçük filiz */}
                        <View style={styles.tinySprout} />
                    </View>
                );

            case 2: // Fide
                return (
                    <View style={[styles.treeWrapper, { transform: [{ scale: treeScale }] }]}>
                        <View style={styles.soil}>
                            <View style={styles.soilDark} />
                        </View>
                        <Animated.View style={[styles.sproutContainer, { transform: [{ scale: scaleAnim }] }]}>
                            {/* Gövde */}
                            <View style={styles.sproutStem} />
                            {/* Sol yaprak */}
                            <View style={[styles.sproutLeaf, styles.sproutLeafLeft]} />
                            {/* Sağ yaprak */}
                            <View style={[styles.sproutLeaf, styles.sproutLeafRight]} />
                            {/* Üst yaprak */}
                            <View style={[styles.sproutLeaf, styles.sproutLeafTop]} />
                        </Animated.View>
                    </View>
                );

            case 3: // Küçük ağaç
                return (
                    <View style={[styles.treeWrapper, { transform: [{ scale: treeScale }] }]}>
                        <View style={styles.soil}>
                            <View style={styles.soilDark} />
                        </View>
                        <Animated.View style={[
                            styles.smallTreeContainer,
                            { transform: [{ scale: scaleAnim }, { rotate: swayInterpolation }] }
                        ]}>
                            {/* Gövde */}
                            <View style={styles.smallTrunk} />
                            {/* Yapraklar - alt katman */}
                            <View style={[styles.foliage, styles.foliageBottom]} />
                            {/* Yapraklar - orta katman */}
                            <View style={[styles.foliage, styles.foliageMiddle]} />
                            {/* Yapraklar - üst katman */}
                            <View style={[styles.foliage, styles.foliageTop]} />
                        </Animated.View>
                    </View>
                );

            case 4: // Orta ağaç
                return (
                    <View style={[styles.treeWrapper, { transform: [{ scale: treeScale }] }]}>
                        <View style={styles.soil}>
                            <View style={styles.soilDark} />
                        </View>
                        <Animated.View style={[
                            styles.mediumTreeContainer,
                            { transform: [{ scale: scaleAnim }, { rotate: swayInterpolation }] }
                        ]}>
                            {/* Gövde */}
                            <View style={styles.mediumTrunk} />
                            {/* Dal 1 */}
                            <View style={[styles.branch, styles.branchLeft]} />
                            {/* Dal 2 */}
                            <View style={[styles.branch, styles.branchRight]} />
                            {/* Yapraklar */}
                            <View style={[styles.mediumFoliage, styles.mediumFoliageBottom]} />
                            <View style={[styles.mediumFoliage, styles.mediumFoliageMiddle]} />
                            <View style={[styles.mediumFoliage, styles.mediumFoliageTop]} />
                            {/* Çiçekler */}
                            <View style={[styles.flower, { top: 30, left: 15 }]} />
                            <View style={[styles.flower, { top: 50, right: 10 }]} />
                        </Animated.View>
                    </View>
                );

            case 5: // Büyük ağaç
                return (
                    <View style={[styles.treeWrapper, { transform: [{ scale: treeScale }] }]}>
                        <View style={styles.soil}>
                            <View style={styles.soilDark} />
                        </View>
                        <Animated.View style={[
                            styles.largeTreeContainer,
                            { transform: [{ scale: scaleAnim }, { rotate: swayInterpolation }] }
                        ]}>
                            {/* Gövde */}
                            <View style={styles.largeTrunk} />
                            {/* Dallar */}
                            <View style={[styles.largeBranch, styles.largeBranchLeft1]} />
                            <View style={[styles.largeBranch, styles.largeBranchRight1]} />
                            <View style={[styles.largeBranch, styles.largeBranchLeft2]} />
                            <View style={[styles.largeBranch, styles.largeBranchRight2]} />
                            {/* Büyük yaprak kümesi */}
                            <View style={[styles.largeFoliage, styles.largeFoliageLayer1]} />
                            <View style={[styles.largeFoliage, styles.largeFoliageLayer2]} />
                            <View style={[styles.largeFoliage, styles.largeFoliageLayer3]} />
                            <View style={[styles.largeFoliage, styles.largeFoliageLayer4]} />
                            {/* Meyveler */}
                            <View style={[styles.fruit, { top: 40, left: 20 }]} />
                            <View style={[styles.fruit, { top: 60, right: 25 }]} />
                            <View style={[styles.fruit, { top: 80, left: 30 }]} />
                            {/* Çiçekler */}
                            <View style={[styles.flower, { top: 30, left: 40 }]} />
                            <View style={[styles.flower, { top: 55, right: 35 }]} />
                            <View style={[styles.flower, { top: 70, left: 15 }]} />
                        </Animated.View>
                        {/* Taç işareti */}
                        <View style={styles.crown}>
                            <Text style={styles.crownEmoji}>👑</Text>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                <View style={styles.compactTreeArea}>
                    {renderTree()}
                </View>
                <View style={styles.compactInfo}>
                    <Text style={styles.compactLevel}>{levelInfo.name}</Text>
                    <Text style={styles.compactPoints}>{totalPoints} puan</Text>
                </View>
                {currentStreak > 0 && (
                    <View style={styles.streakBadge}>
                        <Text style={styles.streakText}>🔥 {currentStreak}</Text>
                    </View>
                )}
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Arka plan gradient efekti */}
            <View style={styles.backgroundGradient}>
                <View style={styles.sky} />
                <View style={styles.ground} />
            </View>

            {/* Ağaç */}
            <View style={styles.treeArea}>
                {renderTree()}
            </View>

            {/* Seviye bilgisi */}
            <View style={styles.levelBadge}>
                <Text style={styles.levelBadgeText}>{levelInfo.name}</Text>
            </View>

            {/* İstatistikler */}
            <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{totalPoints}</Text>
                    <Text style={styles.statLabel}>Puan</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>🔥 {currentStreak}</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statItem}>
                    <Text style={styles.statValue}>Lv.{treeLevel}</Text>
                    <Text style={styles.statLabel}>Seviye</Text>
                </View>
            </View>

            {/* Progress Bar */}
            {treeLevel < 5 && (
                <View style={styles.progressSection}>
                    <View style={styles.progressBarContainer}>
                        <Animated.View
                            style={[
                                styles.progressBar,
                                { width: `${progressPercent}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressLabel}>
                        Sonraki seviyeye {progressInfo.remaining} puan
                    </Text>
                </View>
            )}

            {treeLevel >= 5 && (
                <View style={styles.maxLevelBadge}>
                    <Text style={styles.maxLevelText}>🏆 Maksimum Seviye Ulaşıldı!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 200,
    },
    sky: {
        flex: 1,
        backgroundColor: '#E8F5E9',
    },
    ground: {
        height: 40,
        backgroundColor: '#8D6E63',
    },
    treeArea: {
        height: 200,
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: 20,
    },
    treeWrapper: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    },

    // Toprak
    soil: {
        width: 80,
        height: 15,
        backgroundColor: '#6D4C41',
        borderRadius: 20,
        marginTop: 5,
    },
    soilDark: {
        position: 'absolute',
        bottom: 0,
        left: 5,
        right: 5,
        height: 8,
        backgroundColor: '#5D4037',
        borderRadius: 10,
    },

    // Seviye 1 - Tohum
    seed: {
        width: 24,
        height: 30,
        backgroundColor: '#8D6E63',
        borderRadius: 12,
        marginBottom: -5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    seedInner: {
        width: 10,
        height: 15,
        backgroundColor: '#6D4C41',
        borderRadius: 5,
    },
    tinySprout: {
        position: 'absolute',
        top: -15,
        width: 3,
        height: 12,
        backgroundColor: '#81C784',
        borderTopLeftRadius: 3,
        borderTopRightRadius: 3,
    },

    // Seviye 2 - Fide
    sproutContainer: {
        alignItems: 'center',
        marginBottom: -5,
    },
    sproutStem: {
        width: 6,
        height: 40,
        backgroundColor: '#66BB6A',
        borderRadius: 3,
    },
    sproutLeaf: {
        position: 'absolute',
        width: 25,
        height: 15,
        backgroundColor: '#81C784',
        borderRadius: 12,
    },
    sproutLeafLeft: {
        top: 10,
        left: -20,
        transform: [{ rotate: '-30deg' }],
    },
    sproutLeafRight: {
        top: 10,
        right: -20,
        transform: [{ rotate: '30deg' }],
    },
    sproutLeafTop: {
        top: -5,
        width: 20,
        height: 25,
        borderRadius: 10,
        backgroundColor: '#A5D6A7',
    },

    // Seviye 3 - Küçük ağaç
    smallTreeContainer: {
        alignItems: 'center',
        marginBottom: -5,
    },
    smallTrunk: {
        width: 12,
        height: 50,
        backgroundColor: '#8D6E63',
        borderRadius: 4,
    },
    foliage: {
        position: 'absolute',
        backgroundColor: '#66BB6A',
    },
    foliageBottom: {
        width: 70,
        height: 35,
        borderRadius: 35,
        top: 5,
    },
    foliageMiddle: {
        width: 55,
        height: 30,
        borderRadius: 27,
        top: -15,
        backgroundColor: '#81C784',
    },
    foliageTop: {
        width: 35,
        height: 25,
        borderRadius: 17,
        top: -35,
        backgroundColor: '#A5D6A7',
    },

    // Seviye 4 - Orta ağaç
    mediumTreeContainer: {
        alignItems: 'center',
        marginBottom: -5,
    },
    mediumTrunk: {
        width: 18,
        height: 70,
        backgroundColor: '#795548',
        borderRadius: 6,
    },
    branch: {
        position: 'absolute',
        width: 25,
        height: 8,
        backgroundColor: '#8D6E63',
        borderRadius: 4,
        top: 30,
    },
    branchLeft: {
        left: -20,
        transform: [{ rotate: '-25deg' }],
    },
    branchRight: {
        right: -20,
        transform: [{ rotate: '25deg' }],
    },
    mediumFoliage: {
        position: 'absolute',
        backgroundColor: '#4CAF50',
    },
    mediumFoliageBottom: {
        width: 90,
        height: 45,
        borderRadius: 45,
        top: 0,
    },
    mediumFoliageMiddle: {
        width: 70,
        height: 40,
        borderRadius: 35,
        top: -25,
        backgroundColor: '#66BB6A',
    },
    mediumFoliageTop: {
        width: 45,
        height: 35,
        borderRadius: 22,
        top: -50,
        backgroundColor: '#81C784',
    },
    flower: {
        position: 'absolute',
        width: 10,
        height: 10,
        backgroundColor: '#FFEB3B',
        borderRadius: 5,
    },

    // Seviye 5 - Büyük ağaç
    largeTreeContainer: {
        alignItems: 'center',
        marginBottom: -5,
    },
    largeTrunk: {
        width: 25,
        height: 90,
        backgroundColor: '#5D4037',
        borderRadius: 8,
    },
    largeBranch: {
        position: 'absolute',
        width: 35,
        height: 10,
        backgroundColor: '#6D4C41',
        borderRadius: 5,
    },
    largeBranchLeft1: {
        left: -30,
        top: 25,
        transform: [{ rotate: '-20deg' }],
    },
    largeBranchRight1: {
        right: -30,
        top: 25,
        transform: [{ rotate: '20deg' }],
    },
    largeBranchLeft2: {
        left: -25,
        top: 50,
        width: 25,
        transform: [{ rotate: '-35deg' }],
    },
    largeBranchRight2: {
        right: -25,
        top: 50,
        width: 25,
        transform: [{ rotate: '35deg' }],
    },
    largeFoliage: {
        position: 'absolute',
        backgroundColor: '#388E3C',
    },
    largeFoliageLayer1: {
        width: 120,
        height: 55,
        borderRadius: 55,
        top: -5,
    },
    largeFoliageLayer2: {
        width: 100,
        height: 50,
        borderRadius: 50,
        top: -35,
        backgroundColor: '#43A047',
    },
    largeFoliageLayer3: {
        width: 75,
        height: 45,
        borderRadius: 37,
        top: -60,
        backgroundColor: '#4CAF50',
    },
    largeFoliageLayer4: {
        width: 45,
        height: 35,
        borderRadius: 22,
        top: -85,
        backgroundColor: '#66BB6A',
    },
    fruit: {
        position: 'absolute',
        width: 12,
        height: 12,
        backgroundColor: '#E53935',
        borderRadius: 6,
    },
    crown: {
        position: 'absolute',
        top: 5,
        alignSelf: 'center',
    },
    crownEmoji: {
        fontSize: 24,
    },

    // Seviye badge
    levelBadge: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: Colors.primary,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 15,
    },
    levelBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },

    // İstatistikler
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#F5F5F5',
        paddingVertical: 15,
        marginHorizontal: 15,
        marginTop: 10,
        borderRadius: 12,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    statLabel: {
        fontSize: 11,
        color: Colors.secondary,
        marginTop: 2,
    },
    divider: {
        width: 1,
        backgroundColor: Colors.border,
    },

    // Progress
    progressSection: {
        margin: 15,
        marginTop: 10,
    },
    progressLabel: {
        fontSize: 11,
        color: Colors.secondary,
        textAlign: 'center',
        marginTop: 6,
    },
    progressBarContainer: {
        height: 10,
        backgroundColor: '#E0E0E0',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        backgroundColor: Colors.primary,
        borderRadius: 5,
    },
    maxLevelBadge: {
        backgroundColor: '#FFF8E1',
        margin: 15,
        marginTop: 10,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFD54F',
    },
    maxLevelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#F9A825',
    },

    // Compact styles
    compactContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    compactTreeArea: {
        width: 60,
        height: 70,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    compactInfo: {
        flex: 1,
        marginLeft: 10,
    },
    compactLevel: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    compactPoints: {
        fontSize: 12,
        color: Colors.secondary,
    },
    streakBadge: {
        backgroundColor: '#FFEBEE',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    streakText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#E53935',
    },
});

export default GrowingTree;

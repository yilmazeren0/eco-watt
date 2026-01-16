import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { ecoService, HABIT_TYPES } from '../services/ecoService';

interface HabitCheckInProps {
    userId: string;
    onCheckIn?: (habitType: string) => void;
}

const HabitCheckIn: React.FC<HabitCheckInProps> = ({ userId, onCheckIn }) => {
    const [checkedHabits, setCheckedHabits] = useState<string[]>([]);
    const [loading, setLoading] = useState<string | null>(null);

    useEffect(() => {
        loadTodayCheckIns();
    }, [userId]);

    const loadTodayCheckIns = async () => {
        const today = await ecoService.getTodayCheckIns(userId);
        setCheckedHabits(today);
    };

    const handleCheckIn = async (habitType: string) => {
        if (checkedHabits.includes(habitType)) {
            return; // Already checked
        }

        setLoading(habitType);
        try {
            const success = await ecoService.checkInHabit(userId, habitType);
            if (success) {
                setCheckedHabits([...checkedHabits, habitType]);
                const habit = HABIT_TYPES.find(h => h.id === habitType);
                if (habit) {
                    Alert.alert(
                        'Tebrikler! 🎉',
                        `${habit.name} için +${habit.points} puan kazandın!`,
                        [{ text: 'Harika!' }]
                    );
                }
                onCheckIn?.(habitType);
            }
        } catch (error) {
            console.error('Check-in error:', error);
        } finally {
            setLoading(null);
        }
    };

    const completedCount = checkedHabits.length;
    const totalCount = HABIT_TYPES.length;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>🌿 Günlük Çevreci Alışkanlıklar</Text>
                <View style={styles.progressBadge}>
                    <Text style={styles.progressText}>{completedCount}/{totalCount}</Text>
                </View>
            </View>

            <View style={styles.habitsGrid}>
                {HABIT_TYPES.map((habit) => {
                    const isChecked = checkedHabits.includes(habit.id);
                    const isLoading = loading === habit.id;

                    return (
                        <TouchableOpacity
                            key={habit.id}
                            style={[
                                styles.habitItem,
                                isChecked && styles.habitItemChecked,
                            ]}
                            onPress={() => handleCheckIn(habit.id)}
                            disabled={isChecked || isLoading}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.habitIcon}>{habit.icon}</Text>
                            <Text style={[
                                styles.habitName,
                                isChecked && styles.habitNameChecked
                            ]}>
                                {habit.name}
                            </Text>
                            {isChecked && (
                                <View style={styles.checkMark}>
                                    <Text style={styles.checkMarkText}>✓</Text>
                                </View>
                            )}
                            {!isChecked && (
                                <Text style={styles.habitPoints}>+{habit.points}</Text>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {completedCount === totalCount && (
                <View style={styles.completedBanner}>
                    <Text style={styles.completedText}>🌟 Bugün tüm alışkanlıkları tamamladın!</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors.textDark,
    },
    progressBadge: {
        backgroundColor: Colors.primary,
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 12,
    },
    progressText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    habitsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -5,
    },
    habitItem: {
        width: '30%',
        marginHorizontal: '1.5%',
        marginBottom: 10,
        padding: 12,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    habitItemChecked: {
        backgroundColor: '#E8F5E9',
        borderColor: Colors.primary,
    },
    habitIcon: {
        fontSize: 28,
        marginBottom: 6,
    },
    habitName: {
        fontSize: 11,
        color: Colors.textDark,
        textAlign: 'center',
        fontWeight: '500',
    },
    habitNameChecked: {
        color: Colors.primary,
    },
    habitPoints: {
        fontSize: 10,
        color: Colors.secondary,
        marginTop: 4,
    },
    checkMark: {
        position: 'absolute',
        top: 5,
        right: 5,
        backgroundColor: Colors.primary,
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkMarkText: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
    },
    completedBanner: {
        marginTop: 10,
        padding: 12,
        backgroundColor: '#FFF8E1',
        borderRadius: 10,
        alignItems: 'center',
    },
    completedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#F57C00',
    },
});

export default HabitCheckIn;

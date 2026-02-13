'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TOEICPart } from '@/types/question';
import { VocabularyProgress } from '@/types/vocabulary';
import { DiaryEntry } from '@/types/diary';

// グローバル状態の型定義
export interface AppStats {
    totalAnswered: number;
    totalCorrect: number;
    partStats: {
        [key in TOEICPart]: {
            answered: number;
            correct: number;
        };
    };
    vocabStats: {
        totalWords: number;
        masteredWords: number;
        weakWords: VocabularyProgress[];
    };
    diaryEntries: DiaryEntry[];
    studyTime: number; // 総学習時間（分）
    dailyHistory: {
        date: string;
        answered: number;
        correct: number;
        studyTime: number;
    }[];
}

interface AppContextType {
    stats: AppStats;
    updateQuizStats: (part: TOEICPart, correct: number, total: number, timeSpent: number) => void;
    updateVocabStats: (progress: VocabularyProgress[]) => void;
    addDiaryEntry: (entry: DiaryEntry) => void;
    getWeakWords: () => VocabularyProgress[];
    getTodayStats: () => { answered: number; correct: number; accuracy: number; studyTime: number };
    getRecentHistory: (days: number) => AppStats['dailyHistory'];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'toeic_master_app_stats';

// 初期状態
const initialStats: AppStats = {
    totalAnswered: 0,
    totalCorrect: 0,
    partStats: {
        1: { answered: 0, correct: 0 },
        2: { answered: 0, correct: 0 },
        3: { answered: 0, correct: 0 },
        4: { answered: 0, correct: 0 },
        5: { answered: 0, correct: 0 },
        6: { answered: 0, correct: 0 },
        7: { answered: 0, correct: 0 },
    },
    vocabStats: {
        totalWords: 1000,
        masteredWords: 0,
        weakWords: [],
    },
    diaryEntries: [],
    studyTime: 0,
    dailyHistory: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
    const [stats, setStats] = useState<AppStats>(initialStats);
    const [isLoaded, setIsLoaded] = useState(false);

    // LocalStorageから読み込み
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setStats(parsed);
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
        setIsLoaded(true);
    }, []);

    // LocalStorageに保存
    useEffect(() => {
        if (!isLoaded) return;
        if (typeof window === 'undefined') return;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    }, [stats, isLoaded]);

    // クイズ統計更新
    const updateQuizStats = (part: TOEICPart, correct: number, total: number, timeSpent: number) => {
        setStats(prev => {
            const today = new Date().toISOString().split('T')[0];

            // 今日の履歴を更新
            let dailyHistory = [...prev.dailyHistory];
            const todayIndex = dailyHistory.findIndex(h => h.date === today);

            if (todayIndex >= 0) {
                dailyHistory[todayIndex] = {
                    ...dailyHistory[todayIndex],
                    answered: dailyHistory[todayIndex].answered + total,
                    correct: dailyHistory[todayIndex].correct + correct,
                    studyTime: dailyHistory[todayIndex].studyTime + timeSpent,
                };
            } else {
                dailyHistory.push({
                    date: today,
                    answered: total,
                    correct: correct,
                    studyTime: timeSpent,
                });
            }

            // 最新7日間のみ保持
            dailyHistory = dailyHistory.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);

            return {
                ...prev,
                totalAnswered: prev.totalAnswered + total,
                totalCorrect: prev.totalCorrect + correct,
                studyTime: prev.studyTime + timeSpent,
                partStats: {
                    ...prev.partStats,
                    [part]: {
                        answered: prev.partStats[part].answered + total,
                        correct: prev.partStats[part].correct + correct,
                    },
                },
                dailyHistory,
            };
        });
    };

    // 単語統計更新
    const updateVocabStats = (progress: VocabularyProgress[]) => {
        setStats(prev => {
            const masteredWords = progress.filter(p => p.isMastered).length;
            const weakWords = progress
                .filter(p => !p.isMastered && p.incorrectCount > 0)
                .sort((a, b) => {
                    // 正答率が低い順
                    const aRate = a.correctCount / (a.correctCount + a.incorrectCount || 1);
                    const bRate = b.correctCount / (b.correctCount + b.incorrectCount || 1);
                    return aRate - bRate;
                })
                .slice(0, 50); // 上位50個の苦手単語

            return {
                ...prev,
                vocabStats: {
                    ...prev.vocabStats,
                    masteredWords,
                    weakWords,
                },
            };
        });
    };

    // 日記追加
    const addDiaryEntry = (entry: DiaryEntry) => {
        setStats(prev => ({
            ...prev,
            diaryEntries: [entry, ...prev.diaryEntries].slice(0, 100), // 最新100件
        }));
    };

    // 苦手単語取得
    const getWeakWords = () => {
        return stats.vocabStats.weakWords;
    };

    // 今日の統計取得
    const getTodayStats = () => {
        const today = new Date().toISOString().split('T')[0];
        const todayData = stats.dailyHistory.find(h => h.date === today);

        if (!todayData) {
            return { answered: 0, correct: 0, accuracy: 0, studyTime: 0 };
        }

        return {
            answered: todayData.answered,
            correct: todayData.correct,
            accuracy: todayData.answered > 0 ? (todayData.correct / todayData.answered) * 100 : 0,
            studyTime: todayData.studyTime,
        };
    };

    // 直近履歴取得
    const getRecentHistory = (days: number) => {
        return stats.dailyHistory.slice(0, days).reverse();
    };

    return (
        <AppContext.Provider
            value={{
                stats,
                updateQuizStats,
                updateVocabStats,
                addDiaryEntry,
                getWeakWords,
                getTodayStats,
                getRecentHistory,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext must be used within AppProvider');
    }
    return context;
}

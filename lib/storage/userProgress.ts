// データ永続化ロジック - LocalStorage

import { UserProgress, DailyStats } from '@/types/userStats';
import { VocabularyProgress } from '@/types/vocabulary';
import { DiaryEntry } from '@/types/diary';
import { PracticeSession } from '@/types/question';

const STORAGE_KEYS = {
    USER_PROGRESS: 'toeic_user_progress',
    VOCABULARY_PROGRESS: 'toeic_vocabulary_progress',
    DIARY_ENTRIES: 'toeic_diary_entries',
    PRACTICE_SESSIONS: 'toeic_practice_sessions',
};

// ユーザー進捗データの取得
export function getUserProgress(): UserProgress | null {
    if (typeof window === 'undefined') return null;

    const data = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
    if (!data) return null;

    const progress = JSON.parse(data);
    progress.lastUpdated = new Date(progress.lastUpdated);
    progress.dailyStats = progress.dailyStats.map((stat: any) => ({
        ...stat,
    }));

    return progress;
}

// ユーザー進捗データの保存
export function saveUserProgress(progress: UserProgress): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
}

// 初期ユーザー進捗データの作成
export function initializeUserProgress(): UserProgress {
    const today = new Date().toISOString().split('T')[0];

    const initialProgress: UserProgress = {
        userId: 'local_user',
        totalQuestionsAnswered: 0,
        totalCorrectAnswers: 0,
        overallAccuracy: 0,
        estimatedTOEICScore: 0,
        dailyStats: [{
            date: today,
            studyTime: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            accuracy: 0,
        }],
        partStats: [1, 2, 3, 4, 5, 6, 7].map(part => ({
            part: part as any,
            totalAnswered: 0,
            correctAnswers: 0,
            accuracy: 0,
        })),
        weakPoints: [],
        lastUpdated: new Date(),
    };

    saveUserProgress(initialProgress);
    return initialProgress;
}

// 今日の統計を取得
export function getTodayStats(): DailyStats {
    const progress = getUserProgress();
    const today = new Date().toISOString().split('T')[0];

    if (!progress) {
        return {
            date: today,
            studyTime: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            accuracy: 0,
        };
    }

    const todayStats = progress.dailyStats.find(stat => stat.date === today);

    if (todayStats) {
        return todayStats;
    }

    // 今日の統計が存在しない場合は新規作成
    const newTodayStats: DailyStats = {
        date: today,
        studyTime: 0,
        questionsAnswered: 0,
        correctAnswers: 0,
        accuracy: 0,
    };

    progress.dailyStats.push(newTodayStats);
    saveUserProgress(progress);

    return newTodayStats;
}

// 直近7日間の統計を取得
export function getRecentStats(days: number = 7): DailyStats[] {
    const progress = getUserProgress();
    if (!progress) return [];

    // 日付でソート（新しい順）
    const sorted = [...progress.dailyStats].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return sorted.slice(0, days).reverse(); // 古い順に戻す
}

// 練習セッションの保存
export function savePracticeSession(session: PracticeSession): void {
    if (typeof window === 'undefined') return;

    const sessions = getPracticeSessions();
    sessions.push(session);
    localStorage.setItem(STORAGE_KEYS.PRACTICE_SESSIONS, JSON.stringify(sessions));

    // ユーザー進捗も更新
    updateProgressFromSession(session);
}

// 練習セッションの取得
export function getPracticeSessions(): PracticeSession[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEYS.PRACTICE_SESSIONS);
    if (!data) return [];

    return JSON.parse(data);
}

// セッションからユーザー進捗を更新
function updateProgressFromSession(session: PracticeSession): void {
    let progress = getUserProgress();
    if (!progress) {
        progress = initializeUserProgress();
    }

    const today = new Date().toISOString().split('T')[0];

    // 全体統計を更新
    progress.totalQuestionsAnswered += session.results.length;
    progress.totalCorrectAnswers += session.results.filter(r => r.isCorrect).length;
    progress.overallAccuracy = (progress.totalCorrectAnswers / progress.totalQuestionsAnswered) * 100;

    // 今日の統計を更新
    let todayStats = progress.dailyStats.find(stat => stat.date === today);
    if (!todayStats) {
        todayStats = {
            date: today,
            studyTime: 0,
            questionsAnswered: 0,
            correctAnswers: 0,
            accuracy: 0,
        };
        progress.dailyStats.push(todayStats);
    }

    const sessionDuration = session.endTime
        ? (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
        : 0;

    todayStats.studyTime += sessionDuration;
    todayStats.questionsAnswered += session.results.length;
    todayStats.correctAnswers += session.results.filter(r => r.isCorrect).length;
    todayStats.accuracy = (todayStats.correctAnswers / todayStats.questionsAnswered) * 100;

    // パート別統計を更新
    const partStat = progress.partStats.find(p => p.part === session.part);
    if (partStat) {
        partStat.totalAnswered += session.results.length;
        partStat.correctAnswers += session.results.filter(r => r.isCorrect).length;
        partStat.accuracy = (partStat.correctAnswers / partStat.totalAnswered) * 100;
    }

    progress.lastUpdated = new Date();
    saveUserProgress(progress);
}

// 単語進捗の保存
export function saveVocabularyProgress(wordProgress: VocabularyProgress[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.VOCABULARY_PROGRESS, JSON.stringify(wordProgress));
}

// 単語進捗の取得
export function getVocabularyProgress(): VocabularyProgress[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEYS.VOCABULARY_PROGRESS);
    if (!data) return [];

    return JSON.parse(data);
}

// 日記エントリーの保存
export function saveDiaryEntry(entry: DiaryEntry): void {
    if (typeof window === 'undefined') return;

    const entries = getDiaryEntries();
    const existingIndex = entries.findIndex(e => e.id === entry.id);

    if (existingIndex >= 0) {
        entries[existingIndex] = entry;
    } else {
        entries.push(entry);
    }

    localStorage.setItem(STORAGE_KEYS.DIARY_ENTRIES, JSON.stringify(entries));
}

// 日記エントリーの取得
export function getDiaryEntries(): DiaryEntry[] {
    if (typeof window === 'undefined') return [];

    const data = localStorage.getItem(STORAGE_KEYS.DIARY_ENTRIES);
    if (!data) return [];

    return JSON.parse(data);
}

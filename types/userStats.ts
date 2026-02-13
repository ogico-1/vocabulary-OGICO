// ユーザー統計データの型定義

import { TOEICPart } from './question';

export interface DailyStats {
    date: string; // YYYY-MM-DD
    studyTime: number; // 分
    questionsAnswered: number;
    correctAnswers: number;
    accuracy: number; // パーセンテージ
}

export interface PartStats {
    part: TOEICPart;
    totalAnswered: number;
    correctAnswers: number;
    accuracy: number;
}

export interface WeakPoint {
    category: string; // 品詞、文法項目など
    description: string;
    incorrectCount: number;
    examples: string[]; // 間違えた問題ID
}

export interface UserProgress {
    userId: string;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
    overallAccuracy: number;
    estimatedTOEICScore: number;
    dailyStats: DailyStats[];
    partStats: PartStats[];
    weakPoints: WeakPoint[];
    lastUpdated: Date;
}

export interface MockTestResult {
    id: string;
    date: Date;
    score: number;
    partScores: Record<TOEICPart, number>;
    accuracy: number;
    partAccuracy: Record<TOEICPart, number>;
    weakPoints: WeakPoint[];
}

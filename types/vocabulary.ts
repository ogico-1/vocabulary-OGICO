// 単語学習の型定義

export type VocabularyLevel = 1 | 2 | 3; // 1: ~600, 2: ~750, 3: 800+

export interface VocabularyWord {
    id: string;
    word: string;
    pronunciation: string; // 発音記号
    audioUrl: string; // 音声URL
    meaning: string; // 和訳
    synonyms: string[]; // 類義語
    antonyms: string[]; // 反意語
    collocations: string[]; // よく使う語の塊
    exampleSentence: string; // 例文（TOEIC形式）
    exampleTranslation: string; // 例文和訳
    level: VocabularyLevel;
    category: string; // ビジネス、技術、学術など
}

export interface VocabularyProgress {
    wordId: string;
    correctCount: number;
    incorrectCount: number;
    lastReviewed: Date;
    nextReview: Date; // 間隔反復アルゴリズムで計算
    masteryLevel: number; // 0-5
    isMastered: boolean; // masteryLevel >= 4
}

export interface VocabularySession {
    id: string;
    level: VocabularyLevel;
    wordsStudied: string[]; // word IDs
    correctAnswers: number;
    incorrectAnswers: number;
    startTime: Date;
    endTime?: Date;
}

export interface VocabularyStats {
    totalWords: number;
    masteredWords: number;
    level1Mastered: number;
    level2Mastered: number;
    level3Mastered: number;
    weakWords: VocabularyProgress[]; // 復習優先リスト
}

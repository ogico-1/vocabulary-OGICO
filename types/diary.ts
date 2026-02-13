// 英語日記の型定義

export interface DiaryEntry {
    id: string;
    date: Date;
    originalText: string;
    correctedText?: string;
    corrections?: Correction[];
    suggestions?: string[]; // よりネイティブらしい表現提案
    isCorrected: boolean;
}

export interface Correction {
    id: string;
    originalText: string;
    correctedText: string;
    reason: string; // 修正理由
    category: string; // 文法、語彙、スペルなど
    startIndex: number;
    endIndex: number;
}

export interface DiaryStats {
    totalEntries: number;
    totalCorrections: number;
    commonMistakes: {
        category: string;
        count: number;
        examples: string[];
    }[];
    improvementScore: number; // 0-100, 最近のエントリーの質
}

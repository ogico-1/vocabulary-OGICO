// TOEIC問題の型定義

export type TOEICPart = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface Question {
  id: string;
  part: TOEICPart;
  difficulty: Difficulty;
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-3のインデックス
  audioUrl?: string; // Part 1-4用
  imageUrl?: string; // Part 1用
  passage?: string; // Part 6-7用
}

// クリック可能な解説塊
export interface ExplanationChunk {
  id: string;
  text: string;
  grammarPoint?: string; // 文法ポイント
  meaning: string; // 意味
  role: string; // この塊の役割（主語、述語など）
  toeicTip?: string; // TOEIC頻出ポイント
  whyThisAnswer?: string; // なぜこの選択肢か
}

export interface QuestionExplanation {
  questionId: string;
  chunks: ExplanationChunk[];
  fullTranslation: string; // 全文和訳
  paraphrase?: string; // パラフレーズ解説
  questionIntent: string; // 出題意図
  attackStrategy: string; // 同タイプ問題の攻略法
}

export interface QuestionResult {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number; // 秒
}

export interface PracticeSession {
  id: string;
  part: TOEICPart;
  difficulty: Difficulty;
  questions: Question[];
  results: QuestionResult[];
  startTime: Date;
  endTime?: Date;
  score: number;
  accuracy: number;
}

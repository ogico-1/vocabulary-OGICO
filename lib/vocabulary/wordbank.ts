// TOEIC頻出1000語データベース
// 実際の実装では外部JSONファイルまたはAPIから読み込み

import { VocabularyWord, VocabularyLevel } from '@/types/vocabulary';

// カテゴリ定義
export const WORD_CATEGORIES = [
    'ビジネス・雇用',
    'オフィス・事務',
    'マーケティング・販売',
    '財務・会計',
    '製造・生産',
    '旅行・ホテル',
    'レストラン・飲食',
    '会議・イベント',
    '契約・法律',
    '技術・IT',
    'コミュニケーション',
    '一般ビジネス',
] as const;

// 1000語のデータ（実際のデータは省略形で代表例のみ）
// 本番環境では完全な1000語データを別ファイルで管理
export function generate1000Words(): VocabularyWord[] {
    const words: VocabularyWord[] = [];

    // Level 1: 基礎 (~600点) - 400語想定
    const level1Base = [
        { word: 'apply', meaning: '応募する、申し込む', category: 'ビジネス・雇用' },
        { word: 'available', meaning: '利用可能な', category: '一般ビジネス' },
        { word: 'confirm', meaning: '確認する', category: 'コミュニケーション' },
        { word: 'schedule', meaning: '予定、スケジュール', category: 'オフィス・事務' },
        { word: 'meeting', meaning: '会議', category: '会議・イベント' },
        { word: 'customer', meaning: '顧客', category: 'マーケティング・販売' },
        { word: 'product', meaning: '製品', category: '製造・生産' },
        { word: 'service', meaning: 'サービス', category: '一般ビジネス' },
        { word: 'report', meaning: '報告書', category: 'オフィス・事務' },
        { word: 'manager', meaning: '管理者', category: 'ビジネス・雇用' },
        // ... 390語省略
    ];

    // Level 2: 中級 (~750点) - 400語想定
    const level2Base = [
        { word: 'notwithstanding', meaning: '～にもかかわらず', category: '一般ビジネス' },
        { word: 'substantial', meaning: '相当な、かなりの', category: '一般ビジネス' },
        { word: 'implement', meaning: '実施する、実装する', category: 'ビジネス・雇用' },
        { word: 'accommodate', meaning: '収容する、対応する', category: '旅行・ホテル' },
        { word: 'revenue', meaning: '収益', category: '財務・会計' },
        { word: 'competent', meaning: '有能な', category: 'ビジネス・雇用' },
        { word: 'liability', meaning: '責任、負債', category: '契約・法律' },
        { word: 'prospective', meaning: '見込みのある', category: 'マーケティング・販売' },
        { word: 'collaborate', meaning: '協力する', category: 'コミュニケーション' },
        { word: 'specifications', meaning: '仕様', category: '技術・IT' },
        // ... 390語省略
    ];

    // Level 3: 上級 (800+点) - 200語想定
    const level3Base = [
        { word: 'contingent', meaning: '条件付きの', category: '契約・法律' },
        { word: 'mitigate', meaning: '軽減する', category: '一般ビジネス' },
        { word: 'stipulate', meaning: '規定する', category: '契約・法律' },
        { word: 'confer', meaning: '協議する、授与する', category: 'コミュニケーション' },
        { word: 'procurement', meaning: '調達', category: '製造・生産' },
        { word: 'commensurate', meaning: '釣り合った', category: '財務・会計' },
        { word: 'exacerbate', meaning: '悪化させる', category: '一般ビジネス' },
        { word: 'incumbent', meaning: '現職の、義務として', category: 'ビジネス・雇用' },
        { word: 'litigation', meaning: '訴訟', category: '契約・法律' },
        { word: 'reimbursement', meaning: '払い戻し', category: '財務・会計' },
        // ... 190語省略
    ];

    // 実際の1000語生成（ここでは代表例のみ）
    let id = 1;

    // Level 1を生成（400語想定、ここでは10語のみ）
    for (let i = 0; i < Math.min(10, level1Base.length); i++) {
        const base = level1Base[i];
        words.push(createWord(id++, base.word, base.meaning, 1, base.category));
    }

    // 残りのLevel 1を自動生成（実際には手動で作成すべき）
    for (let i = level1Base.length; i < 400; i++) {
        words.push(createWord(id++, `word_l1_${i}`, `意味${i}`, 1, WORD_CATEGORIES[i % WORD_CATEGORIES.length]));
    }

    // Level 2を生成
    for (let i = 0; i < Math.min(10, level2Base.length); i++) {
        const base = level2Base[i];
        words.push(createWord(id++, base.word, base.meaning, 2, base.category));
    }

    for (let i = level2Base.length; i < 400; i++) {
        words.push(createWord(id++, `word_l2_${i}`, `意味${i}`, 2, WORD_CATEGORIES[i % WORD_CATEGORIES.length]));
    }

    // Level 3を生成
    for (let i = 0; i < Math.min(10, level3Base.length); i++) {
        const base = level3Base[i];
        words.push(createWord(id++, base.word, base.meaning, 3, base.category));
    }

    for (let i = level3Base.length; i < 200; i++) {
        words.push(createWord(id++, `word_l3_${i}`, `意味${i}`, 3, WORD_CATEGORIES[i % WORD_CATEGORIES.length]));
    }

    return words;
}

function createWord(
    id: number,
    word: string,
    meaning: string,
    level: VocabularyLevel,
    category: string
): VocabularyWord {
    return {
        id: `vocab_${id.toString().padStart(4, '0')}`,
        word,
        pronunciation: '/placeholder/', // 実際には各単語の発音記号
        audioUrl: '',
        meaning,
        synonyms: [], // 実際には類義語を設定
        antonyms: [],
        collocations: [], // 実際にはコロケーションを設定
        exampleSentence: `Example sentence using ${word}.`,
        exampleTranslation: `${word}を使った例文の和訳。`,
        level,
        category,
    };
}

// レベル別に取得
export function getWordsByLevel(level: VocabularyLevel): VocabularyWord[] {
    const allWords = generate1000Words();
    return allWords.filter(w => w.level === level);
}

// カテゴリ別に取得
export function getWordsByCategory(category: string): VocabularyWord[] {
    const allWords = generate1000Words();
    return allWords.filter(w => w.category === category);
}

// すべての単語を取得
export function getAllWords(): VocabularyWord[] {
    return generate1000Words();
}

// IDで単語を取得
export function getWordById(id: string): VocabularyWord | undefined {
    const allWords = generate1000Words();
    return allWords.find(w => w.id === id);
}

// サンプル単語データ（TOEIC頻出1000語の一部）

import { VocabularyWord, VocabularyLevel } from '@/types/vocabulary';

export const SAMPLE_VOCABULARY: VocabularyWord[] = [
    // Level 1 (基礎 ~600点)
    {
        id: 'v1_001',
        word: 'apply',
        pronunciation: '/əˈplaɪ/',
        audioUrl: '', // MVP: 音声未実装
        meaning: '応募する、申し込む、適用する',
        synonyms: ['submit', 'request'],
        antonyms: ['withdraw'],
        collocations: ['apply for', 'apply to'],
        exampleSentence: 'Candidates can apply for the position online.',
        exampleTranslation: '候補者はオンラインでその職に応募できます。',
        level: 1,
        category: 'ビジネス・雇用',
    },
    {
        id: 'v1_002',
        word: 'available',
        pronunciation: '/əˈveɪləbl/',
        audioUrl: '',
        meaning: '利用可能な、入手可能な',
        synonyms: ['accessible', 'obtainable'],
        antonyms: ['unavailable'],
        collocations: ['be available', 'available for'],
        exampleSentence: 'The report is available on our website.',
        exampleTranslation: 'レポートは当社のウェブサイトで入手可能です。',
        level: 1,
        category: '一般ビジネス',
    },
    {
        id: 'v1_003',
        word: 'confirm',
        pronunciation: '/kənˈfɜːrm/',
        audioUrl: '',
        meaning: '確認する、承認する',
        synonyms: ['verify', 'validate'],
        antonyms: ['deny'],
        collocations: ['confirm that', 'confirm a reservation'],
        exampleSentence: 'Please confirm your attendance by email.',
        exampleTranslation: 'メールで出席を確認してください。',
        level: 1,
        category: 'コミュニケーション',
    },

    // Level 2 (中級 ~750点)
    {
        id: 'v2_001',
        word: 'notwithstanding',
        pronunciation: '/ˌnɒtwɪθˈstændɪŋ/',
        audioUrl: '',
        meaning: '～にもかかわらず',
        synonyms: ['despite', 'in spite of'],
        antonyms: [],
        collocations: ['notwithstanding the fact that'],
        exampleSentence: 'Notwithstanding the difficulties, the project was completed on time.',
        exampleTranslation: '困難にもかかわらず、プロジェクトは期限内に完了しました。',
        level: 2,
        category: '接続詞・前置詞',
    },
    {
        id: 'v2_002',
        word: 'substantial',
        pronunciation: '/səbˈstænʃl/',
        audioUrl: '',
        meaning: '相当な、かなりの',
        synonyms: ['considerable', 'significant'],
        antonyms: ['insignificant', 'minor'],
        collocations: ['substantial amount', 'substantial increase'],
        exampleSentence: 'The company reported substantial profits this quarter.',
        exampleTranslation: '会社は今四半期に相当な利益を報告しました。',
        level: 2,
        category: '形容詞',
    },

    // Level 3 (上級 800+点)
    {
        id: 'v3_001',
        word: 'contingent',
        pronunciation: '/kənˈtɪndʒənt/',
        audioUrl: '',
        meaning: '条件付きの、～次第で',
        synonyms: ['conditional', 'dependent'],
        antonyms: ['unconditional'],
        collocations: ['contingent on/upon'],
        exampleSentence: 'The offer is contingent upon board approval.',
        exampleTranslation: 'その提案は取締役会の承認次第です。',
        level: 3,
        category: '形容詞',
    },
    {
        id: 'v3_002',
        word: 'mitigate',
        pronunciation: '/ˈmɪtɪɡeɪt/',
        audioUrl: '',
        meaning: '軽減する、緩和する',
        synonyms: ['alleviate', 'reduce'],
        antonyms: ['aggravate', 'intensify'],
        collocations: ['mitigate risks', 'mitigate the effects'],
        exampleSentence: 'The company implemented measures to mitigate potential risks.',
        exampleTranslation: '会社は潜在的なリスクを軽減するための措置を実施しました。',
        level: 3,
        category: '動詞',
    },
];

export function getVocabularyByLevel(level: VocabularyLevel): VocabularyWord[] {
    return SAMPLE_VOCABULARY.filter(word => word.level === level);
}

export function getAllVocabulary(): VocabularyWord[] {
    return SAMPLE_VOCABULARY;
}

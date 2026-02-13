// AI問題生成ロジック (MVP: サンプル問題を返す、将来的にOpenAI API統合)

import { Question, QuestionExplanation, ExplanationChunk, TOEICPart, Difficulty } from '@/types/question';

// MVP: サンプル問題を返す（開発用）
// 本番ではOpenAI APIを使用して動的生成
export async function generateQuestions(
    part: TOEICPart,
    difficulty: Difficulty,
    count: number = 10
): Promise<Question[]> {
    // MVP実装: Part 5のサンプル問題のみ
    if (part === 5) {
        return getSamplePart5Questions(difficulty, count);
    }

    // 他のパートは将来実装
    return [];
}

// Part 5サンプル問題
function getSamplePart5Questions(difficulty: Difficulty, count: number): Question[] {
    const allQuestions: Question[] = [
        // Easy問題
        {
            id: 'p5_easy_1',
            part: 5,
            difficulty: 'easy',
            questionText: 'The company announced that it ------- a new product next month.',
            options: ['will launch', 'launching', 'launched', 'launches'],
            correctAnswer: 0,
        },
        {
            id: 'p5_easy_2',
            part: 5,
            difficulty: 'easy',
            questionText: 'Please submit your report ------- Friday.',
            options: ['on', 'at', 'by', 'in'],
            correctAnswer: 2,
        },
        {
            id: 'p5_easy_3',
            part: 5,
            difficulty: 'easy',
            questionText: 'The manager was very ------- with the team\'s performance.',
            options: ['satisfy', 'satisfied', 'satisfaction', 'satisfying'],
            correctAnswer: 1,
        },

        // Normal問題
        {
            id: 'p5_normal_1',
            part: 5,
            difficulty: 'normal',
            questionText: 'Although the shipment was delayed ------- weather conditions, customers were notified immediately.',
            options: ['because', 'due to', 'despite', 'in spite of'],
            correctAnswer: 1,
        },
        {
            id: 'p5_normal_2',
            part: 5,
            difficulty: 'normal',
            questionText: 'The new marketing strategy has proven to be highly ------- in increasing sales.',
            options: ['effect', 'effective', 'effectively', 'effectiveness'],
            correctAnswer: 1,
        },
        {
            id: 'p5_normal_3',
            part: 5,
            difficulty: 'normal',
            questionText: 'Employees are required to ------- their supervisor before taking any days off.',
            options: ['notify', 'explain', 'describe', 'mention'],
            correctAnswer: 0,
        },

        // Hard問題
        {
            id: 'p5_hard_1',
            part: 5,
            difficulty: 'hard',
            questionText: '------- the extensive research conducted by the team, the board decided to postpone the project.',
            options: ['Regardless', 'Notwithstanding', 'Despite', 'Although'],
            correctAnswer: 1,
        },
        {
            id: 'p5_hard_2',
            part: 5,
            difficulty: 'hard',
            questionText: 'The auditor\'s report was ------- detailed that it took three days to review all the findings.',
            options: ['so', 'such', 'very', 'too'],
            correctAnswer: 0,
        },
        {
            id: 'p5_hard_3',
            part: 5,
            difficulty: 'hard',
            questionText: 'Had the proposal been submitted on time, it ------- approved by the committee.',
            options: ['will be', 'would be', 'would have been', 'will have been'],
            correctAnswer: 2,
        },
    ];

    // 難易度でフィルタリング
    const filtered = allQuestions.filter(q => q.difficulty === difficulty);

    // ランダムに選択
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
}

// 解説生成（塊構造）
export async function generateExplanation(question: Question): Promise<QuestionExplanation> {
    // MVP実装: Part 5のサンプル解説
    const explanations: Record<string, QuestionExplanation> = {
        'p5_easy_1': {
            questionId: 'p5_easy_1',
            chunks: [
                {
                    id: 'chunk_1',
                    text: 'The company announced',
                    meaning: '会社は発表した',
                    role: '主節（主語＋動詞）',
                    grammarPoint: '過去形の動詞',
                },
                {
                    id: 'chunk_2',
                    text: 'that it ------- a new product',
                    meaning: '新製品をローンチすると',
                    role: 'that節（目的語）',
                    grammarPoint: '未来を表す助動詞 + 動詞原形',
                    toeicTip: 'that節内の時制に注意。next monthがあるので未来形が必要。',
                    whyThisAnswer: '"next month"という未来を示す語句があるため、未来形"will launch"が正解。',
                },
                {
                    id: 'chunk_3',
                    text: 'next month',
                    meaning: '来月',
                    role: '時を表す副詞句',
                    grammarPoint: '未来を示す時間表現',
                },
            ],
            fullTranslation: '会社は来月新製品をローンチすると発表しました。',
            paraphrase: 'The company made an announcement about launching a new product in the coming month.',
            questionIntent: '時制の理解（未来形の適切な使用）',
            attackStrategy: '時間を表す語句（next month, tomorrow, soon等）を見つけたら、それに合った時制を選ぶ。',
        },
        'p5_easy_2': {
            questionId: 'p5_easy_2',
            chunks: [
                {
                    id: 'chunk_1',
                    text: 'Please submit',
                    meaning: '提出してください',
                    role: '命令文（動詞）',
                    grammarPoint: '命令形',
                },
                {
                    id: 'chunk_2',
                    text: 'your report',
                    meaning: 'あなたのレポートを',
                    role: '目的語',
                },
                {
                    id: 'chunk_3',
                    text: '------- Friday',
                    meaning: '金曜日までに',
                    role: '時を表す前置詞句',
                    grammarPoint: '期限を表す前置詞',
                    toeicTip: '期限・締切を表すときは"by"を使う。"on"は特定の日、"at"は時刻、"in"は期間。',
                    whyThisAnswer: '期限（deadline）を示すため"by"が正解。"Submit by Friday" = 金曜日までに提出する。',
                },
            ],
            fullTranslation: '金曜日までにレポートを提出してください。',
            paraphrase: 'Your report needs to be turned in no later than Friday.',
            questionIntent: '前置詞の使い分け（時間・期限表現）',
            attackStrategy: 'by = 〜までに（期限）、on = 〜に（特定の日）、at = 〜に（時刻）、in = 〜後（期間）を覚える。',
        },
        'p5_normal_1': {
            questionId: 'p5_normal_1',
            chunks: [
                {
                    id: 'chunk_1',
                    text: 'Although the shipment was delayed',
                    meaning: '出荷が遅れたけれども',
                    role: '従属節（譲歩）',
                    grammarPoint: 'Although + 主語 + 動詞（名詞節接続詞）',
                    toeicTip: 'Althoughの後は「主語+動詞」の完全な文が来る。',
                },
                {
                    id: 'chunk_2',
                    text: '------- weather conditions',
                    meaning: '天候状況のために',
                    role: '理由を表す句',
                    grammarPoint: '前置詞 + 名詞',
                    toeicTip: '後ろが名詞（weather conditions）なので前置詞が必要。becauseは接続詞なので後ろに「主語+動詞」が必要。',
                    whyThisAnswer: '"due to + 名詞" = 〜のために。"because"は接続詞で後ろに文が必要なので不可。',
                },
                {
                    id: 'chunk_3',
                    text: 'customers were notified immediately',
                    meaning: '顧客はすぐに通知された',
                    role: '主節（受動態）',
                    grammarPoint: '受動態: be動詞 + 過去分詞',
                },
            ],
            fullTranslation: '天候状況により出荷が遅れましたが、顧客にはすぐに通知されました。',
            paraphrase: 'Despite the delay in shipping caused by weather, customers received immediate notification.',
            questionIntent: '接続詞と前置詞の使い分け',
            attackStrategy: '空欄の後ろを確認：名詞なら前置詞、「主語+動詞」なら接続詞を選ぶ。',
        },
        'p5_hard_1': {
            questionId: 'p5_hard_1',
            chunks: [
                {
                    id: 'chunk_1',
                    text: '------- the extensive research',
                    meaning: '広範な調査にもかかわらず',
                    role: '譲歩を表す前置詞句',
                    grammarPoint: '前置詞 + 名詞',
                    toeicTip: '後ろが名詞句なので前置詞が必要。Althoughは接続詞なので不可。',
                    whyThisAnswer: '"Notwithstanding + 名詞" = 〜にもかかわらず（フォーマル）。"Despite"も可能だが、TOEICではNotwithstandingの方が高頻出。',
                },
                {
                    id: 'chunk_2',
                    text: 'conducted by the team',
                    meaning: 'チームによって実施された',
                    role: '過去分詞による後置修飾',
                    grammarPoint: '過去分詞 + by + 行為者',
                },
                {
                    id: 'chunk_3',
                    text: 'the board decided to postpone the project',
                    meaning: '取締役会はプロジェクトの延期を決定した',
                    role: '主節',
                    grammarPoint: 'decide to + 動詞原形',
                },
            ],
            fullTranslation: 'チームによる広範な調査にもかかわらず、取締役会はプロジェクトの延期を決定しました。',
            paraphrase: 'The board chose to delay the project despite the team\'s thorough research.',
            questionIntent: '高度な譲歩表現の理解',
            attackStrategy: 'Notwithstanding = Despiteよりフォーマル。TOEIC Part 5では両方出題されるが、ビジネス文脈ではNotwithstandingが好まれる。',
        },
    };

    return explanations[question.id] || {
        questionId: question.id,
        chunks: [],
        fullTranslation: '',
        questionIntent: '',
        attackStrategy: '',
    };
}

// 将来のOpenAI API統合用（コメントアウト）
/*
async function generateWithAI(part: TOEICPart, difficulty: Difficulty, count: number): Promise<Question[]> {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ part, difficulty, count }),
  });
  
  return await response.json();
}
*/

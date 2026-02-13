// 間隔反復アルゴリズム + 間違えた単語の優先出題ロジック

import { VocabularyProgress, VocabularyWord } from '@/types/vocabulary';

// 習熟度スコア（0-100）
export function calculateMasteryScore(progress: VocabularyProgress): number {
    const { correctCount, incorrectCount } = progress;
    const total = correctCount + incorrectCount;

    if (total === 0) return 0;

    // 基本正答率（0-70点）
    const accuracy = (correctCount / total) * 70;

    // 絶対回数ボーナス（0-30点）
    const countBonus = Math.min(30, correctCount * 3);

    return Math.min(100, Math.round(accuracy + countBonus));
}

// 次回復習日を計算
export function calculateNextReviewDate(progress: VocabularyProgress): Date {
    const masteryScore = calculateMasteryScore(progress);

    // 習熟度に応じた間隔（日数）
    let intervalDays: number;

    if (masteryScore < 20) {
        intervalDays = 1; // 苦手: 1日後
    } else if (masteryScore < 40) {
        intervalDays = 2; // 弱い: 2日後
    } else if (masteryScore < 60) {
        intervalDays = 4; // 普通: 4日後
    } else if (masteryScore < 80) {
        intervalDays = 7; // 良好: 1週間後
    } else {
        intervalDays = 14; // 習得: 2週間後
    }

    // 最後の復習日からの経過日数を考慮
    const now = new Date();
    const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);

    return nextReview;
}

// 出題する単語を選択（優先度付き）
export function selectWordsForStudy(
    allWords: VocabularyWord[],
    progressMap: Map<string, VocabularyProgress>,
    count: number = 10,
    prioritizeWeak: boolean = false
): VocabularyWord[] {
    const now = new Date();

    // 各単語に優先度スコアを付与
    const scored = allWords.map(word => {
        const progress = progressMap.get(word.id);

        if (!progress) {
            // 未学習単語は中程度の優先度
            return { word, priority: 50 };
        }

        const masteryScore = calculateMasteryScore(progress);
        const nextReview = new Date(progress.nextReview);
        const isOverdue = nextReview <= now;

        let priority = 0;

        if (prioritizeWeak) {
            // 苦手優先モード
            priority = 100 - masteryScore; // 習熟度が低いほど優先

            if (progress.incorrectCount > 0) {
                priority += progress.incorrectCount * 10; // 間違えた回数でさらに優先
            }
        } else {
            // 通常モード
            if (isOverdue) {
                // 復習期限切れの単語は優先
                priority = 80 + (100 - masteryScore) / 5;
            } else {
                // 習熟度が低い単語を優先
                priority = 100 - masteryScore;
            }
        }

        return { word, priority };
    });

    // 優先度順にソート
    scored.sort((a, b) => b.priority - a.priority);

    // 上位から選択
    return scored.slice(0, count).map(s => s.word);
}

// 進捗を更新（正解/不正解）
export function updateProgress(
    progress: VocabularyProgress | undefined,
    wordId: string,
    isCorrect: boolean
): VocabularyProgress {
    const current = progress || {
        wordId,
        correctCount: 0,
        incorrectCount: 0,
        lastReviewed: new Date(),
        nextReview: new Date(),
        masteryLevel: 0,
        isMastered: false,
    };

    const updated: VocabularyProgress = {
        ...current,
        correctCount: isCorrect ? current.correctCount + 1 : current.correctCount,
        incorrectCount: isCorrect ? current.incorrectCount : current.incorrectCount + 1,
        lastReviewed: new Date(),
        masteryLevel: 0, // 後で計算
        isMastered: false,
    };

    // 習熟度スコアを計算
    const masteryScore = calculateMasteryScore(updated);
    updated.masteryLevel = Math.floor(masteryScore / 20); // 0-5のレベル
    updated.isMastered = masteryScore >= 80;

    // 次回復習日を計算
    updated.nextReview = calculateNextReviewDate(updated);

    return updated;
}

// 苦手単語を抽出
export function getWeakWords(
    progressList: VocabularyProgress[],
    limit: number = 50
): VocabularyProgress[] {
    return progressList
        .filter(p => !p.isMastered && (p.correctCount + p.incorrectCount) > 0)
        .sort((a, b) => {
            // 正答率で比較
            const aRate = a.correctCount / (a.correctCount + a.incorrectCount);
            const bRate = b.correctCount / (b.correctCount + b.incorrectCount);

            if (aRate !== bRate) {
                return aRate - bRate; // 正答率が低い順
            }

            // 正答率が同じなら間違い回数で比較
            return b.incorrectCount - a.incorrectCount;
        })
        .slice(0, limit);
}

// 統計情報を計算
export function calculateVocabStats(progressList: VocabularyProgress[]) {
    const total = progressList.length;
    const studied = progressList.filter(p => p.correctCount + p.incorrectCount > 0).length;
    const mastered = progressList.filter(p => p.isMastered).length;
    const weak = progressList.filter(p => {
        const masteryScore = calculateMasteryScore(p);
        return masteryScore < 40 && (p.correctCount + p.incorrectCount) > 0;
    }).length;

    const avgMastery = progressList.reduce((sum, p) => {
        return sum + calculateMasteryScore(p);
    }, 0) / (total || 1);

    return {
        total,
        studied,
        mastered,
        weak,
        avgMastery: Math.round(avgMastery),
    };
}

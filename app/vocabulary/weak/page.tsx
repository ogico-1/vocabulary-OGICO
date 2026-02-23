'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { getAllWords, getWordById } from '@/lib/vocabulary/wordbank';
import { VocabularyProgress } from '@/types/vocabulary';
import Button from '@/components/shared/Button';

type SortType = 'accuracy' | 'incorrectCount' | 'recent';

export default function WeakWordsPage() {
    const { stats } = useAppContext();
    const [sortBy, setSortBy] = useState<SortType>('accuracy');

    const weakWords = stats.vocabStats.weakWords;

    // ソート処理
    const sortedWeakWords = [...weakWords].sort((a, b) => {
        switch (sortBy) {
            case 'accuracy':
                const aRate = a.correctCount / (a.correctCount + a.incorrectCount || 1);
                const bRate = b.correctCount / (b.correctCount + b.incorrectCount || 1);
                return aRate - bRate;
            case 'incorrectCount':
                return b.incorrectCount - a.incorrectCount;
            case 'recent':
                return new Date(b.lastReviewed).getTime() - new Date(a.lastReviewed).getTime();
            default:
                return 0;
        }
    });

    // 正答率を計算
    const getAccuracy = (progress: VocabularyProgress) => {
        const total = progress.correctCount + progress.incorrectCount;
        if (total === 0) return 0;
        return Math.round((progress.correctCount / total) * 100);
    };

    return (
        <div className="animate-fade-in">
            {/* ヘッダー */}
            <header style={styles.header}>
                <Link href="/vocabulary" style={styles.backLink}>
                    ← 単語学習に戻る
                </Link>
                <h1 style={styles.title}>💪 苦手単語一覧</h1>
                <p style={styles.subtitle}>
                    正答率が低い単語や間違えた回数が多い単語を重点的に復習しましょう
                </p>
            </header>

            {/* 統計サマリー */}
            <div className="card" style={styles.summaryCard}>
                <div className="grid grid-3">
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>苦手単語数</div>
                        <div style={styles.statValue}>{weakWords.length}</div>
                    </div>
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>平均正答率</div>
                        <div style={styles.statValue}>
                            {weakWords.length > 0
                                ? Math.round(
                                    weakWords.reduce((sum, w) => sum + getAccuracy(w), 0) / weakWords.length
                                )
                                : 0}
                            %
                        </div>
                    </div>
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>総間違い回数</div>
                        <div style={styles.statValue}>
                            {weakWords.reduce((sum, w) => sum + w.incorrectCount, 0)}
                        </div>
                    </div>
                </div>
            </div>

            {/* ソートと復習ボタン */}
            <div style={styles.controls}>
                <div style={styles.sortButtons}>
                    <span style={styles.sortLabel}>並び替え:</span>
                    <button
                        onClick={() => setSortBy('accuracy')}
                        style={{
                            ...styles.sortButton,
                            ...(sortBy === 'accuracy' ? styles.sortButtonActive : {}),
                        }}
                        className="btn btn-secondary"
                    >
                        正答率順
                    </button>
                    <button
                        onClick={() => setSortBy('incorrectCount')}
                        style={{
                            ...styles.sortButton,
                            ...(sortBy === 'incorrectCount' ? styles.sortButtonActive : {}),
                        }}
                        className="btn btn-secondary"
                    >
                        間違い回数順
                    </button>
                    <button
                        onClick={() => setSortBy('recent')}
                        style={{
                            ...styles.sortButton,
                            ...(sortBy === 'recent' ? styles.sortButtonActive : {}),
                        }}
                        className="btn btn-secondary"
                    >
                        最近の復習順
                    </button>
                </div>

                <Link href="/vocabulary?mode=weak">
                    <Button variant="primary" size="lg">
                        🔥 苦手だけ復習する
                    </Button>
                </Link>
            </div>

            {/* 苦手単語リスト */}
            {sortedWeakWords.length === 0 ? (
                <div className="card" style={styles.emptyState}>
                    <p style={styles.emptyText}>
                        素晴らしい！苦手な単語はありません 🎉
                    </p>
                    <Link href="/vocabulary">
                        <Button variant="primary">単語学習を続ける</Button>
                    </Link>
                </div>
            ) : (
                <div style={styles.wordsList}>
                    {sortedWeakWords.map((progress) => {
                        const word = getWordById(progress.wordId);
                        if (!word) return null;

                        const accuracy = getAccuracy(progress);
                        const total = progress.correctCount + progress.incorrectCount;

                        return (
                            <div key={progress.wordId} className="card" style={styles.wordCard}>
                                <div style={styles.wordHeader}>
                                    <div style={styles.wordMain}>
                                        <h3 style={styles.wordText}>{word.word}</h3>
                                        <p style={styles.wordMeaning}>{word.meaning}</p>
                                    </div>

                                    <div style={styles.statsGrid}>
                                        <div style={styles.statItem}>
                                            <div style={styles.statItemLabel}>正答率</div>
                                            <div
                                                style={{
                                                    ...styles.statItemValue,
                                                    color: accuracy < 40 ? 'var(--color-error)' : accuracy < 70 ? 'var(--color-warning)' : 'var(--color-success)',
                                                }}
                                            >
                                                {accuracy}%
                                            </div>
                                        </div>

                                        <div style={styles.statItem}>
                                            <div style={styles.statItemLabel}>正解</div>
                                            <div style={styles.statItemValue}>{progress.correctCount}回</div>
                                        </div>

                                        <div style={styles.statItem}>
                                            <div style={styles.statItemLabel}>不正解</div>
                                            <div style={{ ...styles.statItemValue, color: 'var(--color-error)' }}>
                                                {progress.incorrectCount}回
                                            </div>
                                        </div>

                                        <div style={styles.statItem}>
                                            <div style={styles.statItemLabel}>総回答</div>
                                            <div style={styles.statItemValue}>{total}回</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={styles.wordDetails}>
                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>カテゴリ:</span>
                                        <span className="badge" style={styles.categoryBadge}>
                                            {word.category}
                                        </span>
                                    </div>

                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>例文:</span>
                                        <span style={styles.exampleText}>{word.exampleSentence}</span>
                                    </div>

                                    <div style={styles.detailRow}>
                                        <span style={styles.detailLabel}>和訳:</span>
                                        <span style={styles.translationText}>{word.exampleTranslation}</span>
                                    </div>

                                    {word.collocations.length > 0 && (
                                        <div style={styles.detailRow}>
                                            <span style={styles.detailLabel}>よく使う表現:</span>
                                            <div style={styles.tags}>
                                                {word.collocations.map((col, i) => (
                                                    <span key={i} style={styles.tag}>{col}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        marginBottom: 'var(--spacing-xl)',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        marginBottom: 'var(--spacing-md)',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-sm)',
    },
    subtitle: {
        fontSize: '1.125rem',
        color: 'var(--color-text-secondary)',
    },
    summaryCard: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
        background: 'var(--gradient-warning)',
        color: 'white',
    },
    statBox: {
        textAlign: 'center',
    },
    statLabel: {
        fontSize: '0.875rem',
        opacity: 0.9,
        marginBottom: 'var(--spacing-xs)',
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 700,
    },
    controls: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xl)',
        gap: 'var(--spacing-lg)',
        flexWrap: 'wrap',
    },
    sortButtons: {
        display: 'flex',
        gap: 'var(--spacing-sm)',
        alignItems: 'center',
    },
    sortLabel: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
    },
    sortButton: {
        fontSize: '0.875rem',
    },
    sortButtonActive: {
        background: 'var(--color-info)',
        color: 'white',
    },
    emptyState: {
        padding: 'var(--spacing-2xl)',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: '1.125rem',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-lg)',
    },
    wordsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
    },
    wordCard: {
        padding: 'var(--spacing-xl)',
    },
    wordHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'start',
        gap: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
    },
    wordMain: {
        flex: 1,
    },
    wordText: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-xs)',
        color: 'var(--color-text-primary)',
    },
    wordMeaning: {
        fontSize: '1.125rem',
        color: 'var(--color-text-secondary)',
        marginBottom: 0,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--spacing-md)',
    },
    statItem: {
        textAlign: 'center',
    },
    statItemLabel: {
        fontSize: '0.75rem',
        color: 'var(--color-text-tertiary)',
        marginBottom: 'var(--spacing-xs)',
    },
    statItemValue: {
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
    },
    wordDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    detailRow: {
        display: 'flex',
        gap: 'var(--spacing-sm)',
        alignItems: 'start',
    },
    detailLabel: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
        minWidth: '120px',
    },
    categoryBadge: {
        background: 'var(--color-info)',
        color: 'white',
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem',
    },
    exampleText: {
        flex: 1,
        fontSize: '1rem',
        fontStyle: 'italic',
        color: 'var(--color-text-primary)',
    },
    translationText: {
        flex: 1,
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-xs)',
        flex: 1,
    },
    tag: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.875rem',
    },
};

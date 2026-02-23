'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VocabularyWord, VocabularyLevel, VocabularyProgress } from '@/types/vocabulary';
import { getAllWords, getWordsByLevel, getWordById } from '@/lib/vocabulary/wordbank';
import { selectWordsForStudy, updateProgress, calculateMasteryScore } from '@/lib/vocabulary/spacedRepetition';
import { useAppContext } from '@/contexts/AppContext';
import Button from '@/components/shared/Button';

const LEVELS: { value: VocabularyLevel; label: string; description: string }[] = [
    { value: 1, label: 'Level 1', description: '基礎 (~600点)' },
    { value: 2, label: 'Level 2', description: '中級 (~750点)' },
    { value: 3, label: 'Level 3', description: '上級 (800+点)' },
];

function VocabularyContent() {
    const searchParams = useSearchParams();
    const mode = searchParams?.get('mode'); // 'weak' なら苦手単語モード

    const { stats, updateVocabStats } = useAppContext();
    const [selectedLevel, setSelectedLevel] = useState<VocabularyLevel>(1);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [words, setWords] = useState<VocabularyWord[]>([]);
    const [progress, setProgress] = useState<VocabularyProgress[]>([]);

    useEffect(() => {
        // 進捗データをローカルストレージから読み込み
        const savedProgress = localStorage.getItem('vocab_progress');
        if (savedProgress) {
            setProgress(JSON.parse(savedProgress));
        }
    }, []);

    useEffect(() => {
        const allWords = getAllWords();
        const progressMap = new Map(progress.map(p => [p.wordId, p]));

        let selectedWords: VocabularyWord[];

        if (mode === 'weak') {
            // 苦手単語モード
            const weakProgress = stats.vocabStats.weakWords;
            selectedWords = weakProgress
                .map(p => getWordById(p.wordId))
                .filter((w): w is VocabularyWord => w !== undefined);
        } else {
            // 通常モード：レベル別 + 優先度ソート
            const levelWords = getWordsByLevel(selectedLevel);
            selectedWords = selectWordsForStudy(levelWords, progressMap, 10, false);
        }

        setWords(selectedWords);
        setCurrentWordIndex(0);
        setIsFlipped(false);
    }, [selectedLevel, progress, mode, stats.vocabStats.weakWords]);

    const currentWord = words[currentWordIndex];

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    const handleAnswer = (isCorrect: boolean) => {
        if (!currentWord) return;

        // 進捗を更新
        const currentProgress = progress.find(p => p.wordId === currentWord.id);
        const updatedProgress = updateProgress(currentProgress, currentWord.id, isCorrect);

        const newProgressList = progress.filter(p => p.wordId !== currentWord.id);
        newProgressList.push(updatedProgress);

        setProgress(newProgressList);

        // LocalStorageに保存
        localStorage.setItem('vocab_progress', JSON.stringify(newProgressList));

        // グローバル状態を更新
        updateVocabStats(newProgressList);

        // 次の単語へ
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1);
            setIsFlipped(false);
        } else {
            // 最後の単語まで到達したら最初に戻る
            setCurrentWordIndex(0);
            setIsFlipped(false);
        }
    };

    const wordProgress = progress.find(p => p.wordId === currentWord?.id);
    const masteryScore = wordProgress ? calculateMasteryScore(wordProgress) : 0;
    const masteredCount = progress.filter(p => p.isMastered).length;

    if (!currentWord) {
        return (
            <div style={styles.empty}>
                <p>このレベルの単語がありません</p>
                <Link href="/">
                    <Button>ホームに戻る</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* ヘッダー */}
            <header style={styles.header}>
                <div style={styles.headerNav}>
                    <Link href="/" style={styles.backLink}>
                        ← ホームに戻る
                    </Link>
                    <Link href="/vocabulary/weak" style={styles.weakLink}>
                        💪 苦手単語一覧
                    </Link>
                </div>
                <h1 style={styles.title}>
                    {mode === 'weak' ? '💪 苦手単語 復習モード' : '📖 単語学習'}
                </h1>
                <p style={styles.subtitle}>
                    {mode === 'weak'
                        ? '間違えた単語を集中的に復習しましょう'
                        : 'TOEIC頻出1,000語を間隔反復法で効率的に学習'}
                </p>
            </header>

            {/* レベル選択（通常モードのみ） */}
            {mode !== 'weak' && (
                <div className="card" style={styles.levelSelector}>
                    <h3 style={styles.levelTitle}>レベル選択</h3>
                    <div style={styles.levelButtons}>
                        {LEVELS.map((level) => (
                            <button
                                key={level.value}
                                onClick={() => setSelectedLevel(level.value)}
                                style={{
                                    ...styles.levelButton,
                                    ...(selectedLevel === level.value ? styles.levelButtonActive : {}),
                                }}
                                className={selectedLevel === level.value ? '' : 'card'}
                            >
                                <div style={styles.levelLabel}>{level.label}</div>
                                <div style={styles.levelDescription}>{level.description}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 進捗 */}
            <div style={styles.progressBar}>
                <div style={styles.progressInfo}>
                    <span>単語 {currentWordIndex + 1} / {words.length}</span>
                    <span>総習得: {masteredCount} / {getAllWords().length}</span>
                </div>
                <div className="progress">
                    <div className="progress-bar" style={{ width: `${((currentWordIndex + 1) / words.length) * 100}%` }} />
                </div>
            </div>

            {/* 単語カード */}
            <div
                style={{
                    ...styles.cardContainer,
                    ...(isFlipped ? styles.cardContainerFlipped : {}),
                }}
                onClick={handleFlip}
            >
                <div className="card" style={styles.card}>
                    {!isFlipped ? (
                        // 表面（英語）
                        <div style={styles.cardFront}>
                            <div style={styles.wordMain}>{currentWord.word}</div>
                            <div style={styles.pronunciation}>{currentWord.pronunciation}</div>
                            <div style={styles.category}>{currentWord.category}</div>
                            {wordProgress && (
                                <div style={styles.masteryIndicator}>
                                    習熟度: {masteryScore}%
                                </div>
                            )}
                            <div style={styles.flipHint}>タップして意味を表示 →</div>
                        </div>
                    ) : (
                        // 裏面（日本語と詳細）
                        <div style={styles.cardBack}>
                            <div style={styles.meaning}>{currentWord.meaning}</div>

                            <div style={styles.section}>
                                <div style={styles.sectionLabel}>例文</div>
                                <div style={styles.exampleSentence}>{currentWord.exampleSentence}</div>
                                <div style={styles.exampleTranslation}>{currentWord.exampleTranslation}</div>
                            </div>

                            {currentWord.synonyms.length > 0 && (
                                <div style={styles.section}>
                                    <div style={styles.sectionLabel}>類義語</div>
                                    <div style={styles.tags}>
                                        {currentWord.synonyms.map((syn, i) => (
                                            <span key={i} style={styles.tag}>{syn}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {currentWord.collocations.length > 0 && (
                                <div style={styles.section}>
                                    <div style={styles.sectionLabel}>よく使う表現</div>
                                    <div style={styles.tags}>
                                        {currentWord.collocations.map((col, i) => (
                                            <span key={i} style={styles.tag}>{col}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {wordProgress && (
                                <div style={styles.masteryBox}>
                                    <div>習熟度スコア: {masteryScore}% (レベル {wordProgress.masteryLevel}/5)</div>
                                    <div>正解: {wordProgress.correctCount}回 / 不正解: {wordProgress.incorrectCount}回</div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 解答ボタン */}
            {isFlipped && (
                <div style={styles.answerButtons} className="animate-fade-in">
                    <Button
                        onClick={() => handleAnswer(false)}
                        variant="secondary"
                        size="lg"
                        style={styles.wrongButton}
                    >
                        ✗ わからない
                    </Button>
                    <Button
                        onClick={() => handleAnswer(true)}
                        variant="success"
                        size="lg"
                        style={styles.correctButton}
                    >
                        ✓ 覚えた
                    </Button>
                </div>
            )}
        </div>
    );
}

export default function VocabularyPage() {
    return (
        <Suspense fallback={<div style={styles.loading}><div>読み込み中...</div></div>}>
            <VocabularyContent />
        </Suspense>
    );
}

const styles: Record<string, React.CSSProperties> = {
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--spacing-lg)',
    },
    header: {
        marginBottom: 'var(--spacing-xl)',
    },
    headerNav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        fontSize: '0.875rem',
    },
    weakLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        color: 'var(--color-warning)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        fontWeight: 600,
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
    levelSelector: {
        padding: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-lg)',
    },
    levelTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
    },
    levelButtons: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-md)',
    },
    levelButton: {
        padding: 'var(--spacing-md)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        textAlign: 'left',
    },
    levelButtonActive: {
        borderColor: 'var(--color-info)',
        background: 'rgba(59, 130, 246, 0.1)',
    },
    levelLabel: {
        fontWeight: 700,
        fontSize: '1.125rem',
        marginBottom: 'var(--spacing-xs)',
    },
    levelDescription: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
    progressBar: {
        marginBottom: 'var(--spacing-xl)',
    },
    progressInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: 'var(--spacing-sm)',
    },
    cardContainer: {
        perspective: '1000px',
        marginBottom: 'var(--spacing-xl)',
        cursor: 'pointer',
        transition: 'transform var(--transition-base)',
    },
    cardContainerFlipped: {
        transform: 'scale(1.02)',
    },
    card: {
        minHeight: '450px',
        padding: 'var(--spacing-2xl)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardFront: {
        textAlign: 'center',
        width: '100%',
    },
    wordMain: {
        fontSize: '4rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    pronunciation: {
        fontSize: '1.5rem',
        color: 'var(--color-text-secondary)',
        fontFamily: 'var(--font-mono)',
        marginBottom: 'var(--spacing-md)',
    },
    category: {
        display: 'inline-block',
        padding: 'var(--spacing-xs) var(--spacing-md)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: 'var(--spacing-md)',
    },
    masteryIndicator: {
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--color-success)',
        marginBottom: 'var(--spacing-lg)',
    },
    flipHint: {
        fontSize: '1rem',
        color: 'var(--color-text-tertiary)',
        fontStyle: 'italic',
        // Note: opacity is not valid standard CSS property in this context but we'll leave it if it was there (it wasn't)
    },
    cardBack: {
        width: '100%',
        textAlign: 'left',
    },
    meaning: {
        fontSize: '2rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-xl)',
        textAlign: 'center',
        color: 'var(--color-success)',
    },
    section: {
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
    },
    sectionLabel: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 'var(--spacing-sm)',
    },
    exampleSentence: {
        fontSize: '1.125rem',
        marginBottom: 'var(--spacing-sm)',
        fontStyle: 'italic',
    },
    exampleTranslation: {
        fontSize: '1rem',
        color: 'var(--color-text-secondary)',
    },
    tags: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-xs)',
    },
    tag: {
        padding: 'var(--spacing-xs) var(--spacing-sm)',
        background: 'var(--color-bg-tertiary)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.875rem',
    },
    masteryBox: {
        marginTop: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
    },
    answerButtons: {
        display: 'flex',
        gap: 'var(--spacing-lg)',
        justifyContent: 'center',
    },
    wrongButton: {
        flex: 1,
        maxWidth: '300px',
    },
    correctButton: {
        flex: 1,
        maxWidth: '300px',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--spacing-lg)',
    },
};

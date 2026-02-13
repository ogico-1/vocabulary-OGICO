'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Question, QuestionExplanation, PracticeSession } from '@/types/question';
import { getPracticeSessions } from '@/lib/storage/userProgress';
import { generateExplanation } from '@/lib/ai/questionGenerator';
import Button from '@/components/shared/Button';
import ExplanationBlock from '@/components/practice/ExplanationBlock';

export default function ResultPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const part = parseInt(params.part as string);
    const sessionId = searchParams.get('sessionId');

    const [session, setSession] = useState<PracticeSession | null>(null);
    const [explanations, setExplanations] = useState<Record<string, QuestionExplanation>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadResults() {
            if (!sessionId) return;

            // セッションを取得
            const sessions = getPracticeSessions();
            const foundSession = sessions.find(s => s.id === sessionId);

            if (!foundSession) {
                setIsLoading(false);
                return;
            }

            setSession(foundSession);

            // 各問題の解説を生成
            const explanationsMap: Record<string, QuestionExplanation> = {};
            for (const question of foundSession.questions) {
                explanationsMap[question.id] = await generateExplanation(question);
            }

            setExplanations(explanationsMap);
            setIsLoading(false);
        }

        loadResults();
    }, [sessionId]);

    if (isLoading) {
        return (
            <div style={styles.loading}>
                <div>結果を読み込み中...</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div style={styles.loading}>
                <div>セッションが見つかりませんでした</div>
                <Link href="/practice">
                    <Button>戻る</Button>
                </Link>
            </div>
        );
    }

    const { results, questions, score, accuracy } = session;
    const totalQuestions = questions.length;

    return (
        <div className="animate-fade-in">
            {/* 結果サマリー */}
            <div className="card" style={styles.summaryCard}>
                <div style={styles.summaryHeader}>
                    <h1 style={styles.summaryTitle}>
                        {accuracy >= 80 ? '🎉 素晴らしい！' : accuracy >= 60 ? '👍 Good Job!' : '💪 Keep Going!'}
                    </h1>
                    <Link href="/practice">
                        <Button variant="secondary">パート選択に戻る</Button>
                    </Link>
                </div>

                <div className="grid grid-4" style={{ marginTop: 'var(--spacing-xl)' }}>
                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>得点</div>
                        <div style={styles.statValue}>
                            {score} / {totalQuestions}
                        </div>
                    </div>

                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>正答率</div>
                        <div style={styles.statValue}>{accuracy.toFixed(1)}%</div>
                    </div>

                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>正解数</div>
                        <div style={styles.statValue} style={{ color: 'var(--color-success)' }}>
                            {results.filter(r => r.isCorrect).length}問
                        </div>
                    </div>

                    <div style={styles.statBox}>
                        <div style={styles.statLabel}>不正解数</div>
                        <div style={styles.statValue} style={{ color: 'var(--color-error)' }}>
                            {results.filter(r => !r.isCorrect).length}問
                        </div>
                    </div>
                </div>
            </div>

            {/* 各問題の解説 */}
            <div style={styles.questionsSection}>
                <h2 style={styles.sectionTitle}>📝 問題解説</h2>

                {questions.map((question, index) => {
                    const result = results[index];
                    const explanation = explanations[question.id];
                    const isCorrect = result.isCorrect;

                    return (
                        <div key={question.id} className="card" style={styles.questionCard}>
                            {/* 問題ヘッダー */}
                            <div style={styles.questionHeader}>
                                <div style={styles.questionHeaderLeft}>
                                    <span style={styles.questionNumber}>問題 {index + 1}</span>
                                    <span style={{
                                        ...styles.resultBadge,
                                        ...(isCorrect ? styles.correctBadge : styles.incorrectBadge),
                                    }}>
                                        {isCorrect ? '✓ 正解' : '✗ 不正解'}
                                    </span>
                                </div>
                            </div>

                            {/* 問題文 */}
                            <div style={styles.questionTextBox}>
                                <p style={styles.questionText}>{question.questionText}</p>
                            </div>

                            {/* 選択肢 */}
                            <div style={styles.optionsBox}>
                                {question.options.map((option, optIndex) => {
                                    const isUserAnswer = result.userAnswer === optIndex;
                                    const isCorrectAnswer = question.correctAnswer === optIndex;

                                    let optionStyle = styles.option;
                                    if (isCorrectAnswer) {
                                        optionStyle = { ...optionStyle, ...styles.optionCorrect };
                                    } else if (isUserAnswer && !isCorrect) {
                                        optionStyle = { ...optionStyle, ...styles.optionWrong };
                                    }

                                    return (
                                        <div key={optIndex} style={optionStyle}>
                                            <span style={styles.optionLetter}>
                                                {String.fromCharCode(65 + optIndex)}
                                            </span>
                                            <span style={styles.optionTextDisplay}>{option}</span>
                                            {isCorrectAnswer && <span style={styles.correctMark}>✓ 正解</span>}
                                            {isUserAnswer && !isCorrect && <span style={styles.wrongMark}>あなたの解答</span>}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* 解説 */}
                            {explanation && explanation.chunks.length > 0 && (
                                <div style={styles.explanationSection}>
                                    <ExplanationBlock
                                        chunks={explanation.chunks}
                                        fullTranslation={explanation.fullTranslation}
                                        paraphrase={explanation.paraphrase}
                                        questionIntent={explanation.questionIntent}
                                        attackStrategy={explanation.attackStrategy}
                                    />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* 次のアクション */}
            <div style={styles.actionsSection} className="card">
                <h3 style={styles.actionsTitle}>次のステップ</h3>
                <div className="grid grid-3" style={{ marginTop: 'var(--spacing-lg)' }}>
                    <Link href={`/practice/${part}?difficulty=${session.difficulty}`}>
                        <Button variant="primary" size="lg" style={{ width: '100%' }}>
                            同じ難易度でもう一度
                        </Button>
                    </Link>

                    <Link href="/practice">
                        <Button variant="secondary" size="lg" style={{ width: '100%' }}>
                            他のパートに挑戦
                        </Button>
                    </Link>

                    <Link href="/">
                        <Button variant="secondary" size="lg" style={{ width: '100%' }}>
                            ホームに戻る
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--spacing-lg)',
    },
    summaryCard: {
        padding: 'var(--spacing-2xl)',
        marginBottom: 'var(--spacing-xl)',
        background: 'var(--gradient-primary)',
        color: 'white',
    },
    summaryHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    summaryTitle: {
        fontSize: '2.5rem',
        fontWeight: 700,
        margin: 0,
    },
    statBox: {
        textAlign: 'center',
    },
    statLabel: {
        fontSize: '0.875rem',
        opacity: 0.9,
        marginBottom: 'var(--spacing-xs)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    statValue: {
        fontSize: '2.5rem',
        fontWeight: 700,
    },
    questionsSection: {
        marginBottom: 'var(--spacing-xl)',
    },
    sectionTitle: {
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
    },
    questionCard: {
        padding: 'var(--spacing-2xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    questionHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '2px solid var(--color-border)',
    },
    questionHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
    },
    questionNumber: {
        fontSize: '1.125rem',
        fontWeight: 700,
    },
    resultBadge: {
        padding: 'var(--spacing-xs) var(--spacing-md)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.875rem',
        fontWeight: 600,
    },
    correctBadge: {
        background: 'var(--color-success)',
        color: 'white',
    },
    incorrectBadge: {
        background: 'var(--color-error)',
        color: 'white',
    },
    questionTextBox: {
        marginBottom: 'var(--spacing-lg)',
    },
    questionText: {
        fontSize: '1.25rem',
        lineHeight: 1.8,
        marginBottom: 0,
    },
    optionsBox: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-xl)',
    },
    option: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        background: 'var(--color-bg-secondary)',
        border: '2px solid transparent',
    },
    optionCorrect: {
        background: 'rgba(16, 185, 129, 0.1)',
        borderColor: 'var(--color-success)',
    },
    optionWrong: {
        background: 'rgba(239, 68, 68, 0.1)',
        borderColor: 'var(--color-error)',
    },
    optionLetter: {
        width: '2rem',
        height: '2rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
    },
    optionTextDisplay: {
        flex: 1,
        fontSize: '1rem',
    },
    correctMark: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-success)',
    },
    wrongMark: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-error)',
    },
    explanationSection: {
        marginTop: 'var(--spacing-xl)',
        paddingTop: 'var(--spacing-xl)',
        borderTop: '2px solid var(--color-border)',
    },
    actionsSection: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-2xl)',
    },
    actionsTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        textAlign: 'center',
    },
};

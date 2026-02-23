'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Question, TOEICPart, Difficulty, QuestionResult, PracticeSession } from '@/types/question';
import { generateQuestions } from '@/lib/ai/questionGenerator';
import { savePracticeSession } from '@/lib/storage/userProgress';
import Button from '@/components/shared/Button';

function PracticePartContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();

    const part = parseInt(params.part as string) as TOEICPart;
    const difficulty = (searchParams.get('difficulty') || 'normal') as Difficulty;

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [isTimerEnabled, setIsTimerEnabled] = useState(true);
    const [startTime] = useState(new Date());

    useEffect(() => {
        // 問題生成
        async function loadQuestions() {
            const qs = await generateQuestions(part, difficulty, 10);
            setQuestions(qs);
            setSelectedAnswers(new Array(qs.length).fill(null));
            setIsLoading(false);
        }

        loadQuestions();
    }, [part, difficulty]);

    useEffect(() => {
        // タイマー
        if (!isTimerEnabled) return;

        const interval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerEnabled]);

    const handleSelectAnswer = useCallback((answerIndex: number) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = answerIndex;
        setSelectedAnswers(newAnswers);
    }, [currentQuestionIndex, selectedAnswers]);

    const handleNext = useCallback(() => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    }, [currentQuestionIndex, questions.length]);

    const handlePrevious = useCallback(() => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    }, [currentQuestionIndex]);

    const handleSubmit = useCallback(() => {
        // セッション結果を作成
        const results: QuestionResult[] = questions.map((q, i) => ({
            questionId: q.id,
            userAnswer: selectedAnswers[i] ?? -1,
            correctAnswer: q.correctAnswer,
            isCorrect: selectedAnswers[i] === q.correctAnswer,
            timeSpent: 0, // 個別の時間は未実装
        }));

        const correctCount = results.filter(r => r.isCorrect).length;
        const accuracy = (correctCount / results.length) * 100;

        const session: PracticeSession = {
            id: `session_${Date.now()}`,
            part,
            difficulty,
            questions,
            results,
            startTime,
            endTime: new Date(),
            score: correctCount,
            accuracy,
        };

        // セッションを保存
        savePracticeSession(session);

        // 結果画面へ遷移
        router.push(`/practice/${part}/result?sessionId=${session.id}`);
    }, [questions, selectedAnswers, part, difficulty, startTime, router]);

    if (isLoading) {
        return (
            <div style={styles.loading}>
                <div>問題を生成中...</div>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div style={styles.loading}>
                <div>問題が見つかりませんでした</div>
                <Link href="/practice">
                    <Button>戻る</Button>
                </Link>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = selectedAnswers.filter(a => a !== null).length;
    const progress = (answeredCount / questions.length) * 100;

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="animate-fade-in">
            {/* ヘッダー */}
            <div style={styles.header} className="card">
                <div style={styles.headerLeft}>
                    <div className={`badge badge-part${part}`}>Part {part}</div>
                    <div className="badge" style={{ background: difficulty === 'easy' ? '#10b981' : difficulty === 'normal' ? '#f59e0b' : '#ef4444', color: 'white' }}>
                        {difficulty.toUpperCase()}
                    </div>
                </div>

                <div style={styles.headerCenter}>
                    <div style={styles.questionNumber}>
                        問題 {currentQuestionIndex + 1} / {questions.length}
                    </div>
                    <div className="progress">
                        <div className="progress-bar" style={{ width: `${progress}%` }} />
                    </div>
                </div>

                <div style={styles.headerRight}>
                    {isTimerEnabled && (
                        <div style={styles.timer}>
                            ⏱️ {formatTime(timeElapsed)}
                        </div>
                    )}
                    <button
                        onClick={() => setIsTimerEnabled(!isTimerEnabled)}
                        style={styles.timerToggle}
                        title="タイマー切替"
                    >
                        {isTimerEnabled ? '⏸️' : '▶️'}
                    </button>
                </div>
            </div>

            {/* 問題 */}
            <div className="card" style={styles.questionCard}>
                <h2 style={styles.questionText}>{currentQuestion.questionText}</h2>

                <div style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswers[currentQuestionIndex] === index;

                        return (
                            <button
                                key={index}
                                onClick={() => handleSelectAnswer(index)}
                                style={{
                                    ...styles.optionButton,
                                    ...(isSelected ? styles.optionButtonSelected : {}),
                                }}
                                className="card"
                            >
                                <div style={styles.optionLetter}>
                                    {String.fromCharCode(65 + index)}
                                </div>
                                <div style={styles.optionText}>{option}</div>
                                {isSelected && <div style={styles.checkmark}>✓</div>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ナビゲーション */}
            <div style={styles.navigation}>
                <Button
                    onClick={handlePrevious}
                    disabled={currentQuestionIndex === 0}
                    variant="secondary"
                    size="lg"
                >
                    ← 前の問題
                </Button>

                <div style={styles.navCenter}>
                    <span style={styles.answeredCount}>
                        解答済み: {answeredCount} / {questions.length}
                    </span>
                </div>

                {currentQuestionIndex < questions.length - 1 ? (
                    <Button onClick={handleNext} variant="primary" size="lg">
                        次の問題 →
                    </Button>
                ) : (
                    <Button
                        onClick={handleSubmit}
                        variant="success"
                        size="lg"
                        disabled={answeredCount < questions.length}
                    >
                        提出する ✓
                    </Button>
                )}
            </div>

            {/* 問題番号一覧 */}
            <div className="card" style={styles.questionGrid}>
                <h3 style={styles.questionGridTitle}>問題一覧</h3>
                <div style={styles.questionNumbers}>
                    {questions.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentQuestionIndex(i)}
                            style={{
                                ...styles.questionNumberButton,
                                ...(i === currentQuestionIndex ? styles.questionNumberActive : {}),
                                ...(selectedAnswers[i] !== null ? styles.questionNumberAnswered : {}),
                            }}
                        >
                            {i + 1}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default function PracticePartPage() {
    return (
        <Suspense fallback={<div style={styles.loading}><div>読み込み中...</div></div>}>
            <PracticePartContent />
        </Suspense>
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
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg)',
    },
    headerLeft: {
        display: 'flex',
        gap: 'var(--spacing-sm)',
    },
    headerCenter: {
        flex: 1,
        minWidth: 0,
    },
    questionNumber: {
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: 'var(--spacing-xs)',
        textAlign: 'center',
    },
    headerRight: {
        display: 'flex',
        gap: 'var(--spacing-sm)',
        alignItems: 'center',
    },
    timer: {
        fontSize: '1.125rem',
        fontWeight: 600,
        fontFamily: 'var(--font-mono)',
    },
    timerToggle: {
        background: 'none',
        border: 'none',
        fontSize: '1.25rem',
        cursor: 'pointer',
        padding: 'var(--spacing-xs)',
    },
    questionCard: {
        padding: 'var(--spacing-2xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    questionText: {
        fontSize: '1.5rem',
        lineHeight: 1.8,
        marginBottom: 'var(--spacing-xl)',
        color: 'var(--color-text-primary)',
    },
    optionsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    optionButton: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-lg)',
        textAlign: 'left',
        border: '2px solid var(--color-border)',
        background: 'var(--color-surface)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        position: 'relative',
    },
    optionButtonSelected: {
        borderColor: 'var(--color-info)',
        background: 'rgba(59, 130, 246, 0.1)',
    },
    optionLetter: {
        width: '2.5rem',
        height: '2.5rem',
        borderRadius: 'var(--radius-full)',
        background: 'var(--color-bg-tertiary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1.125rem',
        flexShrink: 0,
    },
    optionText: {
        flex: 1,
        fontSize: '1.125rem',
    },
    checkmark: {
        fontSize: '1.5rem',
        color: 'var(--color-success)',
    },
    navigation: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--spacing-lg)',
        marginBottom: 'var(--spacing-lg)',
    },
    navCenter: {
        flex: 1,
        textAlign: 'center',
    },
    answeredCount: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
    },
    questionGrid: {
        padding: 'var(--spacing-lg)',
    },
    questionGridTitle: {
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: 'var(--spacing-md)',
    },
    questionNumbers: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(3rem, 1fr))',
        gap: 'var(--spacing-sm)',
    },
    questionNumberButton: {
        width: '3rem',
        height: '3rem',
        borderRadius: 'var(--radius-md)',
        border: '2px solid var(--color-border)',
        background: 'var(--color-surface)',
        cursor: 'pointer',
        fontWeight: 600,
        transition: 'all var(--transition-fast)',
    },
    questionNumberActive: {
        borderColor: 'var(--color-info)',
        background: 'var(--color-info)',
        color: 'white',
    },
    questionNumberAnswered: {
        background: 'var(--color-bg-tertiary)',
    },
};

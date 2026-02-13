'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TOEICPart } from '@/types/question';
import { useAppContext } from '@/contexts/AppContext';
import Button from '@/components/shared/Button';

type MockTestPart = {
    part: TOEICPart;
    title: string;
    questionCount: number;
    timeLimit: number; // 分
};

const MOCK_TEST_PARTS: MockTestPart[] = [
    { part: 1, title: 'Part 1 - 写真描写', questionCount: 6, timeLimit: 3 },
    { part: 2, title: 'Part 2 - 応答問題', questionCount: 25, timeLimit: 8 },
    { part: 3, title: 'Part 3 - 会話問題', questionCount: 39, timeLimit: 17 },
    { part: 4, title: 'Part 4 - 説明文問題', questionCount: 30, timeLimit: 15 },
    { part: 5, title: 'Part 5 - 短文穴埋め', questionCount: 30, timeLimit: 10 },
    { part: 6, title: 'Part 6 - 長文穴埋め', questionCount: 16, timeLimit: 8 },
    { part: 7, title: 'Part 7 - 読解問題', questionCount: 54, timeLimit: 55 },
];

const TOTAL_QUESTIONS = MOCK_TEST_PARTS.reduce((sum, p) => sum + p.questionCount, 0);
const TOTAL_TIME = MOCK_TEST_PARTS.reduce((sum, p) => sum + p.timeLimit, 0);

export default function MockTestPage() {
    const router = useRouter();
    const { stats } = useAppContext();
    const [selectedFormat, setSelectedFormat] = useState<'full' | 'half'>('full');
    const [isStarted, setIsStarted] = useState(false);

    const handleStart = () => {
        // MVP: Part 5のみ実装されているため、Part 5の演習画面に遷移
        router.push('/practice/5?difficulty=normal&count=30');
    };

    return (
        <div className="animate-fade-in">
            {/* ヘッダー */}
            <header style={styles.header}>
                <Link href="/" style={styles.backLink}>
                    ← ホームに戻る
                </Link>
                <h1 style={styles.title}>📝 通し模試モード</h1>
                <p style={styles.subtitle}>
                    本番形式の模試で実力を測定し、弱点を分析しましょう
                </p>
            </header>

            {/* 模試形式選択 */}
            <div className="card" style={styles.formatCard}>
                <h2 style={styles.formatTitle}>模試形式を選択</h2>

                <div style={styles.formatOptions}>
                    <button
                        onClick={() => setSelectedFormat('full')}
                        style={{
                            ...styles.formatOption,
                            ...(selectedFormat === 'full' ? styles.formatOptionActive : {}),
                        }}
                        className="card"
                    >
                        <div style={styles.formatOptionHeader}>
                            <h3 style={styles.formatOptionTitle}>フル模試</h3>
                            {selectedFormat === 'full' && <span style={styles.checkmark}>✓</span>}
                        </div>
                        <div style={styles.formatOptionDetails}>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>問題数:</span>
                                <span style={styles.formatDetailValue}>{TOTAL_QUESTIONS}問</span>
                            </div>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>制限時間:</span>
                                <span style={styles.formatDetailValue}>{TOTAL_TIME}分 (約2時間)</span>
                            </div>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>パート:</span>
                                <span style={styles.formatDetailValue}>Part 1-7 すべて</span>
                            </div>
                        </div>
                        <p style={styles.formatDescription}>
                            本番と同じ形式で実力を測定。推定スコアと詳細な弱点分析が得られます。
                        </p>
                    </button>

                    <button
                        onClick={() => setSelectedFormat('half')}
                        style={{
                            ...styles.formatOption,
                            ...(selectedFormat === 'half' ? styles.formatOptionActive : {}),
                        }}
                        className="card"
                    >
                        <div style={styles.formatOptionHeader}>
                            <h3 style={styles.formatOptionTitle}>ハーフ模試</h3>
                            {selectedFormat === 'half' && <span style={styles.checkmark}>✓</span>}
                        </div>
                        <div style={styles.formatOptionDetails}>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>問題数:</span>
                                <span style={styles.formatDetailValue}>{Math.floor(TOTAL_QUESTIONS / 2)}問</span>
                            </div>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>制限時間:</span>
                                <span style={styles.formatDetailValue}>{Math.floor(TOTAL_TIME / 2)}分 (約1時間)</span>
                            </div>
                            <div style={styles.formatDetailItem}>
                                <span style={styles.formatDetailLabel}>パート:</span>
                                <span style={styles.formatDetailValue}>各パートから半分</span>
                            </div>
                        </div>
                        <p style={styles.formatDescription}>
                            時間がない時に。各パートの問題を半分ずつ出題します。
                        </p>
                    </button>
                </div>
            </div>

            {/* パート構成 */}
            <div className="card" style={styles.partsCard}>
                <h2 style={styles.partsTitle}>パート構成</h2>
                <div style={styles.partsList}>
                    {MOCK_TEST_PARTS.map((part, index) => (
                        <div key={part.part} style={styles.partItem}>
                            <div style={styles.partNumber}>Part {part.part}</div>
                            <div style={styles.partInfo}>
                                <div style={styles.partTitle}>{part.title}</div>
                                <div style={styles.partDetails}>
                                    {selectedFormat === 'full' ? part.questionCount : Math.floor(part.questionCount / 2)}問
                                    ・
                                    {selectedFormat === 'full' ? part.timeLimit : Math.floor(part.timeLimit / 2)}分
                                </div>
                            </div>
                            {stats.partStats[part.part] && stats.partStats[part.part].answered > 0 && (
                                <div style={styles.partStats}>
                                    正答率: {((stats.partStats[part.part].correct / stats.partStats[part.part].answered) * 100).toFixed(0)}%
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* 注意事項とスタートボタン */}
            <div className="card" style={styles.instructionsCard}>
                <h2 style={styles.instructionsTitle}>📋 受験上の注意</h2>
                <ul style={styles.instructionsList}>
                    <li>制限時間内に全問解答してください</li>
                    <li>途中で保存はできません（一度開始したら最後まで）</li>
                    <li>リスニング問題は自動再生されます</li>
                    <li>静かな環境で集中して受験してください</li>
                    <li>終了後、推定スコアと弱点分析が表示されます</li>
                </ul>

                <div style={styles.startButtonContainer}>
                    <Button
                        onClick={handleStart}
                        variant="primary"
                        size="lg"
                        style={styles.startButton}
                    >
                        🚀 模試を開始する
                    </Button>
                    <p style={styles.startNote}>
                        ※ MVP版では Part 5 の演習画面に移動します。<br />
                        完全な模試機能は今後実装予定です。
                    </p>
                </div>
            </div>

            {/* 過去の模試履歴（将来実装） */}
            <div className="card" style={styles.historyCard}>
                <h2 style={styles.historyTitle}>📊 過去の模試履歴</h2>
                <p style={styles.comingSoon}>この機能は近日公開予定です</p>
            </div>
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
    formatCard: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    formatTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
    },
    formatOptions: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 'var(--spacing-lg)',
    },
    formatOption: {
        padding: 'var(--spacing-xl)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        transition: 'all var(--transition-base)',
        textAlign: 'left',
        background: 'var(--color-surface)',
    },
    formatOptionActive: {
        borderColor: 'var(--color-success)',
        background: 'rgba(16, 185, 129, 0.05)',
    },
    formatOptionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-md)',
    },
    formatOptionTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        margin: 0,
    },
    checkmark: {
        fontSize: '1.5rem',
        color: 'var(--color-success)',
    },
    formatOptionDetails: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xs)',
        marginBottom: 'var(--spacing-md)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '1px solid var(--color-border)',
    },
    formatDetailItem: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.875rem',
    },
    formatDetailLabel: {
        color: 'var(--color-text-secondary)',
    },
    formatDetailValue: {
        fontWeight: 600,
        color: 'var(--color-text-primary)',
    },
    formatDescription: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        lineHeight: 1.6,
        marginBottom: 0,
    },
    partsCard: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    partsTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
    },
    partsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
    },
    partItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
    },
    partNumber: {
        width: '4rem',
        height: '4rem',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--gradient-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.875rem',
        flexShrink: 0,
    },
    partInfo: {
        flex: 1,
    },
    partTitle: {
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: 'var(--spacing-xs)',
    },
    partDetails: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
    partStats: {
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--color-success)',
    },
    instructionsCard: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    instructionsTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
    },
    instructionsList: {
        paddingLeft: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-xl)',
        lineHeight: 1.8,
    },
    startButtonContainer: {
        textAlign: 'center',
    },
    startButton: {
        fontSize: '1.125rem',
        padding: 'var(--spacing-lg) var(--spacing-2xl)',
        marginBottom: 'var(--spacing-md)',
    },
    startNote: {
        fontSize: '0.875rem',
        color: 'var(--color-text-tertiary)',
        fontStyle: 'italic',
        marginBottom: 0,
    },
    historyCard: {
        padding: 'var(--spacing-xl)',
    },
    historyTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
    },
    comingSoon: {
        textAlign: 'center',
        color: 'var(--color-text-tertiary)',
        fontSize: '0.875rem',
        padding: 'var(--spacing-xl)',
        marginBottom: 0,
    },
};

'use client';

import Link from 'next/link';
import { TOEICPart, Difficulty } from '@/types/question';

const PARTS: { part: TOEICPart; title: string; description: string; color: string }[] = [
    { part: 5, title: 'Part 5 - 短文穴埋め', description: '文法・語彙問題 (30問)', color: 'part5' },
    // 他のパートは将来実装
    // { part: 1, title: 'Part 1 - 写真描写', description: '写真を見て適切な文を選ぶ (6問)', color: 'part1' },
];

const DIFFICULTIES: { value: Difficulty; label: string; description: string }[] = [
    { value: 'easy', label: 'Easy', description: '600点レベル - 基礎固め' },
    { value: 'normal', label: 'Normal', description: '700点レベル - 実力養成' },
    { value: 'hard', label: 'Hard', description: '800〜900点レベル - 高得点狙い' },
];

export default function PracticePage() {
    return (
        <div className="animate-fade-in">
            <header style={styles.header}>
                <Link href="/" style={styles.backLink}>
                    ← ホームに戻る
                </Link>
                <h1 style={styles.title}>📚 パート別演習</h1>
                <p style={styles.subtitle}>
                    TOEICのパートと難易度を選んで集中演習しましょう
                </p>
            </header>

            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>パートを選択</h2>
                <div className="grid grid-2">
                    {PARTS.map((partInfo) => (
                        <div key={partInfo.part} className="card" style={styles.partCard}>
                            <div style={styles.partHeader}>
                                <h3 style={styles.partTitle}>{partInfo.title}</h3>
                                <div className={`badge badge-${partInfo.color}`}>
                                    Part {partInfo.part}
                                </div>
                            </div>
                            <p style={styles.partDescription}>{partInfo.description}</p>

                            <div style={styles.difficultyGrid}>
                                {DIFFICULTIES.map((diff) => (
                                    <Link
                                        key={diff.value}
                                        href={`/practice/${partInfo.part}?difficulty=${diff.value}`}
                                        style={styles.difficultyButton}
                                        className="btn btn-secondary"
                                    >
                                        <div>
                                            <div style={styles.difficultyLabel}>{diff.label}</div>
                                            <div style={styles.difficultyDesc}>{diff.description}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Coming Soon */}
                    <div className="card" style={{ ...styles.partCard, opacity: 0.6 }}>
                        <div style={styles.partHeader}>
                            <h3 style={styles.partTitle}>その他のパート</h3>
                            <div className="badge" style={{ background: 'var(--color-text-tertiary)' }}>
                                Coming Soon
                            </div>
                        </div>
                        <p style={styles.partDescription}>
                            Part 1〜4, 6, 7 は今後実装予定です
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        marginBottom: 'var(--spacing-2xl)',
    },
    backLink: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        fontSize: '0.875rem',
        marginBottom: 'var(--spacing-md)',
        transition: 'color var(--transition-fast)',
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
    section: {
        marginBottom: 'var(--spacing-2xl)',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
    },
    partCard: {
        padding: 'var(--spacing-xl)',
    },
    partHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--spacing-md)',
    },
    partTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        margin: 0,
    },
    partDescription: {
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-lg)',
    },
    difficultyGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
    },
    difficultyButton: {
        textAlign: 'left',
        padding: 'var(--spacing-md)',
        width: '100%',
    },
    difficultyLabel: {
        fontWeight: 700,
        fontSize: '1rem',
        marginBottom: 'var(--spacing-xs)',
    },
    difficultyDesc: {
        fontSize: '0.75rem',
        opacity: 0.8,
    },
};

'use client';

import { useState, JSX } from 'react';
import Link from 'next/link';
import { DiaryEntry, Correction } from '@/types/diary';
import { useAppContext } from '@/contexts/AppContext';
import Button from '@/components/shared/Button';

export default function DiaryPage() {
    const { stats, addDiaryEntry } = useAppContext();
    const [currentText, setCurrentText] = useState('');
    const [isCorrection, setIsCorrection] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
    const [isCorrecting, setIsCorrecting] = useState(false);

    // グローバル状態から日記を取得
    const entries = stats.diaryEntries;

    const handleSave = () => {
        if (!currentText.trim()) return;

        const newEntry: DiaryEntry = {
            id: `diary_${Date.now()}`,
            date: new Date(),
            originalText: currentText,
            isCorrected: false,
        };

        // グローバル状態を更新
        addDiaryEntry(newEntry);
        setCurrentText('');
    };

    const handleCorrect = async () => {
        if (!currentText.trim()) return;

        setIsCorrecting(true);

        // MVP: モック添削（本番ではOpenAI API使用）
        await new Promise(resolve => setTimeout(resolve, 1500));

        const mockCorrections: Correction[] = [
            {
                id: 'c1',
                originalText: 'I go to office',
                correctedText: 'I went to the office',
                reason: '過去の出来事なので過去形を使用。"office"には冠詞"the"が必要。',
                category: '時制・冠詞',
                startIndex: currentText.indexOf('I go to office'),
                endIndex: currentText.indexOf('I go to office') + 14,
            },
        ];

        const correctedText = applyCorrectionsMock(currentText);

        const correctedEntry: DiaryEntry = {
            id: `diary_${Date.now()}`,
            date: new Date(),
            originalText: currentText,
            correctedText: correctedText,
            corrections: mockCorrections,
            suggestions: [
                'Consider using more specific time expressions like "this morning" or "yesterday afternoon".',
                'Try using more varied sentence structures to make your writing more engaging.',
            ],
            isCorrected: true,
        };

        // グローバル状態を更新
        addDiaryEntry(correctedEntry);
        setSelectedEntry(correctedEntry);
        setIsCorrection(true);
        setIsCorrecting(false);
        setCurrentText('');
    };

    const applyCorrectionsMock = (text: string): string => {
        // シンプルなモック添削
        let corrected = text;
        corrected = corrected.replace(/I go to office/g, 'I went to the office');
        corrected = corrected.replace(/I am go/g, 'I went');
        corrected = corrected.replace(/very much/g, 'a lot');
        return corrected;
    };

    const viewEntry = (entry: DiaryEntry) => {
        setSelectedEntry(entry);
        setIsCorrection(entry.isCorrected);
    };

    const highlightCorrections = (text: string, corrections: Correction[]): JSX.Element[] => {
        if (!corrections || corrections.length === 0) {
            return [<span key="0">{text}</span>];
        }

        const parts: JSX.Element[] = [];
        let lastIndex = 0;

        corrections.forEach((correction, i) => {
            if (correction.startIndex > lastIndex) {
                parts.push(<span key={`text-${i}`}>{text.substring(lastIndex, correction.startIndex)}</span>);
            }

            parts.push(
                <mark key={`mark-${i}`} style={styles.highlight} title={correction.reason}>
                    {correction.originalText}
                </mark>
            );

            lastIndex = correction.endIndex;
        });

        if (lastIndex < text.length) {
            parts.push(<span key="end">{text.substring(lastIndex)}</span>);
        }

        return parts;
    };

    return (
        <div className="animate-fade-in">
            {/* ヘッダー */}
            <header style={styles.header}>
                <Link href="/" style={styles.backLink}>
                    ← ホームに戻る
                </Link>
                <h1 style={styles.title}>✍️ 英語日記</h1>
                <p style={styles.subtitle}>
                    AIが添削してより自然な英語表現を学びましょう
                </p>
            </header>

            <div className="grid grid-2" style={{ alignItems: 'start' }}>
                {/* 左側：入力エリア */}
                <div>
                    <div className="card" style={styles.editorCard}>
                        <h3 style={styles.editorTitle}>今日の日記</h3>
                        <textarea
                            value={currentText}
                            onChange={(e) => setCurrentText(e.target.value)}
                            placeholder="今日あったことを英語で書いてみましょう...

例:
Today I went to the office and had a meeting with my team. We discussed the new project and made some important decisions."
                            style={styles.textarea}
                        />

                        <div style={styles.editorActions}>
                            <div style={styles.charCount}>
                                {currentText.length} characters
                            </div>
                            <div style={styles.editorButtons}>
                                <Button
                                    onClick={handleSave}
                                    variant="secondary"
                                    disabled={!currentText.trim()}
                                >
                                    保存のみ
                                </Button>
                                <Button
                                    onClick={handleCorrect}
                                    variant="primary"
                                    disabled={!currentText.trim() || isCorrecting}
                                >
                                    {isCorrecting ? '添削中...' : '添削する ✨'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* 添削結果 */}
                    {isCorrection && selectedEntry && (
                        <div className="card" style={styles.correctionCard}>
                            <h3 style={styles.correctionTitle}>添削結果</h3>

                            {/* 添削前 */}
                            <div style={styles.correctionSection}>
                                <h4 style={styles.correctionSectionTitle}>添削前</h4>
                                <div style={styles.correctionText}>
                                    {selectedEntry.corrections && selectedEntry.corrections.length > 0
                                        ? highlightCorrections(selectedEntry.originalText, selectedEntry.corrections)
                                        : selectedEntry.originalText}
                                </div>
                            </div>

                            {/* 添削後 */}
                            <div style={styles.correctionSection}>
                                <h4 style={styles.correctionSectionTitle}>添削後</h4>
                                <div style={styles.correctionText}>
                                    {selectedEntry.correctedText}
                                </div>
                            </div>

                            {/* 修正箇所 */}
                            {selectedEntry.corrections && selectedEntry.corrections.length > 0 && (
                                <div style={styles.correctionSection}>
                                    <h4 style={styles.correctionSectionTitle}>修正箇所</h4>
                                    {selectedEntry.corrections.map((correction) => (
                                        <div key={correction.id} style={styles.correctionItem}>
                                            <div style={styles.correctionChange}>
                                                <span style={styles.correctionOriginal}>{correction.originalText}</span>
                                                <span style={styles.correctionArrow}>→</span>
                                                <span style={styles.correctionCorrected}>{correction.correctedText}</span>
                                            </div>
                                            <div style={styles.correctionReason}>
                                                <strong>{correction.category}:</strong> {correction.reason}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* 提案 */}
                            {selectedEntry.suggestions && selectedEntry.suggestions.length > 0 && (
                                <div style={styles.correctionSection}>
                                    <h4 style={styles.correctionSectionTitle}>💡 より良い表現のヒント</h4>
                                    <ul style={styles.suggestionsList}>
                                        {selectedEntry.suggestions.map((suggestion, i) => (
                                            <li key={i} style={styles.suggestionItem}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 右側：履歴 */}
                <div className="card" style={styles.historyCard}>
                    <h3 style={styles.historyTitle}>📚 過去の日記</h3>

                    {entries.length === 0 ? (
                        <p style={styles.emptyHistory}>まだ日記がありません</p>
                    ) : (
                        <div style={styles.entriesList}>
                            {entries.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => viewEntry(entry)}
                                    style={{
                                        ...styles.entryItem,
                                        ...(selectedEntry?.id === entry.id ? styles.entryItemActive : {}),
                                    }}
                                    className="card"
                                >
                                    <div style={styles.entryHeader}>
                                        <span style={styles.entryDate}>
                                            {new Date(entry.date).toLocaleDateString('ja-JP', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </span>
                                        {entry.isCorrected && (
                                            <span style={styles.correctedBadge}>✓ 添削済み</span>
                                        )}
                                    </div>
                                    <div style={styles.entryPreview}>
                                        {entry.originalText.substring(0, 100)}
                                        {entry.originalText.length > 100 ? '...' : ''}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
    editorCard: {
        padding: 'var(--spacing-xl)',
        marginBottom: 'var(--spacing-lg)',
    },
    editorTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
    },
    textarea: {
        width: '100%',
        minHeight: '250px',
        padding: 'var(--spacing-md)',
        border: '2px solid var(--color-border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '1rem',
        fontFamily: 'var(--font-sans)',
        lineHeight: 1.8,
        resize: 'vertical',
        background: 'var(--color-bg-secondary)',
        color: 'var(--color-text-primary)',
        transition: 'border-color var(--transition-fast)',
    },
    editorActions: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 'var(--spacing-md)',
    },
    charCount: {
        fontSize: '0.875rem',
        color: 'var(--color-text-tertiary)',
    },
    editorButtons: {
        display: 'flex',
        gap: 'var(--spacing-md)',
    },
    correctionCard: {
        padding: 'var(--spacing-xl)',
    },
    correctionTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-lg)',
        color: 'var(--color-success)',
    },
    correctionSection: {
        marginBottom: 'var(--spacing-xl)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
    },
    correctionSectionTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text-secondary)',
    },
    correctionText: {
        fontSize: '1.125rem',
        lineHeight: 1.8,
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
    },
    highlight: {
        background: 'rgba(239, 68, 68, 0.2)',
        borderBottom: '2px solid var(--color-error)',
        cursor: 'help',
    },
    correctionItem: {
        padding: 'var(--spacing-md)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-sm)',
    },
    correctionChange: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-sm)',
        fontSize: '1rem',
    },
    correctionOriginal: {
        color: 'var(--color-error)',
        textDecoration: 'line-through',
    },
    correctionArrow: {
        color: 'var(--color-text-tertiary)',
    },
    correctionCorrected: {
        color: 'var(--color-success)',
        fontWeight: 600,
    },
    correctionReason: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
    },
    suggestionsList: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
    },
    suggestionItem: {
        padding: 'var(--spacing-md)',
        background: 'rgba(59, 130, 246, 0.1)',
        borderLeft: '4px solid var(--color-info)',
        borderRadius: 'var(--radius-md)',
        marginBottom: 'var(--spacing-sm)',
        fontSize: '0.875rem',
    },
    historyCard: {
        padding: 'var(--spacing-lg)',
        position: 'sticky',
        top: 'calc(4rem + var(--spacing-lg))',
        maxHeight: 'calc(100vh - 6rem)',
        overflowY: 'auto',
    },
    historyTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
    },
    emptyHistory: {
        textAlign: 'center',
        color: 'var(--color-text-tertiary)',
        fontSize: '0.875rem',
        padding: 'var(--spacing-xl)',
    },
    entriesList: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)',
    },
    entryItem: {
        padding: 'var(--spacing-md)',
        border: '2px solid transparent',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--transition-fast)',
        width: '100%',
        background: 'var(--color-bg-secondary)',
    },
    entryItemActive: {
        borderColor: 'var(--color-info)',
        background: 'rgba(59, 130, 246, 0.1)',
    },
    entryHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--spacing-xs)',
    },
    entryDate: {
        fontSize: '0.75rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
    },
    correctedBadge: {
        fontSize: '0.625rem',
        padding: '2px 6px',
        background: 'var(--color-success)',
        color: 'white',
        borderRadius: 'var(--radius-sm)',
    },
    entryPreview: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
        color: 'var(--color-text-primary)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
    },
};

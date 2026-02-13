'use client';

import { useState } from 'react';
import { ExplanationChunk } from '@/types/question';

interface ExplanationBlockProps {
    chunks: ExplanationChunk[];
    fullTranslation: string;
    paraphrase?: string;
    questionIntent: string;
    attackStrategy: string;
}

export default function ExplanationBlock({
    chunks,
    fullTranslation,
    paraphrase,
    questionIntent,
    attackStrategy,
}: ExplanationBlockProps) {
    const [selectedChunk, setSelectedChunk] = useState<ExplanationChunk | null>(null);

    const handleChunkClick = (chunk: ExplanationChunk) => {
        setSelectedChunk(chunk);
    };

    const closeModal = () => {
        setSelectedChunk(null);
    };

    return (
        <div style={styles.container}>
            {/* クリック可能な塊構造 */}
            <div style={styles.chunksContainer}>
                <h4 style={styles.sectionTitle}>🔍 文章の構造（クリックで詳細表示）</h4>
                <div style={styles.chunks}>
                    {chunks.map((chunk) => (
                        <button
                            key={chunk.id}
                            onClick={() => handleChunkClick(chunk)}
                            style={styles.chunkButton}
                            className="card"
                        >
                            {chunk.text}
                        </button>
                    ))}
                </div>
                <p style={styles.hint}>
                    💡 各塊をクリックすると、文法解説・意味・TOEIC攻略ポイントが表示されます
                </p>
            </div>

            {/* 全体解説 */}
            <div style={styles.overallSection}>
                <div style={styles.translationBox}>
                    <h4 style={styles.translationTitle}>日本語訳</h4>
                    <p style={styles.translationText}>{fullTranslation}</p>
                </div>

                {paraphrase && (
                    <div style={styles.paraphraseBox}>
                        <h4 style={styles.paraphraseTitle}>パラフレーズ</h4>
                        <p style={styles.paraphraseText}>{paraphrase}</p>
                    </div>
                )}

                <div style={styles.intentBox}>
                    <h4 style={styles.intentTitle}>📌 出題意図</h4>
                    <p style={styles.intentText}>{questionIntent}</p>
                </div>

                <div style={styles.strategyBox}>
                    <h4 style={styles.strategyTitle}>🎯 攻略法</h4>
                    <p style={styles.strategyText}>{attackStrategy}</p>
                </div>
            </div>

            {/* モーダル */}
            {selectedChunk && (
                <div style={styles.modal} onClick={closeModal}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()} className="card">
                        <button onClick={closeModal} style={styles.closeButton}>
                            ✕
                        </button>

                        <h3 style={styles.modalChunkText}>{selectedChunk.text}</h3>

                        <div style={styles.modalSection}>
                            <div style={styles.modalLabel}>意味</div>
                            <div style={styles.modalValue}>{selectedChunk.meaning}</div>
                        </div>

                        <div style={styles.modalSection}>
                            <div style={styles.modalLabel}>役割</div>
                            <div style={styles.modalValue}>{selectedChunk.role}</div>
                        </div>

                        {selectedChunk.grammarPoint && (
                            <div style={styles.modalSection}>
                                <div style={styles.modalLabel}>文法ポイント</div>
                                <div style={styles.modalValue}>{selectedChunk.grammarPoint}</div>
                            </div>
                        )}

                        {selectedChunk.toeicTip && (
                            <div style={{ ...styles.modalSection, ...styles.toeicTipSection }}>
                                <div style={styles.modalLabel}>💡 TOEIC頻出ポイント</div>
                                <div style={styles.modalValue}>{selectedChunk.toeicTip}</div>
                            </div>
                        )}

                        {selectedChunk.whyThisAnswer && (
                            <div style={{ ...styles.modalSection, ...styles.answerSection }}>
                                <div style={styles.modalLabel}>✅ なぜこの選択肢か</div>
                                <div style={styles.modalValue}>{selectedChunk.whyThisAnswer}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-xl)',
    },
    chunksContainer: {
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
    },
    sectionTitle: {
        fontSize: '1.125rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-md)',
        color: 'var(--color-text-primary)',
    },
    chunks: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--spacing-sm)',
        marginBottom: 'var(--spacing-md)',
    },
    chunkButton: {
        padding: 'var(--spacing-sm) var(--spacing-md)',
        border: '2px solid var(--color-info)',
        background: 'rgba(59, 130, 246, 0.05)',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        fontSize: '1.125rem',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
        color: 'var(--color-text-primary)',
    },
    hint: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        fontStyle: 'italic',
        marginBottom: 0,
    },
    overallSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-md)',
    },
    translationBox: {
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        borderLeft: '4px solid var(--color-success)',
    },
    translationTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-success)',
    },
    translationText: {
        fontSize: '1.125rem',
        lineHeight: 1.8,
        marginBottom: 0,
    },
    paraphraseBox: {
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        borderLeft: '4px solid var(--color-info)',
    },
    paraphraseTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-info)',
    },
    paraphraseText: {
        fontSize: '1rem',
        lineHeight: 1.8,
        marginBottom: 0,
        fontStyle: 'italic',
    },
    intentBox: {
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        borderLeft: '4px solid var(--color-warning)',
    },
    intentTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-warning)',
    },
    intentText: {
        fontSize: '1rem',
        marginBottom: 0,
    },
    strategyBox: {
        padding: 'var(--spacing-lg)',
        background: 'var(--color-bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        borderLeft: '4px solid var(--color-part4)',
    },
    strategyTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-sm)',
        color: 'var(--color-part4)',
    },
    strategyText: {
        fontSize: '1rem',
        marginBottom: 0,
    },
    modal: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 'var(--spacing-lg)',
        backdropFilter: 'blur(4px)',
    },
    modalContent: {
        maxWidth: '600px',
        width: '100%',
        maxHeight: '80vh',
        overflow: 'auto',
        padding: 'var(--spacing-2xl)',
        position: 'relative',
    },
    closeButton: {
        position: 'absolute',
        top: 'var(--spacing-md)',
        right: 'var(--spacing-md)',
        background: 'var(--color-bg-tertiary)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        width: '2.5rem',
        height: '2.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '1.25rem',
        transition: 'all var(--transition-fast)',
    },
    modalChunkText: {
        fontSize: '1.5rem',
        fontWeight: 700,
        marginBottom: 'var(--spacing-xl)',
        paddingRight: 'var(--spacing-2xl)',
        color: 'var(--color-info)',
    },
    modalSection: {
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--color-border)',
    },
    modalLabel: {
        fontSize: '0.875rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 'var(--spacing-xs)',
    },
    modalValue: {
        fontSize: '1.125rem',
        lineHeight: 1.8,
        color: 'var(--color-text-primary)',
    },
    toeicTipSection: {
        background: 'rgba(245, 158, 11, 0.1)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--color-warning)',
    },
    answerSection: {
        background: 'rgba(16, 185, 129, 0.1)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        borderLeft: '4px solid var(--color-success)',
        borderBottom: 'none',
        marginBottom: 0,
        paddingBottom: 'var(--spacing-md)',
    },
};

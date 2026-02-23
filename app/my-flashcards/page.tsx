'use client';

import { useState, useEffect, useMemo } from 'react';
import { MyFlashcard } from '@/types/flashcard';
import Button from '@/components/shared/Button';
import Link from 'next/link';

export default function MyFlashcardsPage() {
    const [cards, setCards] = useState<MyFlashcard[]>([]);
    const [english, setEnglish] = useState('');
    const [japanese, setJapanese] = useState('');
    const [mode, setMode] = useState<'list' | 'study'>('list');
    const [studyOrder, setStudyOrder] = useState<'sequential' | 'random'>('sequential');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [shuffledIndices, setShuffledIndices] = useState<number[]>([]);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('my_flashcards');
        if (saved) {
            setCards(JSON.parse(saved));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('my_flashcards', JSON.stringify(cards));
    }, [cards]);

    // Handle study session start/shuffle
    useEffect(() => {
        if (mode === 'study') {
            const indices = Array.from({ length: cards.length }, (_, i) => i);
            if (studyOrder === 'random') {
                // Fisher-Yates shuffle
                for (let i = indices.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [indices[i], indices[j]] = [indices[j], indices[i]];
                }
            }
            setShuffledIndices(indices);
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    }, [mode, studyOrder, cards.length]);

    const handleAddCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!english.trim() || !japanese.trim()) return;

        const newCard: MyFlashcard = {
            id: (Date.now() + Math.random()).toString(),
            english: english.trim(),
            japanese: japanese.trim(),
            createdAt: Date.now(),
        };

        setCards([newCard, ...cards]);
        setEnglish('');
        setJapanese('');
    };

    const handleDeleteCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
    };

    const currentCard = mode === 'study' && shuffledIndices.length > 0
        ? cards[shuffledIndices[currentIndex]]
        : null;

    const handleNext = () => {
        if (currentIndex < shuffledIndices.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setIsFlipped(false);
        } else {
            // Loop back to start
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    return (
        <div className="container animate-fade-in" style={styles.container}>
            <header style={styles.header}>
                <div style={styles.headerNav}>
                    <Link href="/" style={styles.backLink}>← ホームに戻る</Link>
                </div>
                <h1 style={styles.title}>🗂️ My Flashcards</h1>
                <p style={styles.subtitle}>自分専用の英単語帳を作成して学習しましょう</p>
            </header>

            {/* Mode Switcher */}
            <div style={styles.modeSwitcher}>
                <button
                    onClick={() => setMode('list')}
                    style={{ ...styles.modeTab, ...(mode === 'list' ? styles.activeTab : {}) }}
                >
                    カード一覧・登録
                </button>
                <button
                    onClick={() => {
                        if (cards.length === 0) {
                            alert('カードを登録してください');
                            return;
                        }
                        setMode('study');
                    }}
                    style={{ ...styles.modeTab, ...(mode === 'study' ? styles.activeTab : {}) }}
                >
                    学習モード
                </button>
            </div>

            {mode === 'list' ? (
                <div className="animate-fade-in">
                    {/* Registration Form */}
                    <div className="card" style={styles.formCard}>
                        <h3 style={styles.sectionTitle}>新しいカードを追加</h3>
                        <form onSubmit={handleAddCard} style={styles.form}>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>英語</label>
                                <input
                                    type="text"
                                    value={english}
                                    onChange={(e) => setEnglish(e.target.value)}
                                    placeholder="例: innovative"
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <div style={styles.inputGroup}>
                                <label style={styles.label}>日本語</label>
                                <input
                                    type="text"
                                    value={japanese}
                                    onChange={(e) => setJapanese(e.target.value)}
                                    placeholder="例: 革新的な"
                                    style={styles.input}
                                    required
                                />
                            </div>
                            <Button type="submit" variant="primary" style={styles.submitBtn}>
                                追加する
                            </Button>
                        </form>
                    </div>

                    {/* Card List */}
                    <div style={styles.listSection}>
                        <h3 style={styles.sectionTitle}>カード一覧 ({cards.length})</h3>
                        {cards.length === 0 ? (
                            <p style={styles.emptyMsg}>カードがありません。上のフォームから追加してください。</p>
                        ) : (
                            <div style={styles.cardGrid}>
                                {cards.map(card => (
                                    <div key={card.id} className="card" style={styles.listItem}>
                                        <div style={styles.listItemContent}>
                                            <div style={styles.itemEnglish}>{card.english}</div>
                                            <div style={styles.itemJapanese}>{card.japanese}</div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteCard(card.id)}
                                            style={styles.deleteBtn}
                                            title="削除"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    {/* Study Settings */}
                    <div style={styles.studySettings}>
                        <div style={styles.orderToggle}>
                            <button
                                onClick={() => setStudyOrder('sequential')}
                                style={{ ...styles.settingBtn, ...(studyOrder === 'sequential' ? styles.activeSetting : {}) }}
                            >
                                順序表示
                            </button>
                            <button
                                onClick={() => setStudyOrder('random')}
                                style={{ ...styles.settingBtn, ...(studyOrder === 'random' ? styles.activeSetting : {}) }}
                            >
                                ランダム表示
                            </button>
                        </div>
                        <div style={styles.studyProgress}>
                            {currentIndex + 1} / {cards.length}
                        </div>
                    </div>

                    {/* Flashcard */}
                    <div
                        style={{ ...styles.flashcardContainer, ...(isFlipped ? styles.flashcardFlipped : {}) }}
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        <div className="card" style={styles.flashcard}>
                            {!isFlipped ? (
                                <div style={styles.cardFront}>
                                    <div style={styles.cardWord}>{currentCard?.english}</div>
                                    <div style={styles.flipHint}>クリックで答えを表示</div>
                                </div>
                            ) : (
                                <div style={styles.cardBack}>
                                    <div style={styles.cardMeaning}>{currentCard?.japanese}</div>
                                    <div style={styles.flipHint}>クリックで表面に戻る</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div style={styles.studyNav}>
                        <Button onClick={handleNext} variant="primary" size="lg" style={styles.nextBtn}>
                            {currentIndex === shuffledIndices.length - 1 ? '最初からやり直す' : '次のカードへ →'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '2rem 1rem',
    },
    header: {
        marginBottom: '2rem',
    },
    headerNav: {
        marginBottom: '1rem',
    },
    backLink: {
        color: 'var(--color-text-secondary)',
        textDecoration: 'none',
        fontSize: '0.875rem',
    },
    title: {
        fontSize: '2.5rem',
        fontWeight: 700,
        marginBottom: '0.5rem',
    },
    subtitle: {
        color: 'var(--color-text-secondary)',
        fontSize: '1.125rem',
    },
    modeSwitcher: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--color-border)',
        paddingBottom: '1rem',
    },
    modeTab: {
        background: 'none',
        border: 'none',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 600,
        color: 'var(--color-text-secondary)',
        transition: 'all 0.2s',
    },
    activeTab: {
        color: 'var(--color-primary)',
        borderBottom: '2px solid var(--color-primary)',
    },
    formCard: {
        padding: '1.5rem',
        marginBottom: '2rem',
    },
    sectionTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '1.5rem',
    },
    form: {
        display: 'flex',
        gap: '1rem',
        alignItems: 'flex-end',
        flexWrap: 'wrap',
    },
    inputGroup: {
        flex: 1,
        minWidth: '200px',
    },
    label: {
        display: 'block',
        fontSize: '0.875rem',
        fontWeight: 600,
        marginBottom: '0.5rem',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        background: 'var(--color-bg-secondary)',
        fontSize: '1rem',
    },
    submitBtn: {
        height: '46px',
    },
    listSection: {
        marginTop: '2rem',
    },
    emptyMsg: {
        textAlign: 'center',
        color: 'var(--color-text-tertiary)',
        padding: '3rem 0',
    },
    cardGrid: {
        display: 'grid',
        gap: '1rem',
    },
    listItem: {
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    listItemContent: {
        display: 'flex',
        gap: '2rem',
    },
    itemEnglish: {
        fontWeight: 700,
        fontSize: '1.125rem',
        width: '120px',
    },
    itemJapanese: {
        color: 'var(--color-text-secondary)',
    },
    deleteBtn: {
        background: 'none',
        border: 'none',
        fontSize: '1.25rem',
        cursor: 'pointer',
        opacity: 0.6,
        transition: 'opacity 0.2s',
    },
    studySettings: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    orderToggle: {
        background: 'var(--color-bg-tertiary)',
        padding: '0.25rem',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: '0.25rem',
    },
    settingBtn: {
        padding: '0.5rem 1rem',
        border: 'none',
        background: 'none',
        borderRadius: 'var(--radius-sm)',
        fontSize: '0.875rem',
        fontWeight: 600,
        cursor: 'pointer',
        color: 'var(--color-text-secondary)',
    },
    activeSetting: {
        background: 'var(--color-surface)',
        color: 'var(--color-primary)',
        boxShadow: 'var(--shadow-sm)',
    },
    studyProgress: {
        fontSize: '1.125rem',
        fontWeight: 700,
        color: 'var(--color-text-secondary)',
    },
    flashcardContainer: {
        perspective: '1000px',
        height: '350px',
        marginBottom: '2rem',
        cursor: 'pointer',
    },
    flashcard: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        transition: 'transform 0.3s ease-in-out',
    },
    flashcardFlipped: {
        transform: 'scale(1.02)',
    },
    cardFront: {
        width: '100%',
    },
    cardBack: {
        width: '100%',
    },
    cardWord: {
        fontSize: '3.5rem',
        fontWeight: 700,
        marginBottom: '1rem',
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    cardMeaning: {
        fontSize: '3rem',
        fontWeight: 700,
        color: 'var(--color-success)',
        marginBottom: '1rem',
    },
    flipHint: {
        fontSize: '0.875rem',
        color: 'var(--color-text-tertiary)',
        fontStyle: 'italic',
    },
    studyNav: {
        display: 'flex',
        justifyContent: 'center',
    },
    nextBtn: {
        minWidth: '250px',
    },
};

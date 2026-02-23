'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function Navigation() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // 初期テーマ設定
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(initialTheme);
        document.documentElement.setAttribute('data-theme', initialTheme);
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.navContainer}>
                <Link href="/" style={styles.logo}>
                    <span style={styles.logoIcon}>🎯</span>
                    <span style={styles.logoText}>TOEIC Master AI</span>
                </Link>

                <div style={styles.navLinks}>
                    <Link href="/practice" style={styles.navLink}>
                        <span>📚</span>
                        <span>パート別演習</span>
                    </Link>
                    <Link href="/mock-test" style={styles.navLink}>
                        <span>📝</span>
                        <span>通し模試</span>
                    </Link>
                    <Link href="/vocabulary" style={styles.navLink}>
                        <span>📖</span>
                        <span>単語学習</span>
                    </Link>
                    <Link href="/my-flashcards" style={styles.navLink}>
                        <span>🗂️</span>
                        <span>自作カード</span>
                    </Link>
                    <Link href="/diary" style={styles.navLink}>
                        <span>✍️</span>
                        <span>英語日記</span>
                    </Link>

                    <button onClick={toggleTheme} style={styles.themeToggle} aria-label="テーマ切替">
                        {theme === 'light' ? '🌙' : '☀️'}
                    </button>
                </div>
            </div>
        </nav>
    );
}

const styles: Record<string, React.CSSProperties> = {
    nav: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 1000,
        transition: 'all var(--transition-base)',
    },
    navContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '4rem',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-sm)',
        textDecoration: 'none',
        color: 'var(--color-text-primary)',
        fontWeight: 700,
        fontSize: '1.25rem',
        transition: 'transform var(--transition-fast)',
    },
    logoIcon: {
        fontSize: '1.5rem',
    },
    logoText: {
        background: 'var(--gradient-primary)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)',
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-xs)',
        textDecoration: 'none',
        color: 'var(--color-text-secondary)',
        padding: 'var(--spacing-sm) var(--spacing-md)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'all var(--transition-fast)',
    },
    themeToggle: {
        background: 'var(--color-bg-tertiary)',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-sm)',
        fontSize: '1.25rem',
        cursor: 'pointer',
        transition: 'all var(--transition-fast)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '2.5rem',
        height: '2.5rem',
    },
};

'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import StatsCard from '@/components/home/StatsCard';
import ProgressChart from '@/components/home/ProgressChart';
import { useAppContext } from '@/contexts/AppContext';

export default function HomePage() {
  const { stats, getTodayStats, getRecentHistory } = useAppContext();
  const todayStats = getTodayStats();
  const recentHistory = getRecentHistory(7);

  // 推定TOEICスコア計算（簡易版）
  const estimatedScore = stats.totalAnswered > 0
    ? Math.min(990, Math.round(300 + (stats.totalCorrect / stats.totalAnswered) * 690))
    : 0;

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* ヘッダー */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          <span style={styles.greeting}>おかえりなさい！</span>
          <span style={styles.subtitle}>今日も一緒に800点を目指しましょう 🎯</span>
        </h1>
      </header>

      {/* 今日の統計 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📊 今日の学習</h2>
        <div className="grid grid-4">
          <StatsCard
            icon="⏱️"
            label="学習時間"
            value={todayStats.studyTime.toFixed(0)}
            unit="分"
          />
          <StatsCard
            icon="✏️"
            label="解答数"
            value={todayStats.answered}
            unit="問"
          />
          <StatsCard
            icon="✅"
            label="今日の正答率"
            value={todayStats.accuracy.toFixed(1)}
            unit="%"
          />
          <StatsCard
            icon="🎯"
            label="推定スコア"
            value={estimatedScore}
            unit="点"
          />
        </div>
      </section>

      {/* 累計統計 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>📈 累計統計</h2>
        <div className="grid grid-4">
          <StatsCard
            icon="📝"
            label="累計解答数"
            value={stats.totalAnswered}
            unit="問"
          />
          <StatsCard
            icon="⭐"
            label="累計正答率"
            value={stats.totalAnswered > 0 ? ((stats.totalCorrect / stats.totalAnswered) * 100).toFixed(1) : 0}
            unit="%"
          />
          <StatsCard
            icon="📖"
            label="習得単語"
            value={stats.vocabStats.masteredWords}
            unit="/{stats.vocabStats.totalWords}"
          />
          <StatsCard
            icon="✍️"
            label="日記エントリー"
            value={stats.diaryEntries.length}
            unit="件"
          />
        </div>
      </section>

      {/* 推移グラフ */}
      <section style={styles.section}>
        <div className="grid grid-2">
          <ProgressChart
            data={recentHistory.map(h => ({
              date: h.date,
              studyTime: h.studyTime,
              questionsAnswered: h.answered,
              correctAnswers: h.correct,
              accuracy: h.answered > 0 ? (h.correct / h.answered) * 100 : 0,
            }))}
            metric="accuracy"
          />
          <ProgressChart
            data={recentHistory.map(h => ({
              date: h.date,
              studyTime: h.studyTime,
              questionsAnswered: h.answered,
              correctAnswers: h.correct,
              accuracy: h.answered > 0 ? (h.correct / h.answered) * 100 : 0,
            }))}
            metric="questionsAnswered"
          />
        </div>
      </section>

      {/* モード選択 */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>🚀 学習モード</h2>
        <div className="grid grid-2">
          <Link href="/practice" style={styles.modeCard} className="card">
            <div style={{ ...styles.modeIcon, background: 'var(--color-practice)' }}>
              📚
            </div>
            <div style={styles.modeContent}>
              <h3 style={styles.modeTitle}>パート別演習</h3>
              <p style={styles.modeDescription}>
                Part 1〜7から選択して集中演習。AIが生成するTOEIC形式問題で実力アップ。
              </p>
              {stats.partStats[5] && stats.partStats[5].answered > 0 && (
                <div style={styles.modeStats}>
                  Part 5正答率: {((stats.partStats[5].correct / stats.partStats[5].answered) * 100).toFixed(1)}%
                </div>
              )}
            </div>
            <div style={styles.modeArrow}>→</div>
          </Link>

          <Link href="/mock-test" style={styles.modeCard} className="card">
            <div style={{ ...styles.modeIcon, background: 'var(--color-mock)' }}>
              📝
            </div>
            <div style={styles.modeContent}>
              <h3 style={styles.modeTitle}>通し模試</h3>
              <p style={styles.modeDescription}>
                本番形式の模試でスコア予測。弱点分析機能で効率的な復習が可能。
              </p>
            </div>
            <div style={styles.modeArrow}>→</div>
          </Link>

          <Link href="/vocabulary" style={styles.modeCard} className="card">
            <div style={{ ...styles.modeIcon, background: 'var(--color-vocab)' }}>
              📖
            </div>
            <div style={styles.modeContent}>
              <h3 style={styles.modeTitle}>単語学習</h3>
              <p style={styles.modeDescription}>
                TOEIC重要1,000語を間隔反復で効率学習。音声付きで発音も完璧に。
              </p>
              {stats.vocabStats.weakWords.length > 0 && (
                <div style={styles.modeStats}>
                  <Link href="/vocabulary/weak" style={styles.weakWordsLink}>
                    💪 苦手単語 {stats.vocabStats.weakWords.length}個
                  </Link>
                </div>
              )}
            </div>
            <div style={styles.modeArrow}>→</div>
          </Link>

          <Link href="/diary" style={styles.modeCard} className="card">
            <div style={{ ...styles.modeIcon, background: 'var(--color-diary)' }}>
              ✍️
            </div>
            <div style={styles.modeContent}>
              <h3 style={styles.modeTitle}>英語日記</h3>
              <p style={styles.modeDescription}>
                毎日の英語日記をAIが添削。自然な表現を学んでライティング力向上。
              </p>
              {stats.diaryEntries.length > 0 && (
                <div style={styles.modeStats}>
                  累計 {stats.diaryEntries.length}件の日記
                </div>
              )}
            </div>
            <div style={styles.modeArrow}>→</div>
          </Link>
        </div>
      </section>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    paddingBottom: 'var(--spacing-2xl)',
  },
  header: {
    marginBottom: 'var(--spacing-2xl)',
  },
  title: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-sm)',
  },
  greeting: {
    fontSize: '2.5rem',
    fontWeight: 700,
    background: 'var(--gradient-primary)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  subtitle: {
    fontSize: '1.25rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 400,
  },
  section: {
    marginBottom: 'var(--spacing-2xl)',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-lg)',
    color: 'var(--color-text-primary)',
  },
  modeCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-lg)',
    padding: 'var(--spacing-xl)',
    textDecoration: 'none',
    color: 'var(--color-text-primary)',
    position: 'relative',
    cursor: 'pointer',
  },
  modeIcon: {
    width: '4rem',
    height: '4rem',
    borderRadius: 'var(--radius-lg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    flexShrink: 0,
  },
  modeContent: {
    flex: 1,
  },
  modeTitle: {
    fontSize: '1.25rem',
    fontWeight: 700,
    marginBottom: 'var(--spacing-xs)',
  },
  modeDescription: {
    fontSize: '0.875rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.6,
    marginBottom: 0,
  },
  modeStats: {
    marginTop: 'var(--spacing-sm)',
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--color-info)',
  },
  weakWordsLink: {
    color: 'var(--color-warning)',
    textDecoration: 'none',
  },
  modeArrow: {
    fontSize: '1.5rem',
    color: 'var(--color-text-tertiary)',
    transition: 'transform var(--transition-fast)',
  },
};

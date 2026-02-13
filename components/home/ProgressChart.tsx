import React from 'react';
import { DailyStats } from '@/types/userStats';

interface ProgressChartProps {
    data: DailyStats[];
    metric: 'accuracy' | 'questionsAnswered';
}

export default function ProgressChart({ data, metric }: ProgressChartProps) {
    if (data.length === 0) {
        return (
            <div className="card" style={styles.emptyState}>
                <p style={styles.emptyText}>まだデータがありません</p>
            </div>
        );
    }

    const values = data.map(d => metric === 'accuracy' ? d.accuracy : d.questionsAnswered);
    const maxValue = Math.max(...values, 1);
    const minValue = Math.min(...values, 0);

    const width = 600;
    const height = 200;
    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // データポイントの座標計算
    const points = data.map((d, i) => {
        const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
        const value = metric === 'accuracy' ? d.accuracy : d.questionsAnswered;
        const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue || 1)) * chartHeight;
        return { x, y, value, date: d.date };
    });

    // SVGパスの生成
    const pathData = points.map((p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    ).join(' ');

    return (
        <div className="card" style={styles.container}>
            <h3 style={styles.title}>
                直近7日間の推移 - {metric === 'accuracy' ? '正答率' : '解答数'}
            </h3>

            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
                {/* グリッドライン */}
                {[0, 25, 50, 75, 100].map((percent, i) => {
                    const y = padding.top + chartHeight - (percent / 100) * chartHeight;
                    return (
                        <g key={i}>
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke="var(--color-border)"
                                strokeDasharray="4 4"
                            />
                            <text
                                x={padding.left - 10}
                                y={y + 4}
                                textAnchor="end"
                                fontSize="12"
                                fill="var(--color-text-tertiary)"
                            >
                                {metric === 'accuracy' ? `${percent}%` : Math.round((maxValue * percent) / 100)}
                            </text>
                        </g>
                    );
                })}

                {/* ラインチャート */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="url(#lineGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* エリア塗りつぶし */}
                <path
                    d={`${pathData} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${padding.left} ${padding.top + chartHeight} Z`}
                    fill="url(#areaGradient)"
                    opacity="0.2"
                />

                {/* データポイント */}
                {points.map((p, i) => (
                    <g key={i}>
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="5"
                            fill="var(--color-info)"
                            stroke="var(--color-surface)"
                            strokeWidth="2"
                        />
                        <title>{`${p.date}: ${p.value.toFixed(metric === 'accuracy' ? 1 : 0)}${metric === 'accuracy' ? '%' : '問'}`}</title>
                    </g>
                ))}

                {/* X軸ラベル */}
                {points.map((p, i) => {
                    const date = new Date(p.date);
                    const label = `${date.getMonth() + 1}/${date.getDate()}`;
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={height - 10}
                            textAnchor="middle"
                            fontSize="11"
                            fill="var(--color-text-tertiary)"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* グラデーション定義 */}
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" />
                    </linearGradient>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#667eea" />
                        <stop offset="100%" stopColor="#764ba2" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        padding: 'var(--spacing-lg)',
    },
    title: {
        fontSize: '1rem',
        fontWeight: 600,
        marginBottom: 'var(--spacing-lg)',
        color: 'var(--color-text-primary)',
    },
    svg: {
        display: 'block',
        overflow: 'visible',
    },
    emptyState: {
        padding: 'var(--spacing-xl)',
        textAlign: 'center',
    },
    emptyText: {
        color: 'var(--color-text-tertiary)',
        fontSize: '0.875rem',
    },
};

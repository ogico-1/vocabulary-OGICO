import React from 'react';

interface StatsCardProps {
    icon: string;
    label: string;
    value: string | number;
    unit?: string;
    trend?: number; // パーセンテージ変化
    color?: string;
}

export default function StatsCard({ icon, label, value, unit, trend, color }: StatsCardProps) {
    const trendColor = trend && trend > 0 ? 'var(--color-success)' : trend && trend < 0 ? 'var(--color-error)' : 'var(--color-text-tertiary)';
    const trendIcon = trend && trend > 0 ? '↑' : trend && trend < 0 ? '↓' : '';

    return (
        <div className="card" style={styles.card}>
            <div style={styles.iconContainer} className={color ? `badge-${color}` : ''}>
                <span style={styles.icon}>{icon}</span>
            </div>

            <div style={styles.content}>
                <p style={styles.label}>{label}</p>
                <div style={styles.valueContainer}>
                    <span style={styles.value}>{value}</span>
                    {unit && <span style={styles.unit}>{unit}</span>}
                </div>

                {trend !== undefined && (
                    <div style={{ ...styles.trend, color: trendColor }}>
                        <span>{trendIcon} {Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    card: {
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-lg)',
        position: 'relative',
        overflow: 'hidden',
    },
    iconContainer: {
        width: '4rem',
        height: '4rem',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--gradient-primary)',
        flexShrink: 0,
    },
    icon: {
        fontSize: '2rem',
    },
    content: {
        flex: 1,
    },
    label: {
        fontSize: '0.875rem',
        color: 'var(--color-text-secondary)',
        marginBottom: 'var(--spacing-xs)',
    },
    valueContainer: {
        display: 'flex',
        alignItems: 'baseline',
        gap: 'var(--spacing-xs)',
    },
    value: {
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--color-text-primary)',
        lineHeight: 1,
    },
    unit: {
        fontSize: '1rem',
        color: 'var(--color-text-tertiary)',
    },
    trend: {
        fontSize: '0.75rem',
        fontWeight: 600,
        marginTop: 'var(--spacing-xs)',
    },
};

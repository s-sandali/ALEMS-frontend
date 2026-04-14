import { motion } from 'motion/react'
import { Zap, BookOpen, TrendingUp } from 'lucide-react'

const cards = [
  {
    label: 'Total XP',
    testId: 'dashboard-stat-total-xp',
    getValue: u => u.xpTotal ?? 0,
    sub: 'Experience points earned',
    iconColor: 'var(--primary)',
    iconBg: 'rgba(var(--primary-rgb),0.1)',
    valueColor: 'var(--primary)',
    Icon: Zap,
  },
  {
    label: 'Quizzes Passed',
    testId: 'dashboard-stat-quizzes-passed',
    getValue: u => u.totalPassed ?? 0,
    sub: 'Quizzes passed',
    iconColor: '#4da6ff',
    iconBg: 'rgba(77,166,255,0.1)',
    valueColor: '#4da6ff',
    Icon: BookOpen,
  },
  {
    label: 'Pass Rate',
    testId: 'dashboard-stat-pass-rate',
    getValue: u => u.passRate != null ? `${u.passRate}%` : '-',
    sub: 'Overall pass rate',
    iconColor: '#ffb830',
    iconBg: 'rgba(255,184,48,0.1)',
    valueColor: '#ffb830',
    Icon: TrendingUp,
  },
]

export default function StatCards({ user }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 12,
      }}
      className="grid-cols-1 sm:grid-cols-3"
    >
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          data-testid={card.testId}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid #252627',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <h1 className="text-4xl mb-4 font-bold tracking-tight text-text-primary sm:text-xl">{card.label}</h1>
            <p
              data-testid={`${card.testId}-value`}
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: card.valueColor,
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1,
                marginBottom: 6,
              }}
            >
              {card.getValue(user)}
            </p>
            <p className="mt-4 text-base leading-7 text-text-secondary">
              {card.getSub ? card.getSub(user) : card.sub}
            </p>
          </div>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: card.iconBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <card.Icon size={16} color={card.iconColor} />
          </div>
        </motion.div>
      ))}
    </div>
  )
}


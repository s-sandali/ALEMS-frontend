import { motion } from 'motion/react'
import { Zap, BookOpen, Flame } from 'lucide-react'

const cards = [
  {
    label: 'Total XP',
    getValue: u => u.xp,
    sub: 'Experience points earned',
    iconColor: '#c8ff3e',
    iconBg: 'rgba(200,255,62,0.1)',
    valueColor: '#c8ff3e',
    Icon: Zap,
  },
  {
    label: 'Modules Completed',
    getValue: u => u.modulesCompleted,
    getSub: u => `${u.modulesCompleted} of ${u.totalModules} modules`,
    iconColor: '#4da6ff',
    iconBg: 'rgba(77,166,255,0.1)',
    valueColor: '#4da6ff',
    Icon: BookOpen,
  },
  {
    label: 'Current Streak',
    getValue: u => u.streakDays,
    sub: 'days — keep it going!',
    iconColor: '#ffb830',
    iconBg: 'rgba(255,184,48,0.1)',
    valueColor: '#ffb830',
    Icon: Flame,
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
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          style={{
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 12,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 6 }}>{card.label}</p>
            <p
              style={{
                fontSize: 26,
                fontWeight: 700,
                color: card.valueColor,
                fontFamily: "'Poppins', sans-serif",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {card.getValue(user)}
            </p>
            <p style={{ fontSize: 11, color: '#4a4b4e' }}>
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

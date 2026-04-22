import { motion } from 'motion/react'
import {
  Star, Zap, ShieldCheck, Flame, Trophy, Gauge, CalendarCheck,
} from 'lucide-react'
import { Tooltip, TooltipProvider } from '@/components/ui/tooltip'

const ICON_MAP = {
  star: Star,
  bolt: Zap,
  shield: ShieldCheck,
  flame: Flame,
  'flame-outline': Flame,
  trophy: Trophy,
  gauge: Gauge,
  calendar: CalendarCheck,
}

function hexToRgba(hex, alpha) {
  if (!hex || hex.startsWith('var(')) {
    return `rgba(var(--primary-rgb),${alpha})`
  }

  const normalized = hex.replace('#', '')
  const r = Number.parseInt(normalized.slice(0, 2), 16)
  const g = Number.parseInt(normalized.slice(2, 4), 16)
  const b = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function BadgesGrid({ badges }) {
  const earnedCount = badges.filter(b => b.status === 'earned').length

  return (
    <TooltipProvider>
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid #252627',
          borderRadius: 12,
          padding: 20,
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
            Badges
          </span>
          <span
            data-testid="dashboard-badges-earned-count"
            style={{
              background: 'rgba(var(--primary-rgb),0.1)',
              color: 'var(--primary)',
              border: '1px solid rgba(var(--primary-rgb),0.25)',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 20,
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            {earnedCount} / {badges.length} earned
          </span>
        </div>

        {/* Grid */}
        <div
          data-testid="dashboard-badge-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 10,
            width: '100%',
            maxWidth: '100%',
          }}
          className="grid-cols-4 md:grid-cols-6"
        >
          {badges.map((badge, i) => {
            const Icon = ICON_MAP[badge.iconType] || Star
            const isEarned = badge.status === 'earned'
            const glowRing = hexToRgba(badge.iconColor, 0.42)
            const glowSoft = hexToRgba(badge.iconColor, 0.22)
            const cardTint = hexToRgba(badge.iconColor, 0.07)
            const tooltipContent = isEarned
              ? `${badge.description}${badge.earnedDate ? ` - Earned ${badge.earnedDate}` : ''}`
              : `${badge.description} - ${badge.unlockHint || 'Locked'}`

            return (
              <Tooltip key={badge.id} content={tooltipContent} side="top">
                <motion.div
                  data-testid="dashboard-badge-card"
                  data-badge-status={isEarned ? 'earned' : 'locked'}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={isEarned ? { y: -2 } : {}}
                  style={{
                    background: isEarned ? cardTint : 'var(--surface-2, var(--surface))',
                    border: `1px solid ${isEarned ? glowRing : 'var(--border)'}`,
                    borderRadius: 10,
                    padding: '14px 10px',
                    textAlign: 'center',
                    minWidth: 0,
                    maxWidth: '100%',
                    opacity: 1,
                    filter: isEarned ? 'none' : 'grayscale(1)',
                    cursor: 'default',
                    boxShadow: isEarned
                      ? `0 0 0 1px ${hexToRgba(badge.iconColor, 0.2)}, 0 0 22px ${glowSoft}`
                      : 'none',
                    transition: 'border-color 0.15s, filter 0.15s, background 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (isEarned)
                      e.currentTarget.style.borderColor = hexToRgba(badge.iconColor, 0.58)
                  }}
                  onMouseLeave={e => {
                    if (isEarned)
                      e.currentTarget.style.borderColor = glowRing
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: isEarned ? badge.iconBg : 'var(--surface-2, var(--border))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}
                  >
                    <Icon size={18} color={isEarned ? badge.iconColor : '#5c5f66'} />
                  </div>
                  {/* Name */}
                  <h1
                    className="break-words text-lg font-bold tracking-tight text-text-primary sm:text-base"
                    style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                  >
                    {badge.name}
                  </h1>
                  {/* Status */}
                  <p
                    style={{
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      color: isEarned ? 'var(--primary)' : '#4f535b',
                      lineHeight: 1.3,
                    }}
                  >
                    {isEarned ? 'Earned' : (badge.unlockHint || 'Locked')}
                  </p>
                </motion.div>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  )
}


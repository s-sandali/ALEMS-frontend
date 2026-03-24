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

export default function BadgesGrid({ badges }) {
  const earnedCount = badges.filter(b => b.status === 'earned').length

  return (
    <TooltipProvider>
      <div
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 12,
          padding: 20,
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
          <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6' }}>
            Badges
          </span>
          <span
            style={{
              background: 'rgba(200,255,62,0.1)',
              color: '#c8ff3e',
              border: '1px solid rgba(200,255,62,0.25)',
              fontSize: 11,
              padding: '2px 8px',
              borderRadius: 20,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {earnedCount} / {badges.length} earned
          </span>
        </div>

        {/* Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 10,
          }}
          className="grid-cols-4 md:grid-cols-6"
        >
          {badges.map((badge, i) => {
            const Icon = ICON_MAP[badge.iconType] || Star
            const isEarned = badge.status === 'earned'
            const tooltipContent = isEarned
              ? `${badge.description}${badge.earnedDate ? ` · Earned ${badge.earnedDate}` : ''}`
              : `${badge.description} — ${badge.unlockHint || 'Locked'}`

            return (
              <Tooltip key={badge.id} content={tooltipContent} side="top">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={isEarned ? { y: -2 } : {}}
                  style={{
                    background: '#131415',
                    border: `1px solid ${isEarned ? 'rgba(200,255,62,0.2)' : '#252627'}`,
                    borderRadius: 10,
                    padding: '14px 10px',
                    textAlign: 'center',
                    opacity: isEarned ? 1 : 0.35,
                    cursor: isEarned ? 'default' : 'not-allowed',
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    if (isEarned)
                      e.currentTarget.style.borderColor = 'rgba(200,255,62,0.4)'
                  }}
                  onMouseLeave={e => {
                    if (isEarned)
                      e.currentTarget.style.borderColor = 'rgba(200,255,62,0.2)'
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: badge.iconBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px',
                    }}
                  >
                    <Icon size={18} color={badge.iconColor} />
                  </div>
                  {/* Name */}
                  <p
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#e4e5e6',
                      marginBottom: 3,
                      lineHeight: 1.3,
                    }}
                  >
                    {badge.name}
                  </p>
                  {/* Status */}
                  <p
                    style={{
                      fontSize: 9,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      fontWeight: 700,
                      color: isEarned ? '#c8ff3e' : '#4a4b4e',
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

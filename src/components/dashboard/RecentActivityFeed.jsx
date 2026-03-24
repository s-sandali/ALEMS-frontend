import { motion } from 'motion/react'

export default function RecentActivityFeed({ activities }) {
  return (
    <div
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6', marginBottom: 12 }}>
        Recent activity
      </p>

      <div>
        {activities.map((entry, i) => {
          const parts = entry.label.split(entry.highlight)
          const isLast = i === activities.length - 1

          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: isLast ? 'none' : '1px solid #252627',
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: entry.dotColor,
                  flexShrink: 0,
                }}
              />

              {/* Label */}
              <p style={{ fontSize: 13, color: '#8a8b8e', flex: 1, lineHeight: 1.4 }}>
                {parts[0]}
                <strong style={{ color: '#e4e5e6', fontWeight: 500 }}>
                  {entry.highlight}
                </strong>
                {parts[1]}
              </p>

              {/* Right: XP + time */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 600,
                    color: '#c8ff3e',
                    lineHeight: 1.4,
                  }}
                >
                  +{entry.xpEarned} XP
                </p>
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#4a4b4e',
                    lineHeight: 1.4,
                  }}
                >
                  {entry.timeAgo}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

import { motion } from 'motion/react'

/** Maps API event type to a dot colour. */
const DOT_COLOR = {
  quiz:  '#3ddc84',
  badge: 'var(--primary)',
}

/**
 * Converts an ISO-8601 datetime string to a human-readable relative label
 * ("just now", "3m ago", "2h ago", "5d ago", "2w ago").
 */
function relativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime()
  const secs   = Math.floor(diffMs / 1000)
  if (secs < 60)                       return 'just now'
  const mins = Math.floor(secs  / 60)
  if (mins < 60)                       return `${mins}m ago`
  const hrs  = Math.floor(mins  / 60)
  if (hrs  < 24)                       return `${hrs}h ago`
  const days = Math.floor(hrs   / 24)
  if (days < 7)                        return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

/**
 * Derives display fields from a raw API ActivityItem.
 * Returns { dotColor, beforeHighlight, highlight, afterHighlight, timeAgo }.
 */
function deriveDisplay(item) {
  const dotColor = DOT_COLOR[item.type] ?? 'var(--text-secondary)'
  const timeAgo  = relativeTime(item.createdAt)
  const title    = item.title

  if (item.type === 'badge') {
    return { dotColor, beforeHighlight: 'Earned ', highlight: title, afterHighlight: ' badge', timeAgo }
  }

  // quiz
  return { dotColor, beforeHighlight: 'Completed ', highlight: title, afterHighlight: '', timeAgo }
}

/**
 * RecentActivityFeed
 *
 * Props:
 *   activities  ActivityItem[]  - raw items from GET /students/{id}/activity
 */
export default function RecentActivityFeed({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div
        style={{
          background: 'var(--db-bg2)',
          border: '1px solid var(--db-border)',
          borderRadius: 12,
          padding: 20,
        }}
      >
        <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-text)', marginBottom: 12 }}>
          Recent activity
        </p>
        <p style={{ fontSize: 13, color: 'var(--db-text3)' }}>No activity yet - complete a quiz to get started.</p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--db-bg2)',
        border: '1px solid var(--db-border)',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-text)', marginBottom: 12 }}>
        Recent activity
      </p>

      <div>
        {activities.map((item, i) => {
          const { dotColor, beforeHighlight, highlight, afterHighlight, timeAgo } = deriveDisplay(item)
          const isLast = i === activities.length - 1

          return (
            <motion.div
              key={`${item.type}-${item.createdAt}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 0',
                borderBottom: isLast ? 'none' : '1px solid var(--db-border)',
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: dotColor,
                  flexShrink: 0,
                }}
              />

              {/* Label */}
              <p style={{ fontSize: 13, color: 'var(--db-text2)', flex: 1, lineHeight: 1.4 }}>
                {beforeHighlight}
                <strong style={{ color: 'var(--db-text)', fontWeight: 500 }}>
                  {highlight}
                </strong>
                {afterHighlight}
              </p>

              {/* Right: XP + time */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                {item.xpEarned > 0 && (
                  <p
                    style={{
                      fontSize: 11,
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      color: 'var(--lime)',
                      lineHeight: 1.4,
                    }}
                  >
                    +{item.xpEarned} XP
                  </p>
                )}
                <p
                  style={{
                    fontSize: 11,
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--db-text3)',
                    lineHeight: 1.4,
                  }}
                >
                  {timeAgo}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}


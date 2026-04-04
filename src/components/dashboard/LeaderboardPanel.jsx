import { useNavigate } from 'react-router-dom'

export default function LeaderboardPanel({ entries }) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        background: 'var(--db-bg2)',
        border: '1px solid var(--db-border)',
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
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--db-text)' }}>
          Leaderboard
        </span>
        <button
          onClick={() => navigate('/leaderboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: 'var(--db-text3)',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--lime)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--db-text3)')}
        >
          Full board →
        </button>
      </div>

      {/* Rows */}
      <div>
        {entries.map((entry, i) => {
          const isLast = i === entries.length - 1
          const isTop3 = entry.rank <= 3

          if (entry.isCurrentUser) {
            return (
              <div
                key={entry.rank}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 6px',
                  margin: '0 -6px',
                  borderRadius: 6,
                  background: 'rgba(var(--lime-rgb), 0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700,
                    width: 18,
                    color: 'var(--lime)',
                    flexShrink: 0,
                  }}
                >
                  {entry.rank}
                </span>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: '50%',
                    background: 'rgba(var(--lime-rgb), 0.1)',
                    border: '1px solid rgba(var(--lime-rgb), 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--lime)',
                    flexShrink: 0,
                  }}
                >
                  {entry.initials}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    flex: 1,
                    color: 'var(--lime)',
                    fontWeight: 600,
                  }}
                >
                  {entry.username}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'Poppins', sans-serif",
                    color: 'var(--db-text2)',
                    flexShrink: 0,
                  }}
                >
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            )
          }

          return (
            <div
              key={entry.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 0',
                borderBottom: isLast ? 'none' : '1px solid var(--db-border)',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 700,
                  width: 18,
                  color: isTop3 ? 'var(--lime)' : 'var(--db-text3)',
                  flexShrink: 0,
                }}
              >
                {entry.rank}
              </span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  background: 'var(--db-bg4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: "'Poppins', sans-serif",
                  color: 'var(--db-text2)',
                  flexShrink: 0,
                }}
              >
                {entry.initials}
              </div>
              <span style={{ fontSize: 13, flex: 1, color: 'var(--db-text)' }}>
                {entry.username}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'Poppins', sans-serif",
                  color: 'var(--db-text2)',
                  flexShrink: 0,
                }}
              >
                {entry.xp.toLocaleString()} XP
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

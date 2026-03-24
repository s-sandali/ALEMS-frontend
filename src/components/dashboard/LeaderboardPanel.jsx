import { useNavigate } from 'react-router-dom'

export default function LeaderboardPanel({ entries }) {
  const navigate = useNavigate()

  return (
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
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6' }}>
          Leaderboard
        </span>
        <button
          onClick={() => navigate('/leaderboard')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 12,
            color: '#4a4b4e',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c8ff3e')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a4b4e')}
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
                  background: 'rgba(200,255,62,0.04)',
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 700,
                    width: 18,
                    color: '#c8ff3e',
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
                    background: 'rgba(200,255,62,0.1)',
                    border: '1px solid rgba(200,255,62,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#c8ff3e',
                    flexShrink: 0,
                  }}
                >
                  {entry.initials}
                </div>
                <span
                  style={{
                    fontSize: 13,
                    flex: 1,
                    color: '#c8ff3e',
                    fontWeight: 600,
                  }}
                >
                  {entry.username}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: "'JetBrains Mono', monospace",
                    color: '#8a8b8e',
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
                borderBottom: isLast ? 'none' : '1px solid #252627',
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 700,
                  width: 18,
                  color: isTop3 ? '#c8ff3e' : '#4a4b4e',
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
                  background: '#1f2020',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#8a8b8e',
                  flexShrink: 0,
                }}
              >
                {entry.initials}
              </div>
              <span style={{ fontSize: 13, flex: 1, color: '#e4e5e6' }}>
                {entry.username}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#8a8b8e',
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

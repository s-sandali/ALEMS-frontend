import { Lock } from 'lucide-react'

export default function NextToUnlockPanel({ items }) {
  return (
    <div
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 12,
        padding: 20,
      }}
    >
      <p style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6', marginBottom: 14 }}>
        Next to unlock
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => {
          const isLast = i === items.length - 1
          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                paddingBottom: isLast ? 0 : 12,
                borderBottom: isLast ? 'none' : '1px solid #252627',
              }}
            >
              {/* Icon box */}
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#1f2020',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Lock size={12} color="#4a4b4e" />
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: '#e4e5e6',
                    marginBottom: 2,
                  }}
                >
                  {item.name}
                </p>
                <p style={{ fontSize: 11, color: '#4a4b4e' }}>{item.hint}</p>
              </div>

              {/* Progress label */}
              <span
                style={{
                  fontSize: 10,
                  fontFamily: "'Poppins', sans-serif",
                  color: item.progressColor,
                  flexShrink: 0,
                }}
              >
                {item.progressLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

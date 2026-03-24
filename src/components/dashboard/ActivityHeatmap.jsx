import { motion } from 'motion/react'

const CELL_COLORS = {
  0: '#1a1b1d',
  1: '#1e2a10',
  2: '#3d5e1a',
  3: '#6ba320',
  4: '#c8ff3e',
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function ActivityHeatmap({ heatmapData }) {
  // heatmapData is 56 values: 8 weeks × 7 days, column-major (each group of 7 = one week)
  const weeks = []
  for (let w = 0; w < 8; w++) {
    weeks.push(heatmapData.slice(w * 7, w * 7 + 7))
  }

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
      <div style={{ marginBottom: 14 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6' }}>
          Activity
        </span>
      </div>

      {/* Grid */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Day labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            paddingTop: 0,
            width: 28,
            flexShrink: 0,
          }}
        >
          {DAY_LABELS.map(d => (
            <div
              key={d}
              style={{
                height: 11,
                fontSize: 9,
                fontFamily: "'JetBrains Mono', monospace",
                color: '#4a4b4e',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Cells: column-major grid (each column = 1 week) */}
        <div
          style={{
            display: 'grid',
            gridAutoFlow: 'column',
            gridTemplateRows: 'repeat(7, 11px)',
            gap: 3,
            flex: 1,
          }}
        >
          {heatmapData.map((val, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.005 }}
              title={`Activity level: ${val}`}
              style={{
                width: 11,
                height: 11,
                borderRadius: 2,
                background: CELL_COLORS[val] || CELL_COLORS[0],
              }}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#4a4b4e',
          }}
        >
          Less
        </span>
        {[0, 1, 2, 3, 4].map(v => (
          <div
            key={v}
            style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: CELL_COLORS[v],
            }}
          />
        ))}
        <span
          style={{
            fontSize: 10,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#4a4b4e',
          }}
        >
          More
        </span>
      </div>
    </div>
  )
}

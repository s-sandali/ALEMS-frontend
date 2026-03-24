import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

const CIRCUMFERENCE = 2 * Math.PI * 19 // ≈ 119.4

function ProgressRing({ percent, accentColor, locked, index }) {
  const targetOffset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg
        width={48}
        height={48}
        style={{ transform: 'rotate(-90deg)' }}
        viewBox="0 0 48 48"
      >
        {/* Track */}
        <circle
          cx={24}
          cy={24}
          r={19}
          stroke="#252627"
          strokeWidth={3}
          fill="none"
        />
        {/* Progress */}
        {!locked && percent > 0 && (
          <motion.circle
            cx={24}
            cy={24}
            r={19}
            stroke={accentColor}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: targetOffset }}
            transition={{ duration: 1, ease: 'easeOut', delay: index * 0.1 }}
          />
        )}
      </svg>
      {/* Percent label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: locked ? '#4a4b4e' : accentColor,
          fontWeight: 600,
        }}
      >
        {locked ? '—' : `${percent}%`}
      </div>
    </div>
  )
}

export default function AlgorithmProgressList({ algorithms }) {
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
          marginBottom: 16,
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: '#e4e5e6' }}>
          Algorithm progress
        </span>
        <button
          onClick={() => navigate('/algorithms')}
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
          View all →
        </button>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {algorithms.map((algo, i) => {
          const isLocked = algo.status === 'locked'
          return (
            <motion.div
              key={algo.id}
              whileHover={!isLocked ? { x: 2 } : {}}
              onClick={() => !isLocked && navigate(algo.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: 12,
                borderRadius: 10,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.4 : 1,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isLocked) e.currentTarget.style.background = '#181919'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <ProgressRing
                percent={algo.progressPercent}
                accentColor={algo.accentColor}
                locked={isLocked}
                index={i}
              />

              {/* Text block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#e4e5e6',
                    marginBottom: 2,
                  }}
                >
                  {algo.name}
                </p>
                <p style={{ fontSize: 11, color: '#4a4b4e', marginBottom: 6 }}>
                  {algo.category} · {algo.difficulty}
                </p>
                {/* Complexity pills */}
                <div style={{ display: 'flex', gap: 5 }}>
                  {[algo.timeComplexity, algo.spaceComplexity].map(c => (
                    <span
                      key={c}
                      style={{
                        fontSize: 10,
                        fontFamily: "'JetBrains Mono', monospace",
                        padding: '2px 7px',
                        borderRadius: 4,
                        background: algo.accentDim,
                        border: `1px solid ${algo.accentColor}33`,
                        color: isLocked ? '#4a4b4e' : algo.accentColor,
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quiz score or lock */}
              {isLocked ? (
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
              ) : (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 600,
                      color: algo.accentColor,
                    }}
                  >
                    {algo.quizzesDone}/{algo.quizzesTotal}
                  </p>
                  <p style={{ fontSize: 10, color: '#4a4b4e' }}>Quizzes done</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

const CIRCUMFERENCE = 2 * Math.PI * 20 // r=20 → ≈125.7

function ProgressRing({ percent, accentColor, locked, index }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
        {/* Track */}
        <circle cx={28} cy={28} r={20} stroke="#252627" strokeWidth={3.5} fill="none" />
        {/* Progress arc */}
        {!locked && percent > 0 && (
          <motion.circle
            cx={28} cy={28} r={20}
            stroke={accentColor}
            strokeWidth={3.5}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.1, ease: 'easeOut', delay: index * 0.08 }}
          />
        )}
      </svg>
      {/* Centre label */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700,
        fontFamily: "'Poppins', sans-serif",
        color: locked ? '#3a3b3e' : accentColor,
      }}>
        {locked ? '0%' : `${percent}%`}
      </div>
    </div>
  )
}

export default function AlgorithmProgressList({ algorithms }) {
  const navigate = useNavigate()

  return (
    <div style={{
      background: '#131415',
      border: '1px solid #252627',
      borderRadius: 14,
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
      }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#e4e5e6' }}>
          Algorithm progress
        </span>
        <button
          onClick={() => navigate('/algorithms')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: '#4a4b4e', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = '#c8ff3e')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4a4b4e')}
        >
          View all →
        </button>
      </div>

      {/* Algorithm cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {algorithms.map((algo, i) => {
          const isLocked = algo.status === 'locked'

          return (
            <motion.div
              key={algo.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={!isLocked ? { y: -1 } : {}}
              onClick={() => !isLocked && navigate(algo.route)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                padding: '16px 20px',
                background: '#0f1011',
                border: `1px solid ${isLocked ? '#1e1f20' : '#252627'}`,
                borderRadius: 12,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.45 : 1,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isLocked) e.currentTarget.style.borderColor = algo.accentColor + '44'
              }}
              onMouseLeave={e => {
                if (!isLocked) e.currentTarget.style.borderColor = '#252627'
              }}
            >
              <ProgressRing
                percent={algo.progressPercent}
                accentColor={algo.accentColor}
                locked={isLocked}
                index={i}
              />

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 15, fontWeight: 700, color: '#e4e5e6',
                  marginBottom: 3, lineHeight: 1.2,
                }}>
                  {algo.name}
                </p>
                <p style={{ fontSize: 11, color: '#4a4b4e', marginBottom: 8 }}>
                  {algo.category} · {algo.difficulty}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[algo.timeComplexity, algo.spaceComplexity].filter(c => c && c !== '—').map(c => (
                    <span
                      key={c}
                      style={{
                        fontSize: 10,
                        fontFamily: "'Poppins', sans-serif",
                        padding: '3px 9px',
                        borderRadius: 5,
                        background: isLocked ? '#1a1b1c' : algo.accentDim,
                        border: `1px solid ${isLocked ? '#252627' : algo.accentColor + '33'}`,
                        color: isLocked ? '#3a3b3e' : algo.accentColor,
                        letterSpacing: '0.2px',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right side: quizzes count or lock */}
              {isLocked ? (
                <div style={{
                  width: 32, height: 32, borderRadius: 8,
                  background: '#1a1b1c',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Lock size={13} color="#3a3b3e" />
                </div>
              ) : (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{
                    fontSize: 20, fontWeight: 700,
                    fontFamily: "'Poppins', sans-serif",
                    color: algo.accentColor, lineHeight: 1.1,
                  }}>
                    {algo.quizzesDone}/{algo.quizzesTotal}
                  </p>
                  <p style={{ fontSize: 10, color: '#4a4b4e', marginTop: 2 }}>
                    Quizzes done
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

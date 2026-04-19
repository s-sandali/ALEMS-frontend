import { motion } from 'motion/react'
import { useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

const CIRCUMFERENCE = 2 * Math.PI * 20 // r=20 -> ~125.7

function ProgressRing({ percent, accentColor, locked, index }) {
  const offset = CIRCUMFERENCE * (1 - percent / 100)

  return (
    <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
      <svg width={56} height={56} style={{ transform: 'rotate(-90deg)' }} viewBox="0 0 56 56">
        {/* Track */}
        <circle cx={28} cy={28} r={20} stroke="var(--border)" strokeWidth={3.5} fill="none" />
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
        color: locked ? 'var(--text-tertiary)' : accentColor,
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
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      padding: '20px',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 16,
      }}>
        
        
        <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-3xl">
          Algorithm progress
        </h2>
        <button
          onClick={() => navigate('/algorithms')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 12, color: 'var(--text-tertiary)', transition: 'color 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-tertiary)')}
        >
          {"View all ->"}
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
                background: 'var(--surface-2, var(--surface))',
                border: `1px solid ${isLocked ? 'var(--border)' : 'var(--border)'}`,
                borderRadius: 12,
                cursor: isLocked ? 'default' : 'pointer',
                opacity: isLocked ? 0.45 : 1,
                transition: 'border-color 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                if (!isLocked) e.currentTarget.style.borderColor = algo.accentColor + '44'
              }}
              onMouseLeave={e => {
                if (!isLocked) e.currentTarget.style.borderColor = 'var(--border)'
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
                <h2 className="text-4xl font-bold tracking-tight text-text-primary sm:text-xl">
                  {algo.name}
                </h2>
                <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                  {algo.category} - {algo.difficulty}
                </p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {[algo.timeComplexity, algo.spaceComplexity].filter(c => c && c !== '-').map(c => (
                    <span
                      key={c}
                      style={{
                        fontSize: 10,
                        fontFamily: "'Poppins', sans-serif",
                        padding: '3px 9px',
                        borderRadius: 5,
                        background: isLocked ? 'var(--surface-2)' : algo.accentDim,
                        border: `1px solid ${isLocked ? 'var(--border)' : algo.accentColor + '33'}`,
                        color: isLocked ? 'var(--text-tertiary)' : algo.accentColor,
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
                  background: 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Lock size={13} color="var(--text-tertiary)" />
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
                  <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
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


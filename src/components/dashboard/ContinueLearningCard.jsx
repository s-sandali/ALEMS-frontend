import { motion } from 'motion/react'
import { BookOpen, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ContinueLearningCard({ data }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      style={{
        position: 'relative',
        background: 'var(--surface)',
        border: '1px solid rgba(var(--primary-rgb),0.25)',
        borderRadius: 12,
        padding: '18px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        overflow: 'hidden',
      }}
    >
      {/* Top gradient accent line */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
        }}
      />

      {/* Icon box */}
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: 'rgba(var(--primary-rgb),0.12)',
          border: '1px solid rgba(var(--primary-rgb),0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <BookOpen size={20} color="var(--primary)" />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'var(--primary)',
            marginBottom: 4,
          }}
        >
          Continue where you left off
        </p>
        <p
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 4,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {data.algorithmName} - {data.stepLabel}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Step {data.stepCurrent} of {data.stepTotal} - {data.progressPercent}% complete - +{data.xpAvailable} XP available
        </p>
      </div>

      {/* Resume button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate(data.route)}
        style={{
          background: 'var(--primary)',
          color: '#0d0e0f',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexShrink: 0,
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Resume
        <ArrowRight size={14} />
      </motion.button>
    </motion.div>
  )
}


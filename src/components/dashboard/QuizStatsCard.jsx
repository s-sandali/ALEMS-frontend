import { useAuth } from '@clerk/clerk-react'
import { motion } from 'motion/react'
import { BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react'
import { QuizService } from '@/lib/api'
import { useEffect, useState } from 'react'

export default function QuizStatsCard({ quizId, quizTitle }) {
  const { getToken } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadStats() {
      try {
        setLoading(true)
        const response = await QuizService.getStats(quizId, getToken)
        if (isMounted) {
          setStats(response.data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load stats')
          console.error('Error loading quiz stats:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadStats()
    return () => {
      isMounted = false
    }
  }, [quizId, getToken])

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 12,
          padding: 16,
          minHeight: 160,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8a8b8e',
          fontSize: 12,
        }}
      >
        Loading stats...
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 12,
          padding: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          color: '#fca5a5',
          fontSize: 12,
        }}
      >
        <AlertCircle size={16} style={{ flexShrink: 0 }} />
        {error}
      </motion.div>
    )
  }

  if (!stats) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 12,
          padding: 16,
          color: '#8a8b8e',
          fontSize: 12,
        }}
      >
        No stats available
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 12,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
      }}>
        <BarChart3 size={16} style={{ color: '#c8ff3e' }} />
        <span style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#e4e5e6',
        }}>
          Quiz Statistics
        </span>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 12,
      }}>
        {/* Attempt Count */}
        <div style={{
          background: 'rgba(200,255,62,0.05)',
          border: '1px solid rgba(200,255,62,0.1)',
          borderRadius: 8,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{
            fontSize: 11,
            color: '#8a8b8e',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Attempts
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#c8ff3e',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {stats.attemptCount}
          </div>
          <div style={{
            fontSize: 10,
            color: '#8a8b8e',
          }}>
            <Users size={12} style={{ display: 'inline', marginRight: 4 }} />
            students
          </div>
        </div>

        {/* Average Score */}
        <div style={{
          background: 'rgba(59,130,246,0.05)',
          border: '1px solid rgba(59,130,246,0.1)',
          borderRadius: 8,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{
            fontSize: 11,
            color: '#8a8b8e',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Avg Score
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#3b82f6',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {stats.averageScore.toFixed(1)}%
          </div>
          <div style={{
            fontSize: 10,
            color: '#8a8b8e',
          }}>
            performance
          </div>
        </div>

        {/* Pass Rate */}
        <div style={{
          background: 'rgba(34,197,94,0.05)',
          border: '1px solid rgba(34,197,94,0.1)',
          borderRadius: 8,
          padding: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}>
          <div style={{
            fontSize: 11,
            color: '#8a8b8e',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>
            Pass Rate
          </div>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#22c55e',
            fontFamily: "'Poppins', sans-serif",
          }}>
            {stats.passRate.toFixed(1)}%
          </div>
          <div style={{
            fontSize: 10,
            color: '#8a8b8e',
          }}>
            <TrendingUp size={12} style={{ display: 'inline', marginRight: 4 }} />
            success
          </div>
        </div>
      </div>
    </motion.div>
  )
}

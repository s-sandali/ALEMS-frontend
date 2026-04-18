import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { motion } from 'motion/react'
import { ArrowUpDown, LoaderCircle } from 'lucide-react'
import { AdminService } from '@/lib/api'
import { useRole } from '@/context/RoleContext'

export default function AdminLeaderboardPage() {
  const { getToken } = useAuth()
  const role = useRole()
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortBy, setSortBy] = useState('xp') // 'xp', 'attempts', 'avgScore'

  useEffect(() => {
    if (role !== 'Admin') return

    let isMounted = true

    async function loadLeaderboard() {
      try {
        setLoading(true)
        setError('')
        const response = await AdminService.getLeaderboard(getToken)
        
        // Handle both response formats
        const data = response.data || response
        const entries = Array.isArray(data) ? data : []
        
        if (isMounted) {
          setLeaderboard(entries)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load leaderboard')
          console.error('Error loading leaderboard:', err)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadLeaderboard()
    return () => {
      isMounted = false
    }
  }, [getToken, role])

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard]
    
    switch (sortBy) {
      case 'attempts':
        return sorted.sort((a, b) => b.attemptCount - a.attemptCount)
      case 'avgScore':
        return sorted.sort((a, b) => b.averageScore - a.averageScore)
      case 'xp':
      default:
        return sorted.sort((a, b) => b.xpTotal - a.xpTotal)
    }
  }

  const sortedLeaderboard = getSortedLeaderboard()

  return (
    <div style={{ minHeight: '100vh', background: '#0C0C0C' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 40 }}
        >
          <h1 style={{
            fontSize: 32,
            fontWeight: 700,
            color: '#e4e5e6',
            marginBottom: 8,
            fontFamily: "'Poppins', sans-serif",
          }}>
            Leaderboard
          </h1>
          <p style={{
            fontSize: 14,
            color: '#8a8b8e',
          }}>
            View all users ranked by their XP and performance metrics
          </p>
        </motion.div>

        {/* Sort Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 24,
            flexWrap: 'wrap',
          }}
        >
          {[
            { value: 'xp', label: 'Sort by XP' },
            { value: 'attempts', label: 'Sort by Attempts' },
            { value: 'avgScore', label: 'Sort by Avg Score' },
          ].map(btn => (
            <button
              key={btn.value}
              onClick={() => setSortBy(btn.value)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: sortBy === btn.value 
                  ? '1px solid #c8ff3e' 
                  : '1px solid #252627',
                background: sortBy === btn.value
                  ? 'rgba(200,255,62,0.1)'
                  : 'transparent',
                color: sortBy === btn.value ? '#c8ff3e' : '#8a8b8e',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
              onMouseEnter={e => {
                if (sortBy !== btn.value) {
                  e.currentTarget.style.borderColor = 'rgba(200,255,62,0.3)'
                  e.currentTarget.style.color = '#c8ff3e'
                }
              }}
              onMouseLeave={e => {
                if (sortBy !== btn.value) {
                  e.currentTarget.style.borderColor = '#252627'
                  e.currentTarget.style.color = '#8a8b8e'
                }
              }}
            >
              <ArrowUpDown size={14} />
              {btn.label}
            </button>
          ))}
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              padding: 16,
              color: '#fca5a5',
              fontSize: 14,
              marginBottom: 24,
            }}
          >
            {error}
          </motion.div>
        )}

        {/* Loading State */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 60,
              color: '#8a8b8e',
            }}
          >
            <LoaderCircle size={24} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ marginLeft: 12 }}>Loading leaderboard...</span>
          </motion.div>
        ) : sortedLeaderboard.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              padding: 40,
              textAlign: 'center',
              color: '#8a8b8e',
            }}
          >
            <p style={{ fontSize: 14 }}>No users found on the leaderboard</p>
          </motion.div>
        ) : (
          /* Leaderboard Table */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '60px 1fr 120px 140px 140px',
              gap: 16,
              padding: 16,
              background: '#0f1010',
              borderBottom: '1px solid #252627',
              fontWeight: 600,
              fontSize: 12,
              color: '#8a8b8e',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              <div>Rank</div>
              <div>User</div>
              <div style={{ textAlign: 'right' }}>XP Total</div>
              <div style={{ textAlign: 'right' }}>Attempts</div>
              <div style={{ textAlign: 'right' }}>Avg Score</div>
            </div>

            {/* Table Rows */}
            <div>
              {sortedLeaderboard.map((entry, index) => {
                const isTop3 = entry.rank <= 3
                const isOdd = index % 2
                
                return (
                  <motion.div
                    key={entry.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 1fr 120px 140px 140px',
                      gap: 16,
                      padding: 16,
                      background: isOdd ? '#0a0a0b' : 'transparent',
                      borderBottom: '1px solid #252627',
                      alignItems: 'center',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(200,255,62,0.05)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isOdd ? '#0a0a0b' : 'transparent'
                    }}
                  >
                    {/* Rank */}
                    <div style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: isTop3 ? '#c8ff3e' : '#8a8b8e',
                      fontFamily: "'Poppins', sans-serif",
                    }}>
                      {entry.rank}
                      {isTop3 && <span style={{ fontSize: 10, marginLeft: 4 }}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </span>}
                    </div>

                    {/* User Info */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: isTop3 ? 'rgba(200,255,62,0.1)' : '#1a1b1c',
                        border: isTop3 ? '1px solid rgba(200,255,62,0.3)' : '1px solid #252627',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        color: isTop3 ? '#c8ff3e' : '#8a8b8e',
                        flexShrink: 0,
                      }}>
                        {entry.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: '#e4e5e6',
                        }}>
                          {entry.username}
                        </div>
                        <div style={{
                          fontSize: 11,
                          color: '#8a8b8e',
                        }}>
                          {entry.email}
                        </div>
                      </div>
                    </div>

                    {/* XP Total */}
                    <div style={{
                      textAlign: 'right',
                      fontSize: 14,
                      fontWeight: 600,
                      color: '#e4e5e6',
                    }}>
                      {entry.xpTotal.toLocaleString()}
                    </div>

                    {/* Attempt Count */}
                    <div style={{
                      textAlign: 'right',
                      fontSize: 14,
                      color: '#8a8b8e',
                    }}>
                      {entry.attemptCount} {entry.attemptCount === 1 ? 'attempt' : 'attempts'}
                    </div>

                    {/* Average Score */}
                    <div style={{
                      textAlign: 'right',
                      fontSize: 14,
                      color: '#8a8b8e',
                    }}>
                      {entry.attemptCount > 0 
                        ? `${entry.averageScore.toFixed(1)}%`
                        : '—'
                      }
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Stats Summary */}
        {!loading && sortedLeaderboard.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginTop: 24,
            }}
          >
            <div style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{
                fontSize: 12,
                color: '#8a8b8e',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Total Users
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#c8ff3e',
              }}>
                {sortedLeaderboard.length}
              </div>
            </div>

            <div style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{
                fontSize: 12,
                color: '#8a8b8e',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Avg XP per User
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#c8ff3e',
              }}>
                {Math.round(
                  sortedLeaderboard.reduce((sum, entry) => sum + entry.xpTotal, 0) / sortedLeaderboard.length
                ).toLocaleString()}
              </div>
            </div>

            <div style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              padding: 16,
            }}>
              <div style={{
                fontSize: 12,
                color: '#8a8b8e',
                marginBottom: 8,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}>
                Total Attempts
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: '#c8ff3e',
              }}>
                {sortedLeaderboard.reduce((sum, entry) => sum + entry.attemptCount, 0).toLocaleString()}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

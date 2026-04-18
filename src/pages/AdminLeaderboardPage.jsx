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
  const [sortBy, setSortBy] = useState('xp')

  useEffect(() => {
    if (role !== 'Admin') return

    let isMounted = true

    async function loadLeaderboard() {
      try {
        setLoading(true)
        setError('')
        const response = await AdminService.getLeaderboard(getToken)
        const data = response.data || response
        const entries = Array.isArray(data) ? data : []
        if (isMounted) setLeaderboard(entries)
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load leaderboard')
          console.error('Error loading leaderboard:', err)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadLeaderboard()
    return () => { isMounted = false }
  }, [getToken, role])

  const getSortedLeaderboard = () => {
    const sorted = [...leaderboard]
    switch (sortBy) {
      case 'attempts': return sorted.sort((a, b) => b.attemptCount - a.attemptCount)
      case 'avgScore': return sorted.sort((a, b) => b.averageScore - a.averageScore)
      default: return sorted.sort((a, b) => b.xpTotal - a.xpTotal)
    }
  }

  const sortedLeaderboard = getSortedLeaderboard()

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 40 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          Leaderboard
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          View all users ranked by their XP and performance metrics
        </p>
      </motion.div>

      {/* Sort Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}
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
                ? '1px solid var(--primary)'
                : '1px solid var(--db-border)',
              background: sortBy === btn.value
                ? 'rgba(var(--primary-rgb), 0.1)'
                : 'transparent',
              color: sortBy === btn.value ? 'var(--primary)' : 'var(--text-secondary)',
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
                e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.3)'
                e.currentTarget.style.color = 'var(--primary)'
              }
            }}
            onMouseLeave={e => {
              if (sortBy !== btn.value) {
                e.currentTarget.style.borderColor = 'var(--db-border)'
                e.currentTarget.style.color = 'var(--text-secondary)'
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
            background: 'var(--red-dim)',
            border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)',
            borderRadius: 12,
            padding: 16,
            color: 'var(--red)',
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
            color: 'var(--text-secondary)',
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
            background: 'var(--surface)',
            border: '1px solid var(--db-border)',
            borderRadius: 12,
            padding: 40,
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <p style={{ fontSize: 14 }}>No users found on the leaderboard</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--db-border)',
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
            background: 'var(--surface-2)',
            borderBottom: '1px solid var(--db-border)',
            fontWeight: 600,
            fontSize: 12,
            color: 'var(--text-secondary)',
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
                    background: isOdd ? 'var(--surface-2)' : 'transparent',
                    borderBottom: '1px solid var(--db-border)',
                    alignItems: 'center',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(var(--primary-rgb), 0.05)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = isOdd ? 'var(--surface-2)' : 'transparent'
                  }}
                >
                  {/* Rank */}
                  <div style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: isTop3 ? 'var(--primary)' : 'var(--text-secondary)',
                  }}>
                    {entry.rank}
                    {isTop3 && (
                      <span style={{ fontSize: 10, marginLeft: 4 }}>
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                  </div>

                  {/* User Info */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: isTop3 ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface-2)',
                      border: isTop3
                        ? '1px solid rgba(var(--primary-rgb), 0.3)'
                        : '1px solid var(--db-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: isTop3 ? 'var(--primary)' : 'var(--text-secondary)',
                      flexShrink: 0,
                    }}>
                      {entry.username.substring(0, 2).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {entry.username}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {entry.email}
                      </div>
                    </div>
                  </div>

                  {/* XP Total */}
                  <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 600, color: 'var(--amber)' }}>
                    {entry.xpTotal.toLocaleString()}
                  </div>

                  {/* Attempt Count */}
                  <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--text-secondary)' }}>
                    {entry.attemptCount} {entry.attemptCount === 1 ? 'attempt' : 'attempts'}
                  </div>

                  {/* Average Score */}
                  <div style={{ textAlign: 'right', fontSize: 14, color: 'var(--text-secondary)' }}>
                    {entry.attemptCount > 0 ? `${entry.averageScore.toFixed(1)}%` : '—'}
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
          {[
            { label: 'Total Users', value: sortedLeaderboard.length.toLocaleString() },
            {
              label: 'Avg XP per User',
              value: Math.round(
                sortedLeaderboard.reduce((sum, e) => sum + e.xpTotal, 0) / sortedLeaderboard.length
              ).toLocaleString(),
            },
            {
              label: 'Total Attempts',
              value: sortedLeaderboard.reduce((sum, e) => sum + e.attemptCount, 0).toLocaleString(),
            },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--db-border)',
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>
                {card.value}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

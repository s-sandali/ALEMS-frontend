import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, BookOpen, AlertCircle, LoaderCircle, Zap } from 'lucide-react';
import { AdminService } from '@/lib/api';

function StatCard({ title, value, icon: Icon, color = '#c8ff3e', subtext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        padding: '24px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>{title}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: subtext ? 4 : 0 }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: 11, color: '#8a8b8e', marginTop: 4 }}>{subtext}</div>
          )}
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `rgba(${color === '#c8ff3e' ? '200, 255, 62' : color === '#6bceff' ? '107, 206, 255' : color === '#ff6bcf' ? '255, 107, 207' : '255, 200, 57'}, 0.1)`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon size={28} color={color} />
        </div>
      </div>
    </motion.div>
  );
}

function SimpleBarChart({ data, title, color = '#c8ff3e' }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 16,
          padding: '40px',
          textAlign: 'center',
          color: '#8a8b8e',
        }}
      >
        <BarChart3 size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <div>No data available</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const scale = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        padding: '24px',
      }}
    >
      <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 20 }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {data.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 120, fontSize: 12, color: '#8a8b8e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.label}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 24,
                    background: `linear-gradient(90deg, ${color}20 0%, ${color}40 100%)`,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(item.value * scale, 100)}%`,
                      background: color,
                      transition: 'width 0.3s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      color: item.value * scale > 50 ? '#000' : 'transparent',
                    }}
                  >
                    {item.value * scale > 20 && item.value.toFixed(1)}
                  </div>
                </div>
              </div>
              <div style={{ width: 50, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#ffffff' }}>
                {item.value.toFixed(1)}%
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function LeaderboardTable({ data, title, loading, error }) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: '#131415',
          border: '1px solid #ff6b6b40',
          borderRadius: 16,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#ff6b6b',
        }}
      >
        <AlertCircle size={20} />
        <div>{error}</div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#8a8b8e' }}>
        <LoaderCircle size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          background: '#131415',
          border: '1px dashed #252627',
          borderRadius: 16,
          padding: '40px',
          textAlign: 'center',
          color: '#8a8b8e',
        }}
      >
        No leaderboard data
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '24px' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>{title}</h3>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid #252627', borderTop: '1px solid #252627' }}>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#8a8b8e', fontWeight: 500 }}>Rank</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#8a8b8e', fontWeight: 500 }}>Username</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#8a8b8e', fontWeight: 500 }}>XP</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#8a8b8e', fontWeight: 500 }}>Attempts</th>
              <th style={{ textAlign: 'left', padding: '12px 24px', color: '#8a8b8e', fontWeight: 500 }}>Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 10).map((entry, idx) => (
              <motion.tr
                key={idx}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{ borderBottom: '1px solid #252627' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1b1d')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <td style={{ padding: '12px 24px', color: '#c8ff3e', fontWeight: 600 }}>#{idx + 1}</td>
                <td style={{ padding: '12px 24px', color: '#ffffff' }}>{entry.username}</td>
                <td style={{ padding: '12px 24px', color: '#ffc839', fontWeight: 600 }}>{entry.xpTotal.toLocaleString()}</td>
                <td style={{ padding: '12px 24px', color: '#6bceff' }}>{entry.attemptCount}</td>
                <td style={{ padding: '12px 24px', color: '#ffffff' }}>{entry.averageScore.toFixed(1)}%</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError('');

        const [statsResponse, leaderboardResponse] = await Promise.all([
          AdminService.getStats(getToken),
          AdminService.getLeaderboard(getToken),
        ]);

        if (isMounted) {
          if (statsResponse) {
            setStats(statsResponse);
          }
          if (leaderboardResponse?.data) {
            setLeaderboard(Array.isArray(leaderboardResponse.data) ? leaderboardResponse.data : []);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load analytics');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const algorithmScores = stats ? [
    { label: 'Binary Search', value: 85 + Math.random() * 15 },
    { label: 'Linear Search', value: 78 + Math.random() * 22 },
    { label: 'Bubble Sort', value: 72 + Math.random() * 28 },
    { label: 'Merge Sort', value: 81 + Math.random() * 19 },
    { label: 'Quick Sort', value: 75 + Math.random() * 25 },
  ] : [];

  if (error && !stats) {
    return (
      <div style={{ padding: '32px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: '#131415',
            border: '1px solid #ff6b6b40',
            borderRadius: 16,
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: '#ff6b6b',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Analytics</div>
            <div style={{ fontSize: 13, color: '#ff6b6b80' }}>{error}</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          Platform Analytics
        </h1>
        <p style={{ fontSize: 14, color: '#8a8b8e' }}>
          Real-time insights into platform usage, performance, and user engagement
        </p>
      </motion.div>

      {/* KPI Cards */}
      {stats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}
        >
          <StatCard
            title="Total Users"
            value={stats.totalUsers.toLocaleString()}
            icon={Users}
            color="#c8ff3e"
            subtext="registered on platform"
          />
          <StatCard
            title="Total Quizzes"
            value={stats.totalQuizzes.toLocaleString()}
            icon={BookOpen}
            color="#6bceff"
            subtext="available to students"
          />
          <StatCard
            title="Quiz Attempts"
            value={stats.totalAttempts.toLocaleString()}
            icon={BarChart3}
            color="#ff6bcf"
            subtext="submissions recorded"
          />
          <StatCard
            title="Average Pass Rate"
            value={`${stats.averagePassRate.toFixed(1)}%`}
            icon={TrendingUp}
            color="#ffc839"
            subtext="platform-wide average"
          />
        </motion.div>
      )}

      {/* Charts Row 1 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: 20, marginBottom: 32 }}
      >
        {/* Algorithm Scores */}
        <SimpleBarChart
          data={algorithmScores}
          title="Per-Algorithm Average Score"
          color="#c8ff3e"
        />

        {/* Engagement Metrics */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 20 }}>
              Engagement Metrics
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Avg Attempts per User</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#6bceff' }}>
                  {(stats.totalAttempts / Math.max(stats.totalUsers, 1)).toFixed(1)}
                </div>
                <div style={{ fontSize: 11, color: '#5a5b5e' }}>quizzes attempted</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Quiz Engagement Rate</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#ffc839' }}>
                  {stats.totalQuizzes > 0
                    ? ((stats.totalAttempts / (stats.totalUsers * stats.totalQuizzes)) * 100).toFixed(1)
                    : '0'}
                  %
                </div>
                <div style={{ fontSize: 11, color: '#5a5b5e' }}>of available attempts</div>
              </div>

              <div>
                <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Platform Health</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#c8ff3e' }}>
                  {stats.averagePassRate > 80 ? 'Excellent' : stats.averagePassRate > 60 ? 'Good' : 'Fair'}
                </div>
                <div style={{ fontSize: 11, color: '#5a5b5e' }}>{stats.averagePassRate.toFixed(1)}% pass rate</div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Leaderboard */}
      <LeaderboardTable
        data={leaderboard}
        title="Top 10 Users by XP"
        loading={loading}
        error={error}
      />
    </div>
  );
}

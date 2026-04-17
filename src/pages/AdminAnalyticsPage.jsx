import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { BarChart3, TrendingUp, Users, BookOpen, AlertCircle, LoaderCircle } from 'lucide-react';
import { AdminService, QuizService, StudentService } from '@/lib/api';

function AnalyticsCard({ title, value, icon: Icon, color = '#c8ff3e', subtext }) {
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
            background: `rgba(${color === '#c8ff3e' ? '200, 255, 62' : color === '#6bceff' ? '107, 206, 255' : '255, 107, 207'}, 0.1)`,
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

function EngagementMetrics({ stats }) {
  if (!stats) return null;

  const attemptAverage = stats.totalAttempts > 0 ? (stats.totalAttempts / stats.totalUsers).toFixed(1) : 0;
  const quizCoverage = stats.totalQuizzes > 0 ? ((stats.totalAttempts / (stats.totalUsers * stats.totalQuizzes)) * 100).toFixed(1) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        padding: '24px',
      }}
    >
      <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 20 }}>
        Engagement Metrics
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Avg Attempts per User</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6bceff', marginBottom: 4 }}>
            {attemptAverage}
          </div>
          <div style={{ fontSize: 11, color: '#5a5b5e' }}>quizzes attempted</div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Quiz Engagement Rate</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffc839', marginBottom: 4 }}>
            {quizCoverage}%
          </div>
          <div style={{ fontSize: 11, color: '#5a5b5e' }}>of available attempts</div>
        </div>

        <div>
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Platform Pass Rate</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#c8ff3e', marginBottom: 4 }}>
            {stats.averagePassRate.toFixed(1)}%
          </div>
          <div style={{ fontSize: 11, color: '#5a5b5e' }}>quiz success rate</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminAnalyticsPage() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        setLoading(true);
        setError('');

        const response = await AdminService.getStats(getToken);
        if (isMounted && response?.data) {
          setStats(response.data);
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

  if (error) {
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
          Real-time insights into platform usage and performance
        </p>
      </motion.div>

      {/* KPI Cards */}
      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '40px',
            color: '#8a8b8e',
          }}
        >
          <LoaderCircle size={20} style={{ animation: 'spin 1s linear infinite' }} />
          Loading analytics...
        </motion.div>
      ) : stats ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
            <AnalyticsCard
              title="Total Users"
              value={stats.totalUsers.toLocaleString()}
              icon={Users}
              color="#c8ff3e"
              subtext="registered on platform"
            />
            <AnalyticsCard
              title="Total Quizzes"
              value={stats.totalQuizzes.toLocaleString()}
              icon={BookOpen}
              color="#6bceff"
              subtext="available to students"
            />
            <AnalyticsCard
              title="Quiz Attempts"
              value={stats.totalAttempts.toLocaleString()}
              icon={BarChart3}
              color="#ff6bcf"
              subtext="submissions recorded"
            />
            <AnalyticsCard
              title="Average Pass Rate"
              value={`${stats.averagePassRate.toFixed(1)}%`}
              icon={TrendingUp}
              color="#ffc839"
              subtext="platform-wide average"
            />
          </div>

          {/* Engagement Metrics */}
          <EngagementMetrics stats={stats} />

          {/* Insights Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              marginTop: 32,
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 16,
              padding: '24px',
            }}
          >
            <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>
              Key Insights
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
              <div
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  background: 'rgba(200, 255, 62, 0.08)',
                  borderLeft: '3px solid #c8ff3e',
                }}
              >
                <div style={{ fontSize: 11, color: '#8a8b8e', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                  User Growth
                </div>
                <div style={{ fontSize: 14, color: '#ffffff' }}>
                  {stats.totalUsers} total users with {(stats.totalAttempts / stats.totalUsers || 0).toFixed(1)} average attempts
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  background: 'rgba(107, 206, 255, 0.08)',
                  borderLeft: '3px solid #6bceff',
                }}
              >
                <div style={{ fontSize: 11, color: '#8a8b8e', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                  Content Library
                </div>
                <div style={{ fontSize: 14, color: '#ffffff' }}>
                  {stats.totalQuizzes} quizzes available with {((stats.totalAttempts / stats.totalQuizzes) || 0).toFixed(1)} average attempts per quiz
                </div>
              </div>

              <div
                style={{
                  padding: '16px',
                  borderRadius: 10,
                  background: 'rgba(255, 107, 207, 0.08)',
                  borderLeft: '3px solid #ff6bcf',
                }}
              >
                <div style={{ fontSize: 11, color: '#8a8b8e', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase' }}>
                  Performance
                </div>
                <div style={{ fontSize: 14, color: '#ffffff' }}>
                  {stats.averagePassRate.toFixed(1)}% average pass rate indicates {stats.averagePassRate > 70 ? 'strong' : stats.averagePassRate > 50 ? 'moderate' : 'improving'} platform performance
                </div>
              </div>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { Users, BookOpen, BarChart3, TrendingUp, LoaderCircle, AlertCircle } from 'lucide-react';
import { AdminService } from '@/lib/api';

// KPI Card Component
function KPICard({ icon: Icon, label, value, loading, color = '#c8ff3e' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        padding: '24px',
        flex: 1,
        minWidth: 240,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8, fontWeight: 500 }}>
            {label}
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
            {loading ? (
              <LoaderCircle size={28} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              value
            )}
          </div>
        </div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 12,
            background: `rgba(200, 255, 62, 0.1)`,
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

// Stats Grid Component
function StatsGrid({ stats, loading, error }) {
  if (error) {
    return (
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
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Stats</div>
          <div style={{ fontSize: 13, color: '#ff6b6b80' }}>{error}</div>
        </div>
      </motion.div>
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
      <KPICard
        icon={Users}
        label="Total Users"
        value={loading ? '-' : stats?.totalUsers?.toLocaleString() || '0'}
        loading={loading}
        color="#c8ff3e"
      />
      <KPICard
        icon={BookOpen}
        label="Total Quizzes"
        value={loading ? '-' : stats?.totalQuizzes?.toLocaleString() || '0'}
        loading={loading}
        color="#6bceff"
      />
      <KPICard
        icon={BarChart3}
        label="Total Attempts"
        value={loading ? '-' : stats?.totalAttempts?.toLocaleString() || '0'}
        loading={loading}
        color="#ff6bcf"
      />
      <KPICard
        icon={TrendingUp}
        label="Average Pass Rate"
        value={
          loading
            ? '-'
            : stats?.averagePassRate !== undefined
              ? `${stats.averagePassRate.toFixed(1)}%`
              : '0%'
        }
        loading={loading}
        color="#ffc839"
      />
    </div>
  );
}

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      try {
        setLoading(true);
        setError('');

        const response = await AdminService.getStats(getToken);
        if (isMounted && response) {
          setStats(response);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load statistics');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadStats();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          Admin Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#8a8b8e' }}>
          Platform-wide statistics and key performance indicators
        </p>
      </motion.div>

      {/* KPI Cards */}
      <StatsGrid stats={stats} loading={loading} error={error} />

      {/* Additional Info */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            marginTop: 32,
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 16,
            padding: '24px',
          }}
        >
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>
            Quick Actions
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { label: 'View All Users', href: '/admin/users' },
              { label: 'Manage Quizzes', href: '/admin/quizzes' },
              { label: 'View Analytics', href: '/admin/analytics' },
              { label: 'Code Questions', href: '/admin/coding-questions' },
            ].map((action) => (
              <motion.a
                key={action.href}
                href={action.href}
                whileHover={{ y: -2 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: 'rgba(200, 255, 62, 0.08)',
                  border: '1px solid rgba(200, 255, 62, 0.2)',
                  color: '#c8ff3e',
                  textDecoration: 'none',
                  fontSize: 13,
                  fontWeight: 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {action.label}
              </motion.a>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

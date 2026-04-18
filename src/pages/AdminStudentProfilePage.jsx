import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Award, BookOpen, Zap, AlertCircle, LoaderCircle, Gauge, Shield, Star, Trophy, Flame, Target, Rocket, Zap as ZapIcon, Medal, Crown, Brain, Code2, CheckCircle, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { StudentService, UserService } from '@/lib/api';

function StatCard({ icon: Icon, label, value, color = 'var(--primary)' }) {
  return (
    <div
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--db-border)',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 10,
          background: `color-mix(in srgb, ${color} 10%, transparent)`,
          border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      </div>
    </div>
  );
}

const BADGE_ICON_MAP = {
  gauge: Gauge, shield: Shield, star: Star, trophy: Trophy, flame: Flame,
  target: Target, rocket: Rocket, zap: ZapIcon, medal: Medal, crown: Crown,
  brain: Brain, code2: Code2, check: CheckCircle, chart: BarChart3,
  trending: TrendingUp, layers: Layers,
};

function BadgeIcon({ iconType, size = 28, color = 'var(--primary)' }) {
  const Icon = BADGE_ICON_MAP[iconType?.toLowerCase()];
  if (Icon) return <Icon size={size} color={color} />;
  if (iconType && /\p{Emoji}/u.test(iconType)) return <span style={{ fontSize: size }}>{iconType}</span>;
  return <Trophy size={size} color={color} />;
}

function BadgesList({ badges, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 80, height: 80, background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 2s' }} />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No badges earned yet</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
      {badges.map((badge) => (
        <motion.div
          key={badge.badgeId}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'var(--surface-2)',
            border: '1px solid var(--db-border)',
            borderRadius: 12,
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          title={badge.name}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <BadgeIcon iconType={badge.iconType} size={28} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 500 }}>{badge.name}</div>
        </motion.div>
      ))}
    </div>
  );
}

function AttemptTable({ attempts, loading, error }) {
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid color-mix(in srgb, var(--red) 25%, transparent)',
          borderRadius: 12,
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: 'var(--red)',
        }}
      >
        <AlertCircle size={20} />
        <div>{error}</div>
      </motion.div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
        <LoaderCircle size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div
        style={{
          background: 'var(--surface-2)',
          border: '1px dashed var(--db-border2)',
          borderRadius: 12,
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        No quiz attempts yet
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--db-border)', background: 'var(--surface-2)' }}>
            {['Quiz', 'Algorithm', 'Score', 'Status', 'XP', 'Date'].map(h => (
              <th key={h} style={{ textAlign: 'left', padding: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => (
            <motion.tr
              key={attempt.attemptId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ borderBottom: '1px solid var(--db-border)', transition: 'background 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px', color: 'var(--text-primary)' }}>{attempt.quizTitle}</td>
              <td style={{ padding: '12px', color: 'var(--primary)' }}>{attempt.algorithmName}</td>
              <td style={{ padding: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>{attempt.score.toFixed(1)}%</td>
              <td style={{ padding: '12px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: attempt.passed ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--red-dim)',
                    color: attempt.passed ? 'var(--primary)' : 'var(--red)',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {attempt.passed ? 'Passed' : 'Failed'}
                </div>
              </td>
              <td style={{ padding: '12px', color: 'var(--amber)', fontWeight: 600 }}>+{attempt.xpEarned}</td>
              <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                {new Date(attempt.completedAt).toLocaleDateString()}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          padding: '8px 12px', borderRadius: 6,
          border: '1px solid var(--db-border)',
          background: currentPage === 1 ? 'var(--surface-2)' : 'var(--surface)',
          color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: 12, fontWeight: 600,
        }}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '8px 12px', borderRadius: 6,
            border: page === currentPage ? '1px solid var(--primary)' : '1px solid var(--db-border)',
            background: page === currentPage ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)',
            color: page === currentPage ? 'var(--primary)' : 'var(--text-primary)',
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
          }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px', borderRadius: 6,
          border: '1px solid var(--db-border)',
          background: currentPage === totalPages ? 'var(--surface-2)' : 'var(--surface)',
          color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: 12, fontWeight: 600,
        }}
      >
        Next
      </button>
    </div>
  );
}

export default function AdminStudentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);
        setError('');
        const userId = parseInt(id);

        const userResponse = await UserService.getUserById(userId, getToken);
        if (isMounted && userResponse?.data) setUser(userResponse.data);

        const dashResponse = await StudentService.getDashboard(userId, getToken);
        if (isMounted && dashResponse?.data?.earnedBadges) setBadges(dashResponse.data.earnedBadges);

        const attemptsResponse = await StudentService.getAttemptHistory(userId, page, pageSize, getToken);
        if (isMounted && attemptsResponse?.data) {
          setAttempts(attemptsResponse.data.attempts || []);
          setTotalPages(Math.ceil((attemptsResponse.data.totalCount || 0) / pageSize));
        }
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load student profile');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => { isMounted = false; };
  }, [id, page, getToken]);

  if (error && !user) {
    return (
      <div style={{ padding: '32px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid color-mix(in srgb, var(--red) 25%, transparent)',
            borderRadius: 16,
            padding: '32px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            color: 'var(--red)',
          }}
        >
          <AlertCircle size={24} />
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Profile</div>
            <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--red) 60%, var(--text-tertiary))' }}>{error}</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px' }}>
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => navigate('/admin/users')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          borderRadius: 8,
          border: '1px solid var(--db-border)',
          background: 'var(--surface)',
          color: 'var(--primary)',
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--surface-2)';
          e.currentTarget.style.borderColor = 'rgba(var(--primary-rgb), 0.25)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--surface)';
          e.currentTarget.style.borderColor = 'var(--db-border)';
        }}
      >
        <ArrowLeft size={16} />
        Back to Users
      </motion.button>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: 'var(--surface-2)',
              border: '1px solid var(--db-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            👤
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {user?.username || `User ${id}`}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{user?.email}</p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}
        >
          <StatCard icon={Zap} label="Total XP" value={user.xpTotal?.toLocaleString() || '0'} color="var(--amber)" />
          <StatCard icon={Award} label="Badges Earned" value={badges.length} color="var(--primary)" />
          <StatCard icon={BookOpen} label="Role" value={user.role || 'User'} color="var(--blue)" />
          <StatCard
            icon={Users}
            label="Active Status"
            value={user.isActive ? 'Active' : 'Inactive'}
            color={user.isActive ? 'var(--primary)' : 'var(--red)'}
          />
        </motion.div>
      )}

      {/* Badges Section */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--db-border)',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Earned Badges</h2>
          <BadgesList badges={badges} loading={loading} />
        </motion.div>
      )}

      {/* Quiz Attempts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--db-border)',
          borderRadius: 16,
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Quiz Attempt History</h2>
        <AttemptTable attempts={attempts} loading={loading} error={error} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Award, BookOpen, Zap, AlertCircle, LoaderCircle, Edit2, Trash2 } from 'lucide-react';
import { StudentService, UserService } from '@/lib/api';

function StatCard({ icon: Icon, label, value, color = '#c8ff3e' }) {
  return (
    <div
      style={{
        background: '#131415',
        border: '1px solid #252627',
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
          background: `rgba(${color === '#c8ff3e' ? '200, 255, 62' : color === '#6bceff' ? '107, 206, 255' : '255, 107, 207'}, 0.1)`,
          border: `1px solid ${color}40`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={24} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff' }}>{value}</div>
      </div>
    </div>
  );
}

function BadgesList({ badges, loading }) {
  if (loading) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 80, height: 80, background: '#252627', borderRadius: 8, animation: 'pulse 2s' }} />
        ))}
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return <div style={{ color: '#8a8b8e', fontSize: 13 }}>No badges earned yet</div>;
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 12 }}>
      {badges.map((badge) => (
        <motion.div
          key={badge.badgeId}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 12,
            padding: '12px',
            textAlign: 'center',
            cursor: 'pointer',
          }}
          title={badge.name}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{badge.iconType || '🏆'}</div>
          <div style={{ fontSize: 11, color: '#8a8b8e', fontWeight: 500 }}>{badge.name}</div>
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
          background: '#131415',
          border: '1px solid #ff6b6b40',
          borderRadius: 12,
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

  if (!attempts || attempts.length === 0) {
    return (
      <div
        style={{
          background: '#131415',
          border: '1px dashed #252627',
          borderRadius: 12,
          padding: '40px',
          textAlign: 'center',
          color: '#8a8b8e',
        }}
      >
        No quiz attempts yet
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}
      >
        <thead>
          <tr style={{ borderBottom: '1px solid #252627' }}>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>Quiz</th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>Algorithm</th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>Score</th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>Status</th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>XP</th>
            <th style={{ textAlign: 'left', padding: '12px', color: '#8a8b8e', fontWeight: 500 }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((attempt) => (
            <motion.tr
              key={attempt.attemptId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                borderBottom: '1px solid #252627',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#1a1b1d')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <td style={{ padding: '12px', color: '#ffffff' }}>{attempt.quizTitle}</td>
              <td style={{ padding: '12px', color: '#c8ff3e' }}>{attempt.algorithmName}</td>
              <td style={{ padding: '12px', color: '#ffffff', fontWeight: 600 }}>{attempt.score.toFixed(1)}%</td>
              <td style={{ padding: '12px' }}>
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 8px',
                    borderRadius: 4,
                    background: attempt.passed ? 'rgba(200, 255, 62, 0.1)' : 'rgba(255, 107, 207, 0.1)',
                    color: attempt.passed ? '#c8ff3e' : '#ff6bcf',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {attempt.passed ? 'Passed' : 'Failed'}
                </div>
              </td>
              <td style={{ padding: '12px', color: '#ffc839', fontWeight: 600 }}>+{attempt.xpEarned}</td>
              <td style={{ padding: '12px', color: '#8a8b8e' }}>
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
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #252627',
          background: currentPage === 1 ? '#1a1b1d' : '#131415',
          color: currentPage === 1 ? '#8a8b8e' : '#ffffff',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Previous
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: page === currentPage ? '1px solid #c8ff3e' : '1px solid #252627',
            background: page === currentPage ? 'rgba(200, 255, 62, 0.1)' : '#131415',
            color: page === currentPage ? '#c8ff3e' : '#ffffff',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #252627',
          background: currentPage === totalPages ? '#1a1b1d' : '#131415',
          color: currentPage === totalPages ? '#8a8b8e' : '#ffffff',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontWeight: 600,
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

        // Load user info
        const userResponse = await UserService.getUserById(userId, getToken);
        if (isMounted && userResponse?.data) {
          setUser(userResponse.data);
        }

        // Load dashboard (badges)
        const dashResponse = await StudentService.getDashboard(userId, getToken);
        if (isMounted && dashResponse?.data?.earnedBadges) {
          setBadges(dashResponse.data.earnedBadges);
        }

        // Load attempts
        const attemptsResponse = await StudentService.getAttemptHistory(userId, page, pageSize, getToken);
        if (isMounted && attemptsResponse?.data) {
          setAttempts(attemptsResponse.data.attempts || []);
          setTotalPages(Math.ceil((attemptsResponse.data.totalCount || 0) / pageSize));
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load student profile');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [id, page, getToken]);

  if (error && !user) {
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
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Profile</div>
            <div style={{ fontSize: 13, color: '#ff6b6b80' }}>{error}</div>
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
          border: '1px solid #252627',
          background: '#131415',
          color: '#c8ff3e',
          cursor: 'pointer',
          marginBottom: 24,
          fontSize: 13,
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#1a1b1d';
          e.currentTarget.style.borderColor = '#c8ff3e40';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#131415';
          e.currentTarget.style.borderColor = '#252627';
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
              background: '#252627',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 32,
            }}
          >
            👤
          </div>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
              {user?.username || `User ${id}`}
            </h1>
            <p style={{ fontSize: 13, color: '#8a8b8e' }}>{user?.email}</p>
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
          <StatCard icon={Zap} label="Total XP" value={user.xpTotal?.toLocaleString() || '0'} color="#ffc839" />
          <StatCard icon={Award} label="Badges Earned" value={badges.length} color="#c8ff3e" />
          <StatCard icon={BookOpen} label="Role" value={user.role || 'User'} color="#6bceff" />
          <StatCard
            icon={Users}
            label="Active Status"
            value={user.isActive ? 'Active' : 'Inactive'}
            color={user.isActive ? '#c8ff3e' : '#ff6bcf'}
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
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 16,
            padding: '24px',
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>Earned Badges</h2>
          <BadgesList badges={badges} loading={loading} />
        </motion.div>
      )}

      {/* Quiz Attempts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 16,
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: '#ffffff', marginBottom: 16 }}>Quiz Attempt History</h2>
        <AttemptTable attempts={attempts} loading={loading} error={error} />
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </motion.div>
    </div>
  );
}

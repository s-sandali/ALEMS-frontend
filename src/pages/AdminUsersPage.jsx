import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { motion } from 'motion/react';
import { Trash2, Edit2, LoaderCircle, AlertCircle, Shield, User } from 'lucide-react';
import { UserService } from '@/lib/api';

function UserTable({ users, loading, error, onDelete }) {
  if (loading) {
    return (
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
        Loading users...
      </motion.div>
    );
  }

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
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Users</div>
          <div style={{ fontSize: 13, color: '#ff6b6b80' }}>{error}</div>
        </div>
      </motion.div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: '#131415',
          border: '1px solid #252627',
          borderRadius: 16,
          padding: '40px',
          textAlign: 'center',
          color: '#8a8b8e',
        }}
      >
        <User size={40} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
        <div style={{ fontSize: 14, fontWeight: 500 }}>No users found</div>
      </motion.div>
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
      <div style={{ overflowX: 'auto' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 13,
        }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #252627', background: '#0a0a0a' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>ID</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>Email</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>Username</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>Role</th>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>XP</th>
              <th style={{ padding: '12px 16px', textAlign: 'center', color: '#8a8b8e', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => (
              <motion.tr
                key={user.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                style={{
                  borderBottom: '1px solid #252627',
                  '&:hover': { background: '#1a1b1c' },
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1a1b1c'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.userId}</td>
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.email || '—'}</td>
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.username || '—'}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: user.role === 'Admin' ? 'rgba(200, 255, 62, 0.1)' : 'rgba(107, 206, 255, 0.1)',
                      color: user.role === 'Admin' ? '#c8ff3e' : '#6bceff',
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                  >
                    <Shield size={12} />
                    {user.role || 'User'}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.xpTotal || 0}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: '1px solid #252627',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: '#8a8b8e',
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#6bceff';
                        e.target.style.color = '#6bceff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#252627';
                        e.target.style.color = '#8a8b8e';
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => onDelete(user.userId)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #252627',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: '#8a8b8e',
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.borderColor = '#ff6b6b';
                        e.target.style.color = '#ff6b6b';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.borderColor = '#252627';
                        e.target.style.color = '#8a8b8e';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const response = await UserService.getAllUsers(getToken);
        if (isMounted && response?.data) {
          setUsers(Array.isArray(response.data) ? response.data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load users');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, [getToken]);

  const handleDelete = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;

    try {
      await UserService.deleteUser(userId, getToken);
      setUsers(users.filter(u => u.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>
          User Management
        </h1>
        <p style={{ fontSize: 14, color: '#8a8b8e' }}>
          View and manage all registered users on the platform
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div
          style={{
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 16,
            padding: '20px',
          }}
        >
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Total Users</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{users.length}</div>
        </div>
        <div
          style={{
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 16,
            padding: '20px',
          }}
        >
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Admins</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#c8ff3e' }}>
            {users.filter(u => u.role === 'Admin').length}
          </div>
        </div>
        <div
          style={{
            background: '#131415',
            border: '1px solid #252627',
            borderRadius: 16,
            padding: '20px',
          }}
        >
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Regular Users</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6bceff' }}>
            {users.filter(u => u.role !== 'Admin').length}
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <UserTable users={users} loading={loading} error={error} onDelete={handleDelete} />
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trash2, CheckCircle, XCircle, LoaderCircle, AlertCircle, Shield, User } from 'lucide-react';
import { UserService } from '@/lib/api';

function Pagination({ currentPage, totalPages, onPageChange, loading }) {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1 || loading}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #252627',
          background: currentPage === 1 ? '#1a1b1d' : '#131415',
          color: currentPage === 1 ? '#8a8b8e' : '#ffffff',
          cursor: currentPage === 1 || loading ? 'not-allowed' : 'pointer',
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
          disabled={loading}
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
        disabled={currentPage === totalPages || loading}
        style={{
          padding: '8px 12px',
          borderRadius: 6,
          border: '1px solid #252627',
          background: currentPage === totalPages ? '#1a1b1d' : '#131415',
          color: currentPage === totalPages ? '#8a8b8e' : '#ffffff',
          cursor: currentPage === totalPages || loading ? 'not-allowed' : 'pointer',
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Next
      </button>
    </div>
  );
}

function UserTable({ users, loading, error, onDelete, onUpdateUser, navigate, currentPage, totalPages, onPageChange }) {
  const { getToken } = useAuth();
  const [updating, setUpdating] = useState({});

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

  const handleToggleActive = async (userId, currentStatus) => {
    const user = users.find(u => u.userId === userId);
    setUpdating({ ...updating, [userId]: true });
    try {
      await onUpdateUser(userId, user.role, !currentStatus);
    } finally {
      setUpdating({ ...updating, [userId]: false });
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    const user = users.find(u => u.userId === userId);
    setUpdating({ ...updating, [userId]: true });
    try {
      await onUpdateUser(userId, newRole, user.isActive);
    } finally {
      setUpdating({ ...updating, [userId]: false });
    }
  };

  return (
    <>
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
                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#8a8b8e', fontWeight: 500 }}>Status</th>
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
                  onClick={() => navigate(`/admin/students/${user.userId}`)}
                  style={{
                    borderBottom: '1px solid #252627',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1a1b1c'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.userId}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.email || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#ffffff' }}>{user.username || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={user.role || 'User'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChangeRole(user.userId, e.target.value);
                      }}
                      disabled={updating[user.userId]}
                      style={{
                        background: user.role === 'Admin' ? 'rgba(200, 255, 62, 0.1)' : 'rgba(107, 206, 255, 0.1)',
                        color: user.role === 'Admin' ? '#c8ff3e' : '#6bceff',
                        border: user.role === 'Admin' ? '1px solid #c8ff3e' : '1px solid #6bceff',
                        borderRadius: 6,
                        padding: '4px 8px',
                        fontSize: 12,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#ffc839', fontWeight: 600 }}>{user.xpTotal || 0}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(user.userId, user.isActive);
                      }}
                      disabled={updating[user.userId]}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: updating[user.userId] ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 8px',
                        borderRadius: 6,
                        transition: 'all 0.2s',
                      }}
                    >
                      {updating[user.userId] ? (
                        <LoaderCircle size={16} style={{ animation: 'spin 1s linear infinite' }} />
                      ) : user.isActive ? (
                        <>
                          <CheckCircle size={16} color="#c8ff3e" />
                          <span style={{ color: '#c8ff3e', fontSize: 12, fontWeight: 500 }}>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="#ff6bcf" />
                          <span style={{ color: '#ff6bcf', fontSize: 12, fontWeight: 500 }}>Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(user.userId);
                      }}
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
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} loading={loading} />
    </>
  );
}

export default function AdminUsersPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        setLoading(true);
        setError('');

        const response = await UserService.getAllUsers(getToken);
        if (isMounted && response?.data) {
          const users = Array.isArray(response.data) ? response.data : [];
          setAllUsers(users);
          setTotalPages(Math.ceil(users.length / pageSize));
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

  const paginatedUsers = allUsers.slice((page - 1) * pageSize, page * pageSize);

  const handleDelete = async (userId) => {
    if (!window.confirm(`Are you sure you want to delete user ${userId}?`)) return;

    try {
      await UserService.deleteUser(userId, getToken);
      setAllUsers(allUsers.filter(u => u.userId !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
    }
  };

  const handleUpdateUser = async (userId, role, isActive) => {
    try {
      const response = await UserService.updateUser(userId, { role, isActive }, getToken);
      if (response?.data) {
        setAllUsers(allUsers.map(u => u.userId === userId ? response.data : u));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
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
          View and manage all registered users on the platform. Click a row to view student profile.
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
          <div style={{ fontSize: 24, fontWeight: 700, color: '#ffffff' }}>{allUsers.length}</div>
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
            {allUsers.filter(u => u.role === 'Admin').length}
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
            {allUsers.filter(u => u.role !== 'Admin').length}
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
          <div style={{ fontSize: 12, color: '#8a8b8e', marginBottom: 8 }}>Active Users</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#6bceff' }}>
            {allUsers.filter(u => u.isActive).length}
          </div>
        </div>
      </motion.div>

      {/* Users Table */}
      <UserTable 
        users={paginatedUsers} 
        loading={loading} 
        error={error} 
        onDelete={handleDelete}
        onUpdateUser={handleUpdateUser}
        navigate={navigate}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}

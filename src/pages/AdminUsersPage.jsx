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
          border: '1px solid var(--db-border)',
          background: currentPage === 1 ? 'var(--surface-2)' : 'var(--surface)',
          color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
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
            border: page === currentPage ? '1px solid var(--primary)' : '1px solid var(--db-border)',
            background: page === currentPage ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--surface)',
            color: page === currentPage ? 'var(--primary)' : 'var(--text-primary)',
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
          border: '1px solid var(--db-border)',
          background: currentPage === totalPages ? 'var(--surface-2)' : 'var(--surface)',
          color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
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
          color: 'var(--text-secondary)',
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
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Error Loading Users</div>
          <div style={{ fontSize: 13, color: 'color-mix(in srgb, var(--red) 60%, var(--text-tertiary))' }}>{error}</div>
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
          background: 'var(--surface)',
          border: '1px solid var(--db-border)',
          borderRadius: 16,
          padding: '40px',
          textAlign: 'center',
          color: 'var(--text-secondary)',
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
          background: 'var(--surface)',
          border: '1px solid var(--db-border)',
          borderRadius: 16,
          overflow: 'hidden',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--db-border)', background: 'var(--surface-2)' }}>
                {['ID', 'Email', 'Username', 'Role', 'XP', 'Status', 'Actions'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      padding: '12px 16px',
                      textAlign: i === 6 ? 'center' : 'left',
                      color: 'var(--text-secondary)',
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
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
                  style={{ borderBottom: '1px solid var(--db-border)', cursor: 'pointer' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{user.userId}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{user.email || '—'}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-primary)' }}>{user.username || '—'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={user.role || 'User'}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleChangeRole(user.userId, e.target.value);
                      }}
                      disabled={updating[user.userId]}
                      style={{
                        background: user.role === 'Admin' ? 'rgba(var(--primary-rgb), 0.1)' : 'var(--blue-dim)',
                        color: user.role === 'Admin' ? 'var(--primary)' : 'var(--blue)',
                        border: user.role === 'Admin' ? '1px solid var(--primary)' : '1px solid var(--blue)',
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
                  <td style={{ padding: '12px 16px', color: 'var(--amber)', fontWeight: 600 }}>{user.xpTotal || 0}</td>
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
                          <CheckCircle size={16} color="var(--primary)" />
                          <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 500 }}>Active</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} color="var(--red)" />
                          <span style={{ color: 'var(--red)', fontSize: 12, fontWeight: 500 }}>Inactive</span>
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
                        border: '1px solid var(--db-border)',
                        borderRadius: 8,
                        padding: '6px 8px',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: 12,
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--red)';
                        e.currentTarget.style.color = 'var(--red)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--db-border)';
                        e.currentTarget.style.color = 'var(--text-secondary)';
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
        if (isMounted) setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUsers();
    return () => { isMounted = false; };
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

  const summaryCards = [
    { label: 'Total Users', value: allUsers.length, color: 'var(--text-primary)' },
    { label: 'Admins', value: allUsers.filter(u => u.role === 'Admin').length, color: 'var(--primary)' },
    { label: 'Regular Users', value: allUsers.filter(u => u.role !== 'Admin').length, color: 'var(--blue)' },
    { label: 'Active Users', value: allUsers.filter(u => u.isActive).length, color: 'var(--blue)' },
  ];

  return (
    <div style={{ padding: '32px' }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
                            User <span style={{ color: "var(--primary)" }}>Management</span>
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          View and manage all registered users on the platform. Click a row to view student profile.
        </p>
      </motion.div>

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
        {summaryCards.map(card => (
          <div
            key={card.label}
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--db-border)',
              borderRadius: 16,
              padding: '20px',
            }}
          >
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </motion.div>

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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { LayoutDashboard, BarChart3, Users, BookOpen, Code2, ChevronRight, ShieldCheck } from 'lucide-react';
import DashboardNav from '@/components/dashboard/DashboardNav';

const adminMenuItems = [
  { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Quizzes', path: '/admin/quizzes', icon: BookOpen },
  { label: 'Coding Questions', path: '/admin/coding-questions', icon: Code2 },
];

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActiveRoute = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        style={{
          width: 240,
          background: 'var(--surface)',
          borderRight: '1px solid var(--db-border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--db-border)' }}>
          <div
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              padding: '8px 0',
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="var(--bg)" />
            </div>
            <div>
               <h1 className="text-l font-bold tracking-tight text-text-primary sm:text-l">
                            Admin <span style={{ color: "var(--primary)" }}>Panel</span>
                        </h1>

            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {adminMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.path);

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 12px',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.2s',
                  justifyContent: 'space-between',
                  borderLeft: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight size={16} />}
              </motion.button>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 12px',
            borderTop: '1px solid var(--db-border)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
          }}
        >
          Admin Dashboard v1.0
        </div>
      </motion.div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <DashboardNav />
        <motion.main
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ flex: 1, overflow: 'auto' }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}

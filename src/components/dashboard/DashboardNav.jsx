import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, List, BookOpen, Zap } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Algorithms', icon: List, path: '/algorithms' },
  { label: 'Quizzes', icon: BookOpen, path: '/quizzes' },
]

export default function DashboardNav({ user }) {
  const location = useLocation()

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        height: 52,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        gap: 8,
        background: 'rgba(13,14,15,0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        style={{
          fontFamily: "'Poppins', sans-serif",
          fontSize: 17,
          fontWeight: 700,
          color: '#c8ff3e',
          textDecoration: 'none',
          letterSpacing: '-0.3px',
          flexShrink: 0,
        }}
      >
        BigO
      </Link>

      {/* Separator */}
      <div
        style={{
          width: 1,
          height: 16,
          background: '#2e2f30',
          flexShrink: 0,
          margin: '0 4px',
        }}
      />

      {/* Nav items */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 10px',
                borderRadius: 7,
                fontSize: 13,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
                ...(isActive
                  ? {
                      background: 'rgba(200,255,62,0.1)',
                      border: '1px solid rgba(200,255,62,0.25)',
                      color: '#c8ff3e',
                    }
                  : {
                      background: 'transparent',
                      border: '1px solid transparent',
                      color: '#8a8b8e',
                    }),
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = '#181919'
                  e.currentTarget.style.color = '#e4e5e6'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#8a8b8e'
                }
              }}
            >
              <Icon size={14} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Right side */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
        {/* XP badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'rgba(200,255,62,0.1)',
            border: '1px solid rgba(200,255,62,0.25)',
            color: '#c8ff3e',
            fontSize: 11,
            padding: '4px 10px',
            borderRadius: 20,
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          <Zap size={10} />
          {user.xpTotal ?? 0} XP
        </div>


      </div>
    </header>
  )
}

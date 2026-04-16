import { useState, useRef } from 'react'

// Simple CSS-based tooltip — no external dep needed
export function TooltipProvider({ children }) {
  return <>{children}</>
}

export function Tooltip({ children, content, side = 'top' }) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef(null)

  const show = () => {
    timerRef.current = setTimeout(() => setVisible(true), 160)
  }
  const hide = () => {
    clearTimeout(timerRef.current)
    setVisible(false)
  }

  const posStyles = {
    top: { bottom: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    bottom: { top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)' },
    left: { right: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' },
    right: { left: 'calc(100% + 6px)', top: '50%', transform: 'translateY(-50%)' },
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          style={{
            position: 'absolute',
            ...posStyles[side],
            zIndex: 9999,
            background: '#1a1b1d',
            border: '1px solid #2a2b2e',
            borderRadius: 6,
            padding: '6px 10px',
            fontSize: 11,
            color: '#e8e9ea',
            maxWidth: 200,
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.4,
            pointerEvents: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          }}
        >
          {content}
        </div>
      )}
    </div>
  )
}

import { motion } from 'motion/react'
import { CheckCircle, XCircle, Zap } from 'lucide-react'

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

const TH_STYLE = {
  padding: '10px 14px',
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '1.2px',
  textTransform: 'uppercase',
  color: '#4a4b4e',
  textAlign: 'left',
  borderBottom: '1px solid #252627',
  whiteSpace: 'nowrap',
}

const TD_STYLE = {
  padding: '12px 14px',
  fontSize: 13,
  color: '#c2c3c5',
  borderBottom: '1px solid #1a1b1c',
  verticalAlign: 'middle',
}

/**
 * @param {{ attempts: import('@/lib/api').QuizAttemptHistoryItem[] }} props
 */
export default function QuizAttemptHistoryTable({ attempts }) {
  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <p style={{
          fontSize: 11, color: '#4a4b4e',
          letterSpacing: '1.5px', textTransform: 'uppercase',
          fontFamily: "'Poppins', sans-serif", marginBottom: 4,
        }}>
          History
        </p>
        <h2 style={{
          fontSize: 20, fontWeight: 700, color: '#e4e5e6',
          fontFamily: "'Poppins', sans-serif", letterSpacing: '-0.4px',
        }}>
          Quiz Attempts
        </h2>
      </div>

      <div style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {attempts.length === 0 ? (
          <div style={{
            padding: '36px 24px',
            textAlign: 'center',
            color: '#4a4b4e',
            fontSize: 14,
          }}>
            No quiz attempts yet. Take a quiz to see your history here.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#0f1011' }}>
                  <th style={TH_STYLE}>Quiz</th>
                  <th style={TH_STYLE}>Algorithm</th>
                  <th style={{ ...TH_STYLE, textAlign: 'center' }}>Score</th>
                  <th style={{ ...TH_STYLE, textAlign: 'center' }}>Passed</th>
                  <th style={{ ...TH_STYLE, textAlign: 'center' }}>XP</th>
                  <th style={{ ...TH_STYLE, textAlign: 'right' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((attempt, i) => (
                  <motion.tr
                    key={attempt.attemptId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1a1b1c' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                  >
                    {/* Quiz */}
                    <td style={TD_STYLE}>
                      <span style={{ color: '#e4e5e6', fontWeight: 600 }}>
                        {attempt.quizTitle}
                      </span>
                    </td>

                    {/* Algorithm */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontSize: 11,
                        background: '#1a1b1c',
                        border: '1px solid #2e2f30',
                        borderRadius: 20,
                        padding: '2px 10px',
                        color: '#8a8b8e',
                        whiteSpace: 'nowrap',
                      }}>
                        {attempt.algorithmName}
                      </span>
                    </td>

                    {/* Score */}
                    <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                      <span style={{
                        fontWeight: 700,
                        color: attempt.scorePercent >= 70 ? '#c8ff3e' : '#ff9a9a',
                        fontFamily: "'Poppins', sans-serif",
                      }}>
                        {Math.round(attempt.scorePercent)}%
                      </span>
                      <span style={{ color: '#4a4b4e', fontSize: 11, marginLeft: 4 }}>
                        ({attempt.score}/{attempt.totalQuestions})
                      </span>
                    </td>

                    {/* Passed */}
                    <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                      {attempt.passed
                        ? <CheckCircle size={16} color="#c8ff3e" style={{ display: 'inline' }} />
                        : <XCircle size={16} color="#ff6b6b" style={{ display: 'inline' }} />
                      }
                    </td>

                    {/* XP */}
                    <td style={{ ...TD_STYLE, textAlign: 'center' }}>
                      {attempt.xpEarned > 0 ? (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 3,
                          color: '#c8ff3e',
                          fontWeight: 700,
                          fontSize: 12,
                        }}>
                          <Zap size={11} />
                          +{attempt.xpEarned}
                        </span>
                      ) : (
                        <span style={{ color: '#4a4b4e', fontSize: 12 }}>—</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ ...TD_STYLE, textAlign: 'right', color: '#8a8b8e', fontSize: 12 }}>
                      {formatDate(attempt.completedAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

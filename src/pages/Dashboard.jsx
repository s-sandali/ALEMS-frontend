import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LoaderCircle, BookOpen, PlayCircle, Target, Clock } from 'lucide-react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import ExploreAlgorithmsSection from '@/components/algorithms/ExploreAlgorithmsSection'
import { UserService, StudentQuizService } from '@/lib/api'

function QuizCard({ quiz, onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#131415',
        border: '1px solid #252627',
        borderRadius: 16,
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      whileHover={{ borderColor: 'rgba(200,255,62,0.3)' }}
      onClick={() => onStart(quiz.quizId)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'rgba(200,255,62,0.1)',
          border: '1px solid rgba(200,255,62,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <BookOpen size={16} color="#c8ff3e" />
        </div>
        {quiz.timeLimitMins && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 11, color: '#8a8b8e',
            background: '#1a1b1c', borderRadius: 20,
            padding: '3px 10px', border: '1px solid #252627',
          }}>
            <Clock size={10} />
            {quiz.timeLimitMins} min
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: '#e4e5e6',
          fontFamily: "'Space Grotesk', sans-serif",
          letterSpacing: '-0.3px', lineHeight: 1.2,
        }}>
          {quiz.title}
        </h3>
        {quiz.description && (
          <p style={{ fontSize: 12, color: '#8a8b8e', lineHeight: 1.5 }}>
            {quiz.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 11, color: '#c8ff3e',
          background: 'rgba(200,255,62,0.08)', borderRadius: 20,
          padding: '3px 10px', border: '1px solid rgba(200,255,62,0.2)',
        }}>
          <Target size={10} />
          Pass: {quiz.passScore}%
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderTop: '1px solid #252627', paddingTop: 12, marginTop: 2,
      }}>
        <span style={{ fontSize: 11, color: '#4a4b4e', textTransform: 'uppercase', letterSpacing: '1.5px' }}>
          Start Quiz
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c8ff3e', fontSize: 13, fontWeight: 600 }}>
          <PlayCircle size={15} />
          Play
        </div>
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const navigate = useNavigate()

  const [xpTotal, setXpTotal] = useState(0)
  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(true)
  const [quizzesError, setQuizzesError] = useState('')

  const displayName = user?.firstName ?? user?.username ?? 'there'

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const syncRes = await UserService.syncUser(getToken)
        if (isMounted) setXpTotal(syncRes?.data?.xpTotal ?? 0)
      } catch {
        // xpTotal stays 0
      }

      try {
        const quizRes = await StudentQuizService.getActiveQuizzes(getToken)
        if (isMounted) setQuizzes(Array.isArray(quizRes?.data) ? quizRes.data : [])
      } catch (err) {
        if (isMounted) setQuizzesError(err instanceof Error ? err.message : 'Failed to load quizzes.')
      } finally {
        if (isMounted) setQuizzesLoading(false)
      }
    }

    load()
    return () => { isMounted = false }
  }, [getToken])

  return (
    <div style={{ minHeight: '100vh', background: '#0d0e0f' }}>
      <DashboardNav user={{ xpTotal }} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '28px 24px 60px' }}>
        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 32 }}
        >
          <p style={{
            fontSize: 11, color: '#4a4b4e',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            fontFamily: "'JetBrains Mono', monospace", marginBottom: 6,
          }}>
            Dashboard
          </p>
          <h1 style={{
            fontSize: 26, fontWeight: 700,
            letterSpacing: '-0.8px', lineHeight: 1.1,
            fontFamily: "'Space Grotesk', sans-serif", color: '#e4e5e6',
          }}>
            Welcome back,{' '}
            <span style={{ color: '#c8ff3e' }}>{displayName}</span>
          </h1>
          <p style={{ color: '#8a8b8e', fontSize: 13, marginTop: 4 }}>
            Here's your learning progress at a glance.
          </p>
        </motion.div>

        {/* Explore algorithms */}
        <ExploreAlgorithmsSection
          limit={4}
          showViewAll
          description="Explore the algorithm library. Each card highlights the name, average complexity, and difficulty before you open its dedicated route."
        />

        {/* Active quizzes */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <p style={{
                fontSize: 11, color: '#4a4b4e',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace", marginBottom: 4,
              }}>
                Active
              </p>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: '#e4e5e6',
                fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '-0.4px',
              }}>
                Quizzes
              </h2>
            </div>
          </div>

          {quizzesLoading ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: '#8a8b8e', fontSize: 14, minHeight: 120,
            }}>
              <LoaderCircle size={16} color="#c8ff3e" style={{ animation: 'spin 1s linear infinite' }} />
              Loading quizzes…
            </div>
          ) : quizzesError ? (
            <div style={{
              background: 'rgba(255,90,90,0.06)', border: '1px solid rgba(255,90,90,0.2)',
              borderRadius: 12, padding: '14px 18px', color: '#ff9a9a', fontSize: 13,
            }}>
              {quizzesError}
            </div>
          ) : quizzes.length === 0 ? (
            <div style={{
              background: '#131415', border: '1px dashed #2e2f30',
              borderRadius: 16, padding: '36px 24px',
              textAlign: 'center', color: '#4a4b4e', fontSize: 14,
            }}>
              No quizzes are available yet.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}>
              {quizzes.map((quiz, i) => (
                <motion.div
                  key={quiz.quizId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <QuizCard quiz={quiz} onStart={(id) => navigate(`/quiz/${id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

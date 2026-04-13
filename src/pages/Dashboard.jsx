import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { LoaderCircle, BookOpen, PlayCircle, Target, Clock } from 'lucide-react'
import DashboardNav from '@/components/dashboard/DashboardNav'
import ExploreAlgorithmsSection from '@/components/algorithms/ExploreAlgorithmsSection'
import BadgesGrid from '@/components/dashboard/BadgesGrid'
import XPProgressBar from '@/components/ui/XPProgressBar'
import { UserService, StudentQuizService, StudentService, AlgorithmService, LeaderboardService } from '@/lib/api'
import StatCards from '@/components/dashboard/StatCards'
import QuizAttemptHistoryTable from '@/components/dashboard/QuizAttemptHistoryTable'
import AlgorithmProgressList from '@/components/dashboard/AlgorithmProgressList'
import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed'

/** Converts a hex color string (#rrggbb) to rgba(r,g,b,0.1) for badge icon backgrounds. */
function iconBgFromColor(hex = '#c8ff3e') {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},0.1)`
}

// ── Algorithm progress helpers ─────────────────────────────────────────────────

const CATEGORY_COLORS = {
  'Sorting':             '#c8ff3e',
  'Searching':           '#4da6ff',
  'Graph':               '#ff9a3e',
  'Dynamic Programming': '#b57cf5',
  'Tree':                '#ff6b9d',
}

function deriveDifficulty(avgComplexity = '') {
  const c = avgComplexity.toLowerCase()
  if (c === 'o(1)' || c === 'o(log n)') return 'Easy'
  if (c.includes('n²') || c.includes('n^2') || c.includes('2^n')) return 'Hard'
  return 'Medium'
}

function mergeAlgorithmCoverage(algorithmList, coverage) {
  const covMap = new Map(coverage.map(c => [c.algorithmId, c]))
  return algorithmList.map(algo => {
    const cov = covMap.get(algo.algorithmId)
    const accentColor = CATEGORY_COLORS[algo.category] ?? '#c8ff3e'
    return {
      id: algo.algorithmId,
      name: algo.name,
      category: algo.category,
      difficulty: deriveDifficulty(algo.timeComplexityAverage),
      status: algo.quizAvailable ? 'active' : 'locked',
      progressPercent: Math.round(cov?.bestScorePercent ?? 0),
      accentColor,
      accentDim: accentColor + '18',
      timeComplexity: algo.timeComplexityAverage || '—',
      spaceComplexity: '—',
      route: `/algorithms/${algo.algorithmId}`,
      quizzesDone: cov?.hasPassedQuiz ? 1 : 0,
      quizzesTotal: algo.quizAvailable ? 1 : 0,
    }
  })
}

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
          fontFamily: "'Poppins', sans-serif",
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
  const [badges, setBadges] = useState([])
  const [studentId, setStudentId] = useState(null)
  const [progression, setProgression] = useState(null)
  const [performanceSummary, setPerformanceSummary] = useState(null)
  const [attemptHistory, setAttemptHistory] = useState([])
  const [algorithmCoverage, setAlgorithmCoverage] = useState([])
  const [rawAlgorithms, setRawAlgorithms] = useState([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')
  const [quizzes, setQuizzes] = useState([])
  const [quizzesLoading, setQuizzesLoading] = useState(true)
  const [quizzesError, setQuizzesError] = useState('')
  const [leaderboard, setLeaderboard] = useState([])
  const [activity, setActivity] = useState([])
  const [heatmap, setHeatmap] = useState([])

  const displayName = user?.firstName ?? user?.username ?? 'there'

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const syncRes = await UserService.syncUser(getToken)
        console.log('🔍 syncUser response:', syncRes)
        
        // Extract UserId from response (backend returns UserId, not id)
        const userId = syncRes?.data?.UserId || syncRes?.data?.userId
        console.log('📍 Extracted UserID:', userId)
        
        if (isMounted && userId) {
          setStudentId(userId)

          // Fetch progression data
          try {
            console.log(`📡 Fetching progression for student ID: ${userId}`)
            const progRes = await UserService.getProgression(userId, getToken)
            console.log('✅ Progression response:', progRes)
            if (isMounted && progRes?.data) {
              setProgression(progRes.data)
              setXpTotal(progRes.data.xpTotal ?? 0)
            }
          } catch (progErr) {
            console.error('⚠️ Progression fetch warning (non-blocking):', progErr)
          }

          // Fetch activity feed and heatmap (non-blocking — run alongside dashboard)
          StudentService.getActivity(userId, getToken).then(res => {
            if (isMounted && Array.isArray(res?.data)) setActivity(res.data)
          }).catch(err => console.warn('⚠️ Activity fetch warning (non-blocking):', err))

          StudentService.getActivityHeatmap(userId, getToken).then(res => {
            if (isMounted && Array.isArray(res?.data)) setHeatmap(res.data)
          }).catch(err => console.warn('⚠️ Heatmap fetch warning (non-blocking):', err))

          // Now fetch the dashboard data
          try {
            console.log(`📡 Fetching dashboard for student ID: ${userId}`)
            const dashRes = await StudentService.getDashboard(userId, getToken)
            console.log('✅ Dashboard response:', dashRes)
            console.log('Dashboard data type:', typeof dashRes?.data, 'Keys:', Object.keys(dashRes?.data || {}))
            
            if (isMounted && dashRes?.data) {
              try {
                // Transform allBadges to include earned status and award dates for BadgesGrid
                const earnedBadges = dashRes.data.earnedBadges || []
                const allBadges = dashRes.data.allBadges || []
                
                console.log('✅ earnedBadges:', earnedBadges)
                console.log('✅ allBadges:', allBadges)
                
                const earnedBadgeMap = new Map(
                  earnedBadges.map(b => [b.id, b.awardDate])
                )
                
                const badgesForGrid = allBadges.map(badge => {
                  const color = badge.iconColor || '#c8ff3e'
                  return {
                    id: badge.id,
                    name: badge.name,
                    status: badge.earned ? 'earned' : 'locked',
                    earnedDate: badge.earned ? earnedBadgeMap.get(badge.id) ?? null : null,
                    description: badge.description || 'Unlock this badge to show your progress',
                    iconType: badge.iconType || 'star',
                    unlockHint: 'Keep learning to unlock',
                    iconColor: color,
                    iconBg: iconBgFromColor(color),
                  }
                })
                
                setBadges(badgesForGrid)

                if (dashRes.data.performanceSummary) {
                  setPerformanceSummary(dashRes.data.performanceSummary)
                }
                setAttemptHistory(dashRes.data.quizAttemptHistory || [])
                setAlgorithmCoverage(dashRes.data.algorithmCoverage || [])
              } catch (transformErr) {
                console.error('❌ Data transformation error:', transformErr)
                throw transformErr
              }
            }
          } catch (err) {
            console.error('❌ Dashboard fetch error:', err)
            if (isMounted) setDashboardError(err instanceof Error ? err.message : 'Failed to load dashboard data.')
          } finally {
            if (isMounted) setDashboardLoading(false)
          }
        } else {
          console.warn('⚠️ No UserId found in syncRes')
          if (isMounted) {
            setDashboardError('Could not determine user ID from sync')
            setDashboardLoading(false)
          }
        }
      } catch (err) {
        console.error('❌ Sync user error:', err)
        if (isMounted) {
          setDashboardError(err instanceof Error ? err.message : 'Failed to sync user.')
          setDashboardLoading(false)
        }
      }

      // Quizzes, algorithm list, and leaderboard are independent of userId — run in parallel
      const [quizRes, algoRes, leaderboardRes] = await Promise.allSettled([
        StudentQuizService.getActiveQuizzes(getToken),
        AlgorithmService.getAll(getToken),
        LeaderboardService.getLeaderboard(getToken),
      ])

      if (isMounted) {
        if (quizRes.status === 'fulfilled') {
          setQuizzes(Array.isArray(quizRes.value?.data) ? quizRes.value.data : [])
        } else {
          setQuizzesError(quizRes.reason instanceof Error ? quizRes.reason.message : 'Failed to load quizzes.')
        }
        setQuizzesLoading(false)

        if (algoRes.status === 'fulfilled') {
          setRawAlgorithms(Array.isArray(algoRes.value?.data) ? algoRes.value.data : [])
        }

        if (leaderboardRes.status === 'fulfilled') {
          const entries = Array.isArray(leaderboardRes.value?.data) ? leaderboardRes.value.data : []
          setLeaderboard(entries.map(entry => ({
            rank:          entry.rank,
            userId:        entry.userId,
            username:      entry.username,
            initials:      entry.username.slice(0, 2).toUpperCase(),
            xp:            entry.xpTotal,
            isCurrentUser: entry.isCurrentUser,
          })))
        }
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
           <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            Dashboard
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            Welcome back,{' '}
            <span style={{ color: '#c8ff3e' }}>{displayName}</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-text-secondary">
            Here's your learning progress at a glance.
          </p>
        </motion.div>

        {/* Stat cards */}
        <StatCards user={{
          xpTotal,
          totalPassed: performanceSummary?.totalPassed ?? 0,
          passRate: performanceSummary?.passRate ?? null,
        }} />

        
        {/* XP Progress Bar */}
        {progression && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginTop: 32, marginBottom: 24 }}
          >
            <div style={{ marginBottom: 12 }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
                Level {progression.currentLevel}
              </p>
              <h3 className="text-4xl font-bold tracking-tight text-text-primary sm:text-3xl">
                Experience Progress
              </h3>
            </div>
            <XPProgressBar
              xpTotal={progression.xpTotal}
              xpPrevLevel={progression.xpPrevLevel}
              xpForNextLevel={progression.xpForNextLevel}
            />
          </motion.div>
        )}

        {/* Badges section */}
        <div style={{ marginTop: 32 }}>
          {dashboardLoading ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              color: '#8a8b8e', fontSize: 14, minHeight: 120,
            }}>
              <LoaderCircle size={16} color="#c8ff3e" style={{ animation: 'spin 1s linear infinite' }} />
              Loading badges…
            </div>
          ) : dashboardError ? (
            <div style={{
              background: 'rgba(255,90,90,0.06)', border: '1px solid rgba(255,90,90,0.2)',
              borderRadius: 12, padding: '14px 18px', color: '#ff9a9a', fontSize: 13,
            }}>
              {dashboardError}
            </div>
          ) : (
            <BadgesGrid badges={badges} />
          )}
        </div>

        {/* Algorithm progress */}
        {!dashboardLoading && !dashboardError && rawAlgorithms.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <AlgorithmProgressList
              algorithms={mergeAlgorithmCoverage(rawAlgorithms, algorithmCoverage)}
            />
          </div>
        )}

       
        {/* Activity + side panels */}
        {!dashboardLoading && (
          <div className="mt-8 grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)]">
            <div className="flex flex-col gap-5">
              

              {/* Leaderboard */}
              {leaderboard.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <LeaderboardPanel entries={leaderboard} />
                </motion.div>
              )}
            </div>

            {/* Recent activity */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RecentActivityFeed activities={activity} />
            </motion.div>

          </div>
        )}
         {/* Quiz attempt history */}
        {!dashboardLoading && !dashboardError && (
          <div style={{ marginTop: 32 }}>
            <QuizAttemptHistoryTable attempts={attemptHistory} />
          </div>
        )}

      </div>
      

        

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

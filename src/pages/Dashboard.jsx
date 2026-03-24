import { motion } from 'motion/react'
import {
  MOCK_USER,
  MOCK_ALGORITHMS,
  MOCK_CONTINUE,
  MOCK_BADGES,
  MOCK_ACTIVITY,
  MOCK_LEADERBOARD,
  MOCK_NEXT_UNLOCKS,
  MOCK_HEATMAP,
} from '@/mock/dashboardMock'
import DashboardNav from '@/components/dashboard/DashboardNav'
import StatCards from '@/components/dashboard/StatCards'
import ContinueLearningCard from '@/components/dashboard/ContinueLearningCard'
import AlgorithmProgressList from '@/components/dashboard/AlgorithmProgressList'
import ActivityHeatmap from '@/components/dashboard/ActivityHeatmap'
import BadgesGrid from '@/components/dashboard/BadgesGrid'
import RecentActivityFeed from '@/components/dashboard/RecentActivityFeed'
import LeaderboardPanel from '@/components/dashboard/LeaderboardPanel'
import NextToUnlockPanel from '@/components/dashboard/NextToUnlockPanel'
import ExploreAlgorithmsSection from '@/components/algorithms/ExploreAlgorithmsSection'

export default function Dashboard() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d0e0f' }}>
      <DashboardNav user={MOCK_USER} />

      <div
        style={{
          maxWidth: 1160,
          margin: '0 auto',
          padding: '28px 24px 60px',
        }}
      >
        {/* Welcome header + XP level bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginBottom: 24,
            gap: 20,
            flexWrap: 'wrap',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p
              style={{
                fontSize: 11,
                color: '#4a4b4e',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontFamily: "'JetBrains Mono', monospace",
                marginBottom: 6,
              }}
            >
              Dashboard
            </p>
            <h1
              style={{
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: '-0.8px',
                lineHeight: 1.1,
                fontFamily: "'Space Grotesk', sans-serif",
                color: '#e4e5e6',
              }}
            >
              Welcome back,{' '}
              <span style={{ color: '#c8ff3e' }}>{MOCK_USER.name}</span>
            </h1>
            <p style={{ color: '#8a8b8e', fontSize: 13, marginTop: 4 }}>
              Here's your learning progress at a glance.
            </p>
          </motion.div>

          {/* XP level bar */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              background: '#131415',
              border: '1px solid #252627',
              borderRadius: 12,
              padding: '14px 18px',
              minWidth: 220,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span style={{ fontSize: 12, color: '#8a8b8e' }}>
                Level {MOCK_USER.level} — {MOCK_USER.levelLabel}
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: '#c8ff3e',
                }}
              >
                {MOCK_USER.xp} / {MOCK_USER.xpForNextLevel} XP
              </span>
            </div>
            <div
              style={{
                height: 5,
                background: '#212224',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <motion.div
                style={{ height: '100%', background: '#c8ff3e', borderRadius: 3 }}
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    Math.round(
                      ((MOCK_USER.xp - MOCK_USER.xpPrevLevel) /
                        (MOCK_USER.xpForNextLevel - MOCK_USER.xpPrevLevel)) *
                        100
                    )
                  }%`,
                }}
                transition={{ duration: 0.9, ease: 'easeOut', delay: 0.4 }}
              />
            </div>
            <p style={{ fontSize: 11, color: '#4a4b4e', marginTop: 6 }}>
              {MOCK_USER.xpForNextLevel - MOCK_USER.xp} XP to Level{' '}
              {MOCK_USER.level + 1} — {MOCK_USER.nextLevelLabel}
            </p>
          </motion.div>
        </div>

        {/* Stat cards */}
        <StatCards user={MOCK_USER} />

        {/* Continue learning */}
        <div style={{ marginTop: 16 }}>
          <ContinueLearningCard data={MOCK_CONTINUE} />
        </div>

        {/* Main 2-column grid */}
        <div
          className="grid grid-cols-1 lg:grid-cols-[1fr_320px]"
          style={{ gap: 16, marginTop: 16, alignItems: 'start' }}
        >
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <AlgorithmProgressList algorithms={MOCK_ALGORITHMS} />
            <ActivityHeatmap heatmapData={MOCK_HEATMAP} />
            <BadgesGrid badges={MOCK_BADGES} />
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <RecentActivityFeed activities={MOCK_ACTIVITY} />
            <LeaderboardPanel entries={MOCK_LEADERBOARD} />
            <NextToUnlockPanel items={MOCK_NEXT_UNLOCKS} />
          </div>
        </div>

        {/* Explore algorithms — untouched, uses real API data */}
        <div style={{ marginTop: 32 }}>
          <ExploreAlgorithmsSection
            limit={4}
            showViewAll
            description="Continue from your dashboard into the algorithm library. Each card highlights the name, average complexity, and difficulty before you open its dedicated route."
          />
        </div>
      </div>
    </div>
  )
}

import React from 'react';
import { motion } from 'motion/react';

interface XPProgressBarProps {
  xpTotal: number;
  xpPrevLevel: number;
  xpForNextLevel: number;
  className?: string;
  variant?: 'default' | 'compact';
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  xpTotal,
  xpPrevLevel,
  xpForNextLevel,
  className = '',
  variant = 'default',
  size = 'md',
  showPercentage = true,
}) => {
  // Calculate the progress percentage between previous and next level
  const xpInCurrentLevel = xpTotal - xpPrevLevel;
  const xpNeededForLevel = xpForNextLevel - xpPrevLevel;
  const progressPercentage = (xpInCurrentLevel / xpNeededForLevel) * 100;
  const clampedPercentage = Math.min(Math.max(progressPercentage, 0), 100);

  // Size variants
  const sizeVariants = {
    sm: {
      container: 'h-4',
      label: 'text-xs',
    },
    md: {
      container: 'h-6',
      label: 'text-sm',
    },
    lg: {
      container: 'h-8',
      label: 'text-base',
    },
  };

  const sizes = sizeVariants[size];

  return (
    <div className={`flex flex-col ${variant === 'default' ? 'space-y-2' : 'space-y-1'} ${className}`}>
      {/* Header with labels */}
      {variant === 'default' && (
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-bold" style={{ color: 'var(--primary)' }}>
              {xpTotal}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              XP
            </span>
          </div>
          {showPercentage && (
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {Math.round(clampedPercentage)}%
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Next:
            </span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {xpForNextLevel}
            </span>
          </div>
        </div>
      )}

      {/* Progress bar container */}
      <div
        className={`relative w-full overflow-hidden rounded-full border ${sizes.container}`}
        style={{
          background: 'var(--surface-2, var(--surface))',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Animated fill */}
        <motion.div
          className="h-full rounded-full shadow-lg"
          style={{
            background: 'linear-gradient(to right, var(--primary), var(--accent), #0088ff)',
            boxShadow: '0 0 20px rgba(var(--primary-rgb), 0.45)',
          }}
          initial={{ width: '0%' }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{
            duration: 0.8,
            ease: 'easeOut',
            type: 'spring',
            stiffness: 100,
            damping: 20,
          }}
        />

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 h-full w-full rounded-full bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none"
          style={{ opacity: 0.2 }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Compact variant - inline labels */}
        {variant === 'compact' && (
          <div className="absolute inset-0 flex items-center justify-between px-2">
            <span className={`font-semibold ${sizes.label}`} style={{ color: 'var(--text-primary)' }}>
              {xpTotal}XP
            </span>
            {showPercentage && (
              <span className={`${sizes.label}`} style={{ color: 'var(--text-secondary)' }}>
                {Math.round(clampedPercentage)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Compact variant - footer label */}
      {variant === 'compact' && (
        <div className="flex justify-end">
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            Next: {xpForNextLevel}
          </span>
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;


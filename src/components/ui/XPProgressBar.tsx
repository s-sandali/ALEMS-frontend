import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface XPProgressBarProps {
  xpTotal: number;
  xpPrevLevel: number;
  xpForNextLevel: number;
  className?: string;
}

export const XPProgressBar: React.FC<XPProgressBarProps> = ({
  xpTotal,
  xpPrevLevel,
  xpForNextLevel,
  className = '',
}) => {
  const fillRef = useRef<HTMLDivElement>(null);
  
  // Calculate progress percentage
  const xpInCurrentLevel = xpTotal - xpPrevLevel;
  const xpNeededForLevel = xpForNextLevel - xpPrevLevel;
  const progressPercentage = Math.min((xpInCurrentLevel / xpNeededForLevel) * 100, 100);

  useEffect(() => {
    if (fillRef.current) {
      // Animate the fill bar
      gsap.to(fillRef.current, {
        width: `${progressPercentage}%`,
        duration: 1,
        ease: 'power2.out',
      });
    }
  }, [progressPercentage]);

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Progress bar container */}
      <div className="relative w-full h-8 bg-gradient-to-r from-slate-700 to-slate-800 rounded-full overflow-hidden border border-slate-600 shadow-lg">
        {/* Animated fill */}
        <div
          ref={fillRef}
          className="h-full bg-gradient-to-r from-lime-400 via-emerald-500 to-teal-500 rounded-full shadow-inner transition-shadow duration-300"
          style={{
            boxShadow: '0 0 20px rgba(163, 230, 53, 0.6), inset 0 0 10px rgba(255, 255, 255, 0.2)',
            width: '0%',
          }}
        />
        
        {/* Shine effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 pointer-events-none" />
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center text-sm">
        {/* Current XP */}
        <div className="flex items-baseline gap-1">
          <span className="font-semibold text-lime-400">{xpInCurrentLevel}</span>
          <span className="text-slate-400">XP</span>
        </div>

        {/* Progress percentage */}
        <div className="text-slate-400 font-medium">
          {Math.round(progressPercentage)}%
        </div>

        {/* Next level threshold */}
        <div className="flex items-baseline gap-1">
          <span className="text-slate-400">Next:</span>
          <span className="font-semibold text-emerald-400">{xpNeededForLevel}</span>
        </div>
      </div>
    </div>
  );
};

export default XPProgressBar;

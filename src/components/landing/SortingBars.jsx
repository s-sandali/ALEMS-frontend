import { useEffect, useRef } from "react";
import gsap from "gsap";
import { BAR_COLORS } from "../../data/landingData";

export default function SortingBars() {
    const barRefs = useRef([]);

    useEffect(() => {
        const initialHeights = [60, 90, 40, 110, 75, 50, 85];
        const finalHeights = [110, 50, 90, 40, 85, 75, 60];

        barRefs.current.forEach((bar, i) => {
            if (!bar) return;
            bar.style.height = `${initialHeights[i]}px`;

            gsap.to(bar, {
                height: finalHeights[i],
                duration: 0.8 + i * 0.15,
                yoyo: true,
                repeat: -1,
                ease: "power1.inOut",
                delay: i * 0.12,
            });
        });
    }, []);

    return (
        <div className="relative flex flex-col items-center">
            {/* Monitor frame */}
            <div className="glass glow-blue rounded-2xl p-6 w-full max-w-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                    <span className="ml-2 text-xs text-slate-400 font-mono">bubble_sort.js</span>
                </div>
                {/* Bars */}
                <div className="flex items-end gap-3 justify-center h-32 bg-slate-900/50 rounded-xl px-4 pb-3 pt-2">
                    {BAR_COLORS.map((color, i) => (
                        <div
                            key={i}
                            ref={(el) => (barRefs.current[i] = el)}
                            className="sort-bar flex-1"
                            style={{
                                background: `linear-gradient(180deg, ${color}, ${color}88)`,
                                boxShadow: `0 0 8px ${color}66`,
                                minWidth: "18px",
                                height: "60px",
                            }}
                        />
                    ))}
                </div>
                {/* Code snippet below bars */}
                <div className="mt-3 font-mono text-xs text-slate-400 bg-slate-900/50 rounded px-3 py-2 space-y-1">
                    <div>
                        <span className="text-violet-400">for</span>{" "}
                        <span className="text-cyan-400">(i = 0; i &lt; n; i++)</span>
                    </div>
                    <div className="pl-4">
                        <span className="text-blue-400">if</span>{" "}
                        <span className="text-slate-300">(arr[i] &gt; arr[i+1])</span>
                    </div>
                    <div className="pl-8 text-green-400">swap(arr, i, i+1)</div>
                </div>
            </div>
            {/* Floating labels */}
            <div className="absolute -top-3 -right-3 badge-chip">O(n²) Time</div>
            <div className="absolute -bottom-3 -left-3 badge-chip">O(1) Space</div>
        </div>
    );
}

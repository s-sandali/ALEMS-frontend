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
            <div className="glass glow-accent rounded-2xl p-6 w-full max-w-sm">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80" />
                    <div className="w-3 h-3 rounded-full bg-green-500 opacity-80" />
                    <span className="ml-2 text-xs text-text-secondary font-mono">bubble_sort.js</span>
                </div>
                {/* Bars */}
                <div className="flex items-end gap-3 justify-center h-32 rounded-xl px-4 pb-3 pt-2"
                    style={{ background: "rgba(12,12,12,0.6)" }}
                >
                    {BAR_COLORS.map((color, i) => (
                        <div
                            key={i}
                            ref={(el) => (barRefs.current[i] = el)}
                            className="sort-bar flex-1"
                            style={{
                                background: `linear-gradient(180deg, ${color}, ${color}66)`,
                                boxShadow: `0 0 10px ${color}55`,
                                minWidth: "18px",
                                height: "60px",
                            }}
                        />
                    ))}
                </div>
                {/* Code snippet below bars */}
                <div className="mt-3 font-mono text-xs rounded px-3 py-2 space-y-1"
                    style={{ background: "rgba(12,12,12,0.6)", color: "#A1A1A1" }}
                >
                    <div>
                        <span style={{ color: "#D5FF40" }}>for</span>{" "}
                        <span className="text-text-secondary">(i = 0; i &lt; n; i++)</span>
                    </div>
                    <div className="pl-4">
                        <span style={{ color: "#D5FF40" }}>if</span>{" "}
                        <span className="text-white/70">(arr[i] &gt; arr[i+1])</span>
                    </div>
                    <div className="pl-8" style={{ color: "#D5FF40" }}>swap(arr, i, i+1)</div>
                </div>
            </div>
            {/* Floating labels */}
            <div className="absolute -top-3 -right-3 badge-chip">O(n²) Time</div>

        </div>
    );
}

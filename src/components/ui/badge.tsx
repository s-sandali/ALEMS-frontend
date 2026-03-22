import * as React from "react";

import { cn } from "@/lib/utils";

type BadgeProps = React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "outline";
};

const badgeVariants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "border-accent/20 bg-accent/10 text-accent",
    secondary: "border-white/10 bg-white/5 text-text-secondary",
    outline: "border-white/15 bg-transparent text-white",
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
                badgeVariants[variant],
                className,
            )}
            {...props}
        />
    );
}

export { Badge };

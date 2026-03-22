import * as React from "react";

import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "secondary" | "outline" | "ghost";
    size?: "default" | "sm" | "icon";
};

const buttonVariants: Record<NonNullable<ButtonProps["variant"]>, string> = {
    default: "border-accent/20 bg-accent/10 text-accent hover:border-accent/40 hover:bg-accent/15",
    secondary: "border-white/10 bg-white/5 text-white hover:bg-white/10",
    outline: "border-white/15 bg-transparent text-white hover:bg-white/5",
    ghost: "border-transparent bg-transparent text-text-secondary hover:bg-white/5 hover:text-white",
};

const buttonSizes: Record<NonNullable<ButtonProps["size"]>, string> = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 py-2 text-sm",
    icon: "h-10 w-10",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
        <button
            ref={ref}
            type={type}
            className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full border font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                "disabled:pointer-events-none disabled:border-white/10 disabled:bg-white/5 disabled:text-text-secondary/60",
                buttonVariants[variant],
                buttonSizes[size],
                className,
            )}
            {...props}
        />
    ),
);

Button.displayName = "Button";

export { Button };

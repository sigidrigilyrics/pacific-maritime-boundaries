import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "quiet";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" &&
          "bg-primary/15 text-cyan-100 shadow-glow ring-1 ring-primary/30 hover:bg-primary/22",
        variant === "ghost" &&
          "bg-white/5 text-slate-100 ring-1 ring-white/10 hover:bg-white/10",
        variant === "quiet" && "bg-transparent text-cyan-200 hover:bg-cyan-300/10",
        className,
      )}
      {...props}
    />
  );
}

import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-md bg-surface px-3 text-base text-ink shadow-border outline-none",
        "placeholder:text-faint",
        "focus-visible:shadow-border-hover",
        "disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export function NativeSelect({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 w-full appearance-none rounded-md bg-surface bg-[length:12px] bg-[right_12px_center] bg-no-repeat px-3 pr-9 text-base text-ink shadow-border outline-none",
        "focus-visible:shadow-border-hover",
        className,
      )}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B655C' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>\")",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-md bg-surface px-3 py-2.5 text-base text-ink shadow-border outline-none",
        "placeholder:text-faint focus-visible:shadow-border-hover",
        className,
      )}
      {...props}
    />
  );
}

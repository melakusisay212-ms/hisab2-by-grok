import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  title,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { title: string }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40" />
      <DialogPrimitive.Content
        className={cn(
          "fixed z-50 flex max-h-[92dvh] flex-col bg-surface shadow-float outline-none",
          "inset-x-0 bottom-0 rounded-t-2xl p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
          "sm:inset-auto sm:top-1/2 sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-6",
          className,
        )}
        {...props}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <DialogPrimitive.Title className="font-display text-xl font-medium tracking-tight text-ink">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close className="flex size-10 items-center justify-center rounded-md text-muted hover:bg-bg-warm">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

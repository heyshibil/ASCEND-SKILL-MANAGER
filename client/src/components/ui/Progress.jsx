import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={"relative h-2 w-full overflow-hidden rounded-full bg-white/5 " + (className || "")}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 bg-indigo-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]"
      style={{ transform: "translateX(-" + (100 - (value || 0)) + "%)" }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }

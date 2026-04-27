import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={
      "inline-flex h-10 items-center justify-center rounded-[var(--radius-lg)] p-1 " +
      (className || "")
    }
    style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={
      "inline-flex items-center justify-center whitespace-nowrap rounded-[var(--radius-md)] px-4 py-1.5 text-[13px] font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-[var(--shadow-sm)] cursor-pointer " +
      (className || "")
    }
    style={{
      color: 'var(--text-secondary)',
    }}
    data-active-style="true"
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={
      "mt-4 focus-visible:outline-none " +
      (className || "")
    }
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

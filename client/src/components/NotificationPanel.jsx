import React, { useRef, useEffect } from "react";
import { Bell, CheckCheck, Inbox, BookOpen } from "lucide-react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/Tabs";
import {
  useUnreadNotifications,
  useReadNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
} from "../hooks/useNotifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TYPE_META = {
  DEBT: {
    color: "var(--danger)",
    bg: "var(--danger-bg)",
    label: "Skill Debt",
  },
  DECAYING: {
    color: "var(--warning)",
    bg: "var(--warning-bg)",
    label: "Decaying",
  },
  REVERIFY: {
    color: "var(--success)",
    bg: "var(--success-bg)",
    label: "Recovered",
  },
};

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

const NotificationCard = ({ notification, onRead, isRead }) => {
  const meta = TYPE_META[notification.type] ?? TYPE_META.DECAYING;

  return (
    <div
      onClick={() => !isRead && onRead(notification._id)}
      className="group flex gap-3 px-4 py-3 transition-colors"
      style={{
        cursor: isRead ? "default" : "pointer",
        borderBottom: "1px solid var(--border-subtle)",
      }}
      onMouseEnter={(e) => {
        if (!isRead)
          e.currentTarget.style.background = "var(--bg-raised)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
      }}
    >
      {/* Type badge dot */}
      <div className="mt-1 flex-shrink-0">
        <span
          className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold"
          style={{
            color: meta.color,
            background: meta.bg,
          }}
        >
          {meta.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-[13px] leading-snug"
          style={{ color: "var(--text-primary)" }}
        >
          {notification.message}
        </p>
        <p
          className="text-[11px] mt-1 font-[var(--font-mono)]"
          style={{ color: "var(--text-tertiary)" }}
        >
          {timeAgo(notification.createdAt)}
        </p>
      </div>

      {/* Mark-as-read affordance */}
      {!isRead && (
        <div
          className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
          title="Mark as read"
        >
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
        </div>
      )}
    </div>
  );
};

const EmptyState = ({ icon: Icon, message }) => (
  <div
    className="flex flex-col items-center justify-center py-10 gap-3"
    style={{ color: "var(--text-tertiary)" }}
  >
    <Icon className="w-8 h-8 opacity-40" />
    <p className="text-[13px]">{message}</p>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

/**
 * NotificationPanel — dropdown opened by the bell icon in DashboardLayout.
 * Uses existing Tabs component for Unread / Read tabs.
 *
 * @param {boolean}    isOpen   - controls visibility
 * @param {function}   onClose  - called when clicking outside
 */
export default function NotificationPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, onClose]);

  const {
    data: unread = [],
    isLoading: loadingUnread,
  } = useUnreadNotifications();

  const {
    data: read = [],
    isLoading: loadingRead,
  } = useReadNotifications();

  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead, isPending: markingAll } = useMarkAllAsRead();

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 z-50 flex flex-col"
      style={{
        width: "360px",
        maxHeight: "520px",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <span
            className="text-[14px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Notifications
          </span>
          {unread.length > 0 && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{
                background: "var(--danger)",
                color: "#fff",
                lineHeight: 1,
              }}
            >
              {unread.length > 99 ? "99+" : unread.length}
            </span>
          )}
        </div>

        {unread.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            disabled={markingAll}
            className="flex items-center gap-1 text-[11px] font-medium transition-colors"
            style={{
              color: markingAll ? "var(--text-tertiary)" : "var(--accent)",
              cursor: markingAll ? "not-allowed" : "pointer",
            }}
            title="Mark all as read"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            {markingAll ? "Clearing…" : "Mark all read"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unread" className="flex flex-col flex-1 min-h-0">
        <div
          className="px-4 pt-3 pb-0"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <TabsList className="w-full justify-start gap-1 bg-transparent border-0 p-0 h-auto rounded-none">
            <TabsTrigger
              value="unread"
              className="data-[state=active]:bg-[var(--bg-raised)] data-[state=active]:text-[var(--text-primary)] pb-2 rounded-t-[var(--radius-md)] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[var(--accent)]"
            >
              Unread
              {unread.length > 0 && (
                <span
                  className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: "var(--danger)", color: "#fff" }}
                >
                  {unread.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="read"
              className="data-[state=active]:bg-[var(--bg-raised)] data-[state=active]:text-[var(--text-primary)] pb-2 rounded-t-[var(--radius-md)] rounded-b-none border-b-2 border-transparent data-[state=active]:border-[var(--accent)]"
            >
              Read
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Unread tab */}
        <TabsContent
          value="unread"
          className="mt-0 flex-1 overflow-y-auto"
          style={{ maxHeight: "360px" }}
        >
          {loadingUnread ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-[var(--radius-md)] animate-pulse"
                  style={{ background: "var(--bg-raised)" }}
                />
              ))}
            </div>
          ) : unread.length === 0 ? (
            <EmptyState icon={Inbox} message="You're all caught up!" />
          ) : (
            unread.map((n) => (
              <NotificationCard
                key={n._id}
                notification={n}
                isRead={false}
                onRead={markAsRead}
              />
            ))
          )}
        </TabsContent>

        {/* Read tab */}
        <TabsContent
          value="read"
          className="mt-0 flex-1 overflow-y-auto"
          style={{ maxHeight: "360px" }}
        >
          {loadingRead ? (
            <div className="flex flex-col gap-2 p-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-[var(--radius-md)] animate-pulse"
                  style={{ background: "var(--bg-raised)" }}
                />
              ))}
            </div>
          ) : read.length === 0 ? (
            <EmptyState icon={BookOpen} message="No read notifications yet." />
          ) : (
            read.map((n) => (
              <NotificationCard
                key={n._id}
                notification={n}
                isRead={true}
                onRead={() => {}}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

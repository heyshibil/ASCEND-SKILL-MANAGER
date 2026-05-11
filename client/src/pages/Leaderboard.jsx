import { memo, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Droplets,
  Flame,
  Gauge,
  Loader2,
  Medal,
  RefreshCw,
  Star,
  Trophy,
  User,
} from "lucide-react";
import { useLeaderboardData } from "../hooks/useLeaderboardData";

const MotionDiv = motion.div;
const MotionButton = motion.button;

const numberFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 1,
});

const compactNumberFormatter = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const METRIC_OPTIONS = [
  {
    id: "solved",
    label: "Solved",
    heading: "Problems Solved",
    valueLabel: "Solved",
    icon: CheckCircle2,
    accent: "#22C55E",
  },
  // {
  //   id: "score",
  //   label: "Score",
  //   heading: "Liquidity Score",
  //   valueLabel: "Score",
  //   icon: Droplets,
  //   accent: "#38BDF8",
  // },
  {
    id: "streak",
    label: "Streak",
    heading: "Current Streak",
    valueLabel: "Days",
    icon: Flame,
    accent: "#FB923C",
  },
];

const PODIUM_CONFIG = [
  {
    rank: 2,
    title: "Vanguard",
    color: "#94A3B8",
    height: "h-[148px] sm:h-[200px]",
    icon: Medal,
    delay: 0.08,
  },
  {
    rank: 1,
    title: "Apex",
    color: "#EAB308",
    height: "h-[204px] sm:h-[280px]",
    icon: Trophy,
    delay: 0.16,
  },
  {
    rank: 3,
    title: "Pioneer",
    color: "#B45309",
    height: "h-[124px] sm:h-[160px]",
    icon: Medal,
    delay: 0,
  },
];

const podiumVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 32 },
  show: (delay) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18, delay },
  }),
  exit: { opacity: 0, y: 16, transition: { duration: 0.16 } },
};

const listVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.035 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
};

const getMetricConfig = (mode) =>
  METRIC_OPTIONS.find((metric) => metric.id === mode) || METRIC_OPTIONS[0];

const getEntryId = (entry) => entry?._id || entry?.userId || entry?.username;

const getEntryUsername = (entry) => entry?.username || "anonymous";

const getEntryValue = (entry) =>
  typeof entry?.value === "number" ? entry.value : 0;

const formatMetricValue = (value, compact = false) =>
  compact ? compactNumberFormatter.format(value) : numberFormatter.format(value);

const Avatar = memo(function Avatar({
  avatarUrl,
  username,
  size = 32,
  borderColor,
}) {
  const style = {
    width: size,
    height: size,
    borderColor: borderColor ?? "var(--border-subtle)",
    flexShrink: 0,
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={username}
        className="rounded-full border-2 object-cover"
        style={style}
      />
    );
  }

  return (
    <div
      className="rounded-full border-2 flex items-center justify-center bg-[var(--bg-raised)]"
      style={style}
    >
      <User
        style={{ width: size * 0.48, height: size * 0.48 }}
        className="text-[var(--text-tertiary)]"
      />
    </div>
  );
});

const PodiumSpot = memo(function PodiumSpot({
  rank,
  user,
  title,
  heightClass,
  color,
  icon,
  delay,
  metric,
}) {
  const value = getEntryValue(user);
  const username = getEntryUsername(user);
  const RankIcon = icon;
  const MetricIcon = metric.icon;

  return (
    <MotionDiv
      custom={delay}
      variants={podiumVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className="flex min-w-0 flex-col items-center justify-end"
    >
      <div className="z-10 mb-3 flex max-w-[96px] flex-col items-center sm:mb-4 sm:max-w-[128px]">
        {rank === 1 && (
          <RankIcon className="mb-2 h-5 w-5" style={{ color }} />
        )}

        <div className="relative mb-3">
          <Avatar
            avatarUrl={user.avatarUrl}
            username={username}
            size={rank === 1 ? 72 : 58}
            borderColor={color}
          />
          <div
            className="absolute -bottom-1 -right-1 rounded-full border bg-[var(--bg-surface)] p-1"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <RankIcon className="h-3.5 w-3.5" style={{ color }} />
          </div>
        </div>

        <span className="w-full truncate text-center text-[12px] font-medium text-[var(--text-primary)] sm:text-[13px]">
          @{username}
        </span>

        <span
          className="mb-2 mt-0.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {title}
        </span>

        <div
          className="flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px]"
          style={{ borderColor: `${color}40`, background: "var(--bg-raised)" }}
        >
          <MetricIcon className="h-3.5 w-3.5" style={{ color: metric.accent }} />
          <span className="font-mono font-bold text-[var(--text-primary)]">
            {formatMetricValue(value, true)}
          </span>
        </div>
      </div>

      <div
        className={`flex w-20 items-start justify-center rounded-t-[var(--radius-lg)] border-l border-r border-t pt-4 sm:w-28 sm:pt-5 ${heightClass}`}
        style={{
          borderColor: `${color}35`,
          background: "var(--bg-canvas)",
        }}
      >
        <span className="text-[32px] font-black opacity-15 sm:text-[38px]" style={{ color }}>
          {rank}
        </span>
      </div>
    </MotionDiv>
  );
});

const ListRow = memo(function ListRow({ user, rank, isMe = false }) {
  const value = getEntryValue(user);
  const username = getEntryUsername(user);
  const streak = user?.currentStreak || 0;

  return (
    <MotionDiv
      layout
      variants={itemVariants}
      className={`group flex min-h-[54px] items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2.5 transition-colors ${
        isMe
          ? "border-[var(--accent)] bg-[var(--accent-bg)]"
          : "border-transparent hover:border-[var(--border-subtle)] hover:bg-[var(--bg-raised)]"
      }`}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`w-7 shrink-0 text-center font-mono text-[13px] font-bold transition-colors ${
            isMe
              ? "text-[var(--accent)]"
              : "text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)]"
          }`}
        >
          {rank}
        </span>

        <Avatar avatarUrl={user?.avatarUrl} username={username} size={34} />

        <div className="flex min-w-0 flex-col">
          <span className="truncate text-[13px] font-medium leading-tight text-[var(--text-primary)]">
            {username}
            {isMe && (
              <span className="ml-1.5 text-[11px] text-[var(--accent)]">
                You
              </span>
            )}
          </span>
          {isMe && (
            <span className="text-[11px] text-[var(--text-tertiary)]">
              Your current position
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        <div className="flex w-12 items-center justify-end gap-1">
          {streak > 0 ? (
            <>
              <Flame className="h-3.5 w-3.5 text-[#FB923C]" />
              <span className="font-mono text-[12px] font-medium text-[#FB923C]">
                {formatMetricValue(streak, true)}
              </span>
            </>
          ) : (
            <span className="font-mono text-[12px] text-[var(--text-tertiary)]">
              -
            </span>
          )}
        </div>

        <span className="w-12 text-right font-mono text-[15px] font-bold text-[var(--text-primary)]">
          {formatMetricValue(value, true)}
        </span>
      </div>
    </MotionDiv>
  );
});

const SkeletonRows = ({ count = 6 }) => (
  <div className="flex flex-col gap-1">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="flex h-[54px] animate-pulse items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--bg-raised)] px-3"
      >
        <div className="h-4 w-7 rounded bg-[var(--border-subtle)]" />
        <div className="h-8 w-8 rounded-full bg-[var(--border-subtle)]" />
        <div className="h-4 flex-1 rounded bg-[var(--border-subtle)]" />
        <div className="h-4 w-14 rounded bg-[var(--border-subtle)]" />
      </div>
    ))}
  </div>
);

const PodiumSkeleton = () => (
  <div className="flex h-full w-full animate-pulse items-end justify-center gap-4 px-6">
    {[148, 220, 124].map((height, index) => (
      <div key={index} className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-[var(--bg-raised)]" />
        <div
          className="w-20 rounded-t-[var(--radius-lg)] bg-[var(--bg-raised)] sm:w-28"
          style={{ height }}
        />
      </div>
    ))}
  </div>
);

const EmptyState = ({ title, description, icon = Trophy }) => {
  const EmptyIcon = icon;

  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full border"
        style={{
          borderColor: "var(--border-subtle)",
          background: "var(--bg-raised)",
        }}
      >
        <EmptyIcon className="h-5 w-5 text-[var(--text-tertiary)]" />
      </div>
      <div>
        <p className="text-[14px] font-medium text-[var(--text-primary)]">
          {title}
        </p>
        <p className="mt-1 max-w-sm text-[12px] text-[var(--text-tertiary)]">
          {description}
        </p>
      </div>
    </div>
  );
};

const ErrorState = ({ message, onRetry }) => (
  <div className="flex h-full min-h-[220px] flex-col items-center justify-center gap-3 px-6 text-center">
    <AlertCircle className="h-8 w-8 text-[var(--danger)]" />
    <p className="max-w-sm text-[13px] text-[var(--text-secondary)]">
      {message}
    </p>
    <button
      type="button"
      onClick={onRetry}
      className="flex h-8 items-center gap-2 rounded-[var(--radius-md)] border px-3 text-[13px] font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-raised)]"
      style={{ borderColor: "var(--border-base)" }}
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Retry
    </button>
  </div>
);

const StatPill = ({ icon, label, value, color }) => {
  const StatIcon = icon;

  return (
    <div
      className="flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2.5"
      style={{
        background: "var(--bg-raised)",
        borderColor: "var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2">
        <StatIcon className="h-4 w-4" style={{ color }} />
        <span className="text-[12px] text-[var(--text-secondary)]">
          {label}
        </span>
      </div>
      <span className="font-mono text-[13px] font-bold text-[var(--text-primary)]">
        {value}
      </span>
    </div>
  );
};

export default function Leaderboard() {
  const [metricMode, setMetricMode] = useState("solved");
  const metric = useMemo(() => getMetricConfig(metricMode), [metricMode]);
  const {
    entries,
    currentUser,
    hallOfFame,
    risingStars,
    hasMore,
    loading,
    loadingMore,
    refreshing,
    error,
    loadMore,
    refresh,
  } = useLeaderboardData(metricMode);

  const top3Users = useMemo(() => entries.slice(0, 3), [entries]);
  const restUsers = useMemo(() => entries.slice(3), [entries]);
  const podiumOrder = useMemo(
    () => [
      { ...PODIUM_CONFIG[0], user: top3Users[1] },
      { ...PODIUM_CONFIG[1], user: top3Users[0] },
      { ...PODIUM_CONFIG[2], user: top3Users[2] },
    ],
    [top3Users],
  );

  const currentUserRank = currentUser?.rank;
  const currentUserEntry = currentUser?.user;
  const hasEntries = entries.length > 0;

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-[#EAB308]" />
            <h1 className="text-[24px] font-medium tracking-normal text-[var(--text-primary)]">
              Leaderboard
            </h1>
          </div>
          <p className="mt-1 text-[14px] text-[var(--text-secondary)]">
            Compete on solved work, liquidity score, and active streaks.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Tabs.Root
            value={metricMode}
            onValueChange={setMetricMode}
            className="flex w-full rounded-[var(--radius-lg)] border p-1 sm:w-auto"
            style={{
              background: "var(--bg-raised)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <Tabs.List className="grid w-full grid-cols-3 gap-1 sm:flex">
              {METRIC_OPTIONS.map(({ id, label, icon, accent }) => {
                const selected = metricMode === id;
                const TabIcon = icon;

                return (
                  <Tabs.Trigger
                    key={id}
                    value={id}
                    className={`flex h-8 items-center justify-center gap-2 rounded-[var(--radius-md)] px-3 text-[13px] font-medium transition-all ${
                      selected
                        ? "text-[var(--text-primary)] shadow-[var(--shadow-sm)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                    style={selected ? { background: "var(--bg-surface)" } : {}}
                  >
                    <TabIcon
                      className="h-4 w-4"
                      style={{ color: selected ? accent : undefined }}
                    />
                    <span>{label}</span>
                  </Tabs.Trigger>
                );
              })}
            </Tabs.List>
          </Tabs.Root>

          <button
            type="button"
            onClick={refresh}
            disabled={loading || refreshing}
            aria-label="Refresh leaderboard"
            title="Refresh leaderboard"
            className="flex h-10 w-full items-center justify-center rounded-[var(--radius-md)] border text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] disabled:cursor-wait disabled:opacity-60 sm:w-10"
            style={{ borderColor: "var(--border-base)" }}
          >
            <RefreshCw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-12">
        <section
          className="relative flex min-h-[420px] items-end justify-center overflow-hidden rounded-[var(--radius-lg)] border lg:col-span-7 lg:min-h-[500px]"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          {loading ? (
            <PodiumSkeleton />
          ) : error && !hasEntries ? (
            <ErrorState message={error} onRetry={refresh} />
          ) : !hasEntries ? (
            <EmptyState
              title="No ranks yet"
              description="The first accepted submissions will appear here."
              icon={Trophy}
            />
          ) : (
            <AnimatePresence mode="popLayout">
              <MotionDiv
                key={metricMode}
                className="z-10 flex w-full items-end justify-center gap-2 px-3 sm:gap-4"
                initial="hidden"
                animate="show"
                exit="exit"
              >
                {podiumOrder.map(
                  ({ rank, user, title, color, height, icon, delay }) =>
                    user ? (
                      <PodiumSpot
                        key={`${metricMode}-${rank}-${getEntryId(user)}`}
                        rank={rank}
                        user={user}
                        title={title}
                        heightClass={height}
                        color={color}
                        icon={icon}
                        delay={delay}
                        metric={metric}
                      />
                    ) : null,
                )}
              </MotionDiv>
            </AnimatePresence>
          )}
        </section>

        <section
          className="relative flex min-h-[500px] flex-col overflow-hidden rounded-[var(--radius-lg)] border lg:col-span-5"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div
            className="flex shrink-0 items-center justify-between border-b px-4 py-3"
            style={{
              borderColor: "var(--border-subtle)",
              background: "var(--bg-raised)",
            }}
          >
            <span className="text-[12px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
              Rank & User
            </span>

            <div className="flex items-center gap-5">
              <span className="text-[12px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                Streak
              </span>
              <span className="w-12 text-right text-[12px] font-medium uppercase tracking-wide text-[var(--text-tertiary)]">
                {metric.valueLabel}
              </span>
            </div>
          </div>

          <div className="custom-scrollbar flex flex-1 flex-col gap-1 overflow-y-auto p-2 pb-24">
            {loading ? (
              <SkeletonRows count={7} />
            ) : error && !hasEntries ? (
              <ErrorState message={error} onRetry={refresh} />
            ) : restUsers.length > 0 ? (
              <AnimatePresence mode="popLayout">
                <MotionDiv
                  key={metricMode}
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                  className="flex flex-col gap-1"
                >
                  {restUsers.map((user, index) => (
                    <ListRow
                      key={`${metricMode}-${getEntryId(user)}`}
                      user={user}
                      rank={user.rank || index + 4}
                    />
                  ))}
                </MotionDiv>
              </AnimatePresence>
            ) : (
              <EmptyState
                title={hasEntries ? "Podium only" : "No ranks yet"}
                description={
                  hasEntries
                    ? "More ranked users will appear as the board grows."
                    : "Leaderboard rows will appear after users solve problems."
                }
                icon={Medal}
              />
            )}

            {hasMore && !loading && (
              <div
                className="pointer-events-none absolute bottom-16 left-0 right-0 z-20 flex h-24 items-end justify-center pb-2"
                style={{
                  background:
                    "linear-gradient(to top, var(--bg-surface), transparent)",
                }}
              >
                <MotionButton
                  layout
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="pointer-events-auto flex h-8 items-center gap-2 rounded-[var(--radius-md)] border px-4 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-raised)] disabled:cursor-wait disabled:opacity-60"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-base)",
                  }}
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading
                    </>
                  ) : (
                    <>
                      Load next ranks
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </MotionButton>
              </div>
            )}
          </div>

          {currentUserEntry && (
            <div
              className="absolute bottom-0 left-0 right-0 z-20 border-t p-3"
              style={{
                borderColor: "var(--border-subtle)",
                background: "var(--bg-surface)",
              }}
            >
              <ListRow
                user={currentUserEntry}
                rank={currentUserRank || "-"}
                isMe
              />
            </div>
          )}
        </section>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 ${
          risingStars.length > 0 ? "xl:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <section
          className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-5"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#FB923C]" />
            <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
              Streak Hall of Fame
            </h2>
          </div>

          {loading && hallOfFame.length === 0 ? (
            <SkeletonRows count={3} />
          ) : hallOfFame.length > 0 ? (
            <div className="flex flex-col gap-2">
              {hallOfFame.map((entry, index) => (
                <div
                  key={`${entry.username}-${index}`}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--bg-raised)",
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="w-4 text-[12px] font-bold text-[var(--text-tertiary)]">
                      {index + 1}
                    </span>
                    <span className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                      @{entry.username || "anonymous"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 text-[#FB923C]" />
                    <span className="font-mono text-[13px] font-bold text-[#FB923C]">
                      {formatMetricValue(entry.streak || 0)}
                    </span>
                    <span className="text-[12px] text-[var(--text-tertiary)]">
                      days
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[var(--text-tertiary)]">
              No streak history yet.
            </p>
          )}
        </section>

        <section
          className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-5"
          style={{
            background: "var(--bg-surface)",
            borderColor: "var(--border-subtle)",
          }}
        >
          <div className="flex items-center gap-2">
            <Gauge className="h-5 w-5" style={{ color: metric.accent }} />
            <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
              Your Snapshot
            </h2>
          </div>

          {currentUserEntry ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:grid-cols-1 xl:grid-cols-3">
              <StatPill
                icon={Trophy}
                label="Rank"
                value={`#${currentUserRank || "-"}`}
                color="#EAB308"
              />
              <StatPill
                icon={metric.icon}
                label={metric.heading}
                value={formatMetricValue(getEntryValue(currentUserEntry))}
                color={metric.accent}
              />
              <StatPill
                icon={Flame}
                label="Streak"
                value={formatMetricValue(currentUserEntry.currentStreak || 0)}
                color="#FB923C"
              />
            </div>
          ) : loading ? (
            <SkeletonRows count={3} />
          ) : (
            <p className="text-[13px] text-[var(--text-tertiary)]">
              Your rank will appear after the leaderboard loads.
            </p>
          )}
        </section>

        {risingStars.length > 0 && (
          <section
            className="flex flex-col gap-5 rounded-[var(--radius-lg)] border p-5"
            style={{
              background: "var(--bg-surface)",
              borderColor: "var(--border-subtle)",
            }}
          >
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-[#34D399]" />
              <h2 className="text-[15px] font-medium text-[var(--text-primary)]">
                Rising Stars
              </h2>
            </div>

            <div className="flex flex-col gap-2">
              {risingStars.map((entry) => (
                <div
                  key={entry.userId || entry.username}
                  className="flex items-center justify-between rounded-[var(--radius-lg)] border px-3 py-2.5"
                  style={{
                    borderColor: "var(--border-subtle)",
                    background: "var(--bg-raised)",
                  }}
                >
                  <span className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                    @{entry.username || "anonymous"}
                  </span>

                  <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[12px] font-bold text-[#34D399]">
                    +{formatMetricValue(entry.jump || 0)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

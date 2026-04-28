import React, { useState, useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import * as Tabs from '@radix-ui/react-tabs';
import { TrendingUp, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

// --- Custom Recharts Tooltip ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-[var(--radius-md)] p-3 text-[13px]" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-md)' }}>
        <p className="text-[var(--text-primary)] font-medium mb-2">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-[12px]">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-[var(--text-secondary)]">{entry.name}:</span>
            <span className="text-[var(--text-primary)] font-[var(--font-mono)]">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function MarketIntel() {
  const skills = useMarketStore((state) => state.skills);
  const [activeTab, setActiveTab] = useState('demand'); // 'demand' or 'roles'
  const [selectedSkillId, setSelectedSkillId] = useState(null);
  const [showAllSkills, setShowAllSkills] = useState(false);

  // 1. Sort skills to find the Top 5
  const topSkills = useMemo(() => {
    return [...skills]
      .sort((a, b) => {
        if (activeTab === 'demand') return b.demandPercentage - a.demandPercentage;
        return b.openRoles - a.openRoles;
      })
      .slice(0, 5);
  }, [skills, activeTab]);

  // 2. Format history data for Recharts
  const chartData = useMemo(() => {
    if (!topSkills.length || !topSkills[0].history) return [];

    const dates = topSkills[0].history.map(h => h.date);

    return dates.map((date, index) => {
      const dataPoint = { date };
      topSkills.forEach(skill => {
        const historyPoint = skill.history[index];
        if (historyPoint) {
          dataPoint[skill.skillName] = activeTab === 'demand'
            ? historyPoint.demandPercentage
            : historyPoint.openRoles;
        }
      });
      return dataPoint;
    });
  }, [topSkills, activeTab]);

  // Chart Colors — vibrant palette matching dashboard icons
  const colors = ['#2563EB', '#FBBF24', '#34D399', '#FB923C', '#F472B6'];

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8 h-full">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">
            Market Intel
          </h1>
          <p className="text-[var(--text-secondary)] text-[14px] mt-1">Real-time industry demand and role liquidity tracking</p>
        </div>

        {/* Tabs */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="rounded-[var(--radius-lg)] p-1 flex gap-1" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)' }}>
          <Tabs.List className="flex">
            <Tabs.Trigger
              value="demand"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${activeTab === 'demand' ? 'text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              style={activeTab === 'demand' ? { background: 'var(--bg-surface)' } : {}}
            >
              <TrendingUp className="w-4 h-4" />
              Demand trend
            </Tabs.Trigger>
            <Tabs.Trigger
              value="roles"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${activeTab === 'roles' ? 'text-[var(--text-primary)] shadow-[var(--shadow-sm)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              style={activeTab === 'roles' ? { background: 'var(--bg-surface)' } : {}}
            >
              <Users className="w-4 h-4" />
              Open roles
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">

        {/* Left Column: Rankings */}
        <div className="lg:col-span-5 flex flex-col relative h-[600px]">
          <h3 className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-4">Live market rankings</h3>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3 pb-16">
            {[...skills]
              .sort((a, b) => b.demandPercentage - a.demandPercentage)
              .slice(0, showAllSkills ? skills.length : 5)
              .map((skill, index) => {
                return (
                <div
                  key={skill._id}
                  onClick={() => setSelectedSkillId(skill._id === selectedSkillId ? null : skill._id)}
                  className="relative p-4 rounded-[var(--radius-lg)] border transition-all duration-200 cursor-pointer flex justify-between items-center"
                  style={{
                    background: selectedSkillId === skill._id ? 'var(--accent-bg)' : 'var(--bg-surface)',
                    borderColor: selectedSkillId === skill._id ? 'var(--accent)' : 'var(--border-subtle)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[16px] font-medium font-[var(--font-mono)] text-[var(--text-tertiary)] w-6">{index + 1}</span>
                    <span className="font-medium text-[var(--text-primary)] text-[15px]">{skill.skillName}</span>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div className="flex flex-col items-end">
                      <p className="text-[11px] text-[var(--text-tertiary)] tracking-[0.02em]">Demand</p>
                      <p className="text-[16px] font-[var(--font-mono)] font-medium text-[#34D399]">{skill.demandPercentage}%</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <p className="text-[11px] text-[var(--text-tertiary)] tracking-[0.02em]">Open roles</p>
                      <p className="text-[16px] font-[var(--font-mono)] font-medium text-[#FB923C]">{skill.openRoles.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )})}
          </div>

          {/* Show More */}
          {!showAllSkills && skills.length > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-24 flex items-end justify-center pb-2 z-20 pointer-events-none" style={{ background: 'linear-gradient(to top, var(--bg-canvas), transparent)' }}>
              <button
                onClick={() => setShowAllSkills(true)}
                className="pointer-events-auto px-4 h-8 rounded-[var(--radius-md)] border text-[var(--text-secondary)] text-[13px] font-medium hover:bg-[var(--bg-raised)] transition-colors"
                style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-base)' }}
              >
                Show more skills
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Chart */}
        <div className="lg:col-span-7 p-6 rounded-[var(--radius-lg)] border h-[600px] flex flex-col" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-[12px] font-medium text-[var(--text-tertiary)] tracking-[0.02em] mb-6">
            Top 5 skills — {activeTab === 'demand' ? 'Demand %' : 'Open positions'}
          </h3>

          <div className="flex-1 min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.8} vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-tertiary)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--border-base)', strokeWidth: 1 }} />
                  <Legend
                    wrapperStyle={{ paddingTop: '16px', color: 'var(--text-secondary)', fontSize: 12 }}
                    iconType="circle"
                    iconSize={8}
                  />

                  {topSkills.map((skill, index) => (
                    <Line
                      key={skill._id}
                      type="monotone"
                      dataKey={skill.skillName}
                      stroke={colors[index % colors.length]}
                      strokeWidth={selectedSkillId === skill._id ? 3 : 1.5}
                      dot={false}
                      activeDot={{ r: 4, fill: colors[index % colors.length], strokeWidth: 0 }}
                      strokeOpacity={selectedSkillId && selectedSkillId !== skill._id ? 0.3 : 1}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)] text-[14px]">
                Awaiting market history data...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

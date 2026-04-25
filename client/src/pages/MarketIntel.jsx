import React, { useState, useMemo } from 'react';
import { useMarketStore } from '../store/useMarketStore';
import * as Tabs from '@radix-ui/react-tabs';
import { TrendingUp, Users, Activity } from 'lucide-react';
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
      <div className="bg-black/80 border border-white/10 rounded-lg backdrop-blur-md p-3 shadow-xl">
        <p className="text-white font-medium mb-2">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-mono">{entry.value}</span>
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
  // Recharts expects an array of objects where each object represents a point in time (X-axis)
  // and has keys for each line (Y-axis values).
  const chartData = useMemo(() => {
    if (!topSkills.length || !topSkills[0].history) return [];

    // Assuming all skills have history points at similar dates.
    // We map over the history of the first skill to get the dates.
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

  // Chart Colors (Premium minimal palette)
  const colors = ['#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a78bfa'];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full flex flex-col">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-400" />
            Market Intel
          </h1>
          <p className="text-slate-400 text-sm mt-1">Real-time industry demand and role liquidity tracking</p>
        </div>

        {/* Radix Tabs for Context Switching */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="bg-white/[0.02] border border-white/5 p-1 rounded-xl flex gap-1">
          <Tabs.List className="flex">
            <Tabs.Trigger 
              value="demand" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'demand' ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <TrendingUp className="w-4 h-4" />
              Demand Trend
            </Tabs.Trigger>
            <Tabs.Trigger 
              value="roles" 
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'roles' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users className="w-4 h-4" />
              Open Roles
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* Left Column: Rankings Section */}
        <div className="lg:col-span-5 flex flex-col relative h-[600px]">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Live Market Rankings</h3>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 pb-16">
            {[...skills]
              .sort((a, b) => b.demandPercentage - a.demandPercentage)
              .slice(0, showAllSkills ? skills.length : 5)
              .map((skill, index) => {
                const isTop1 = index === 0;
                const isTop2 = index === 1;
                const isTop3 = index === 2;
                
                let badgeColors = "";
                let shineColor = "";

                if (isTop1) {
                  badgeColors = "bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]";
                  shineColor = "bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent";
                } else if (isTop2) {
                  badgeColors = "bg-gradient-to-b from-slate-200 via-slate-400 to-slate-600 text-black shadow-[0_0_15px_rgba(203,213,225,0.3)]";
                  shineColor = "bg-gradient-to-r from-transparent via-slate-300/20 to-transparent";
                } else if (isTop3) {
                  badgeColors = "bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 text-white shadow-[0_0_15px_rgba(180,83,9,0.3)]";
                  shineColor = "bg-gradient-to-r from-transparent via-amber-600/20 to-transparent";
                }

                return (
                <div 
                  key={skill._id}
                  onClick={() => setSelectedSkillId(skill._id === selectedSkillId ? null : skill._id)}
                  className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                    selectedSkillId === skill._id 
                      ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                  }`}
                >
                  {/* Top 3 Animated Aura & Shine Effect */}
                  {(isTop1 || isTop2 || isTop3) && (
                    <>
                      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl animate-pulse ${isTop1 ? 'bg-yellow-500/10' : isTop2 ? 'bg-slate-400/10' : 'bg-amber-700/10'} pointer-events-none`} />
                      <div className={`animate-shine-elite ${shineColor}`} />
                      
                      {/* Elite Ribbon Rank Badge */}
                      <div 
                        className={`absolute top-0 right-4 w-8 h-10 flex items-center justify-center font-bold text-sm z-10 ${badgeColors}`}
                        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%)' }}
                      >
                        {index + 1}
                      </div>
                    </>
                  )}

                  <div className="relative z-10 flex justify-between items-center mb-2">
                    <span className="font-semibold text-slate-200">{skill.skillName}</span>
                    {/* <span className={`text-xs px-2 py-1 rounded bg-white/5 border border-white/5 ${isTop1 || isTop2 || isTop3 ? 'mr-8' : ''} text-slate-400`}>
                      {skill.parentLanguage || 'Core'}
                    </span> */}
                  </div>
                  
                  <div className="relative z-10 flex justify-between items-end mt-4">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Demand</p>
                      <p className="text-lg font-mono text-emerald-400">{skill.demandPercentage}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest">Open Roles</p>
                      <p className="text-lg font-mono text-indigo-400">{skill.openRoles.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )})}
          </div>

          {/* Show More Overlay */}
          {!showAllSkills && skills.length > 5 && (
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0b0b0f] via-[#0b0b0f]/80 to-transparent flex items-end justify-center pb-2 z-20 pointer-events-none">
              <button 
                onClick={() => setShowAllSkills(true)} 
                className="pointer-events-auto px-6 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 text-sm font-medium hover:bg-white/10 hover:text-white transition-all shadow-lg backdrop-blur-md"
              >
                Show More Skills
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Main Chart Section */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm h-[600px] flex flex-col">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-6">
            Top 5 Skills - {activeTab === 'demand' ? 'Demand %' : 'Open Positions'}
          </h3>
          
          <div className="flex-1 min-h-0">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#475569" 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('default', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis 
                    stroke="#475569" 
                    tick={{ fill: '#64748b', fontSize: 12 }} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                  
                  {topSkills.map((skill, index) => (
                    <Line
                      key={skill._id}
                      type="monotone"
                      dataKey={skill.skillName}
                      stroke={colors[index % colors.length]}
                      strokeWidth={selectedSkillId === skill._id ? 4 : 2}
                      dot={{ r: 4, fill: colors[index % colors.length], strokeWidth: 0 }}
                      activeDot={{ r: 6, strokeWidth: 0 }}
                      strokeOpacity={selectedSkillId && selectedSkillId !== skill._id ? 0.3 : 1}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500">
                Awaiting market history data...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

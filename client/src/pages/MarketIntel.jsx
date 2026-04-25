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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
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

      {/* Main Chart Section */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm h-[400px]">
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-6">
          Top 5 Skills - {activeTab === 'demand' ? 'Demand %' : 'Open Positions'}
        </h3>
        
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

      {/* Rankings Section */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-widest mb-4">Live Market Rankings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-96 overflow-y-auto pr-2 custom-scrollbar">
          {skills
            .sort((a, b) => b.demandPercentage - a.demandPercentage)
            .map((skill) => (
            <div 
              key={skill._id}
              onClick={() => setSelectedSkillId(skill._id === selectedSkillId ? null : skill._id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedSkillId === skill._id 
                  ? 'bg-indigo-500/10 border-indigo-500/30' 
                  : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-slate-200">{skill.skillName}</span>
                <span className="text-xs px-2 py-1 rounded bg-white/5 text-slate-400 border border-white/5">
                  {skill.parentLanguage || 'Core'}
                </span>
              </div>
              
              <div className="flex justify-between items-end mt-4">
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
          ))}
        </div>
      </div>

    </div>
  );
}

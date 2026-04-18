// src/pages/admin/AdminDashboard.jsx
import React from 'react';
import { Users, Code, Activity, Server, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function AdminDashboard() {
  // Demo Data Array
  const metrics = [
    { title: "Total Platform Users", value: "1,248", change: "+12.5%", isPositive: true, icon: Users },
    { title: "Skill Verifications", value: "4,291", change: "+5.2%", isPositive: true, icon: Code },
    { title: "Liquidity Transfers", value: "314", change: "-2.1%", isPositive: false, icon: Activity },
    { title: "System Uptime", value: "99.9%", change: "Stable", isPositive: true, icon: Server },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Operations</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time overview of the Ascend skill verification engine.
          </p>
        </div>
        <div className="text-sm px-3 py-1.5 bg-indigo-50 text-indigo-700 font-medium rounded-md border border-indigo-100 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          System Operational
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((item, idx) => (
          <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                <item.icon className="w-5 h-5 text-slate-600" />
              </div>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 ${
                item.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}>
                {item.change}
                {item.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-slate-500">{item.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Recent Activity Table (takes up 2 columns) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-base font-semibold text-slate-800">Recent User Onboarding</h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View all</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">User</th>
                  <th className="px-6 py-3 font-medium">Target Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Sarah Connor', email: 'sarah@example.com', role: 'Frontend Engineer', status: 'Verifying', date: 'Just now' },
                  { name: 'John Doe', email: 'john@example.com', role: 'Fullstack Dev', status: 'Completed', date: '2h ago' },
                  { name: 'Alice Smith', email: 'alice@example.com', role: 'Backend Engineer', status: 'Scanning', date: '5h ago' },
                  { name: 'Bob Wilson', email: 'bob@example.com', role: 'DevOps', status: 'Completed', date: '1d ago' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{row.name}</p>
                      <p className="text-xs text-slate-500">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{row.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        row.status === 'Completed' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                        row.status === 'Verifying' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                        'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-right">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts Side Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
           <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-semibold text-slate-800">System Alerts</h3>
          </div>
          <div className="p-6 space-y-5">
            {[
              { title: "MongoDB Indexes optimized", time: "10 mins ago", type: "info" },
              { title: "High memory usage detected", time: "1 hour ago", type: "warning" },
              { title: "Github API rate limit near", time: "3 hours ago", type: "danger" },
            ].map((alert, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                  alert.type === 'danger' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' :
                  alert.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' :
                  'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]'
                }`} />
                <div>
                  <p className="text-sm font-medium text-slate-800 leading-none">{alert.title}</p>
                  <p className="text-xs text-slate-500 mt-1.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border-t border-slate-100 bg-slate-50/30">
            <button className="w-full py-2 text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors">
              View all alerts
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

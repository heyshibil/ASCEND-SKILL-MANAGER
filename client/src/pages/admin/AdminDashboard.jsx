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
    <div className="max-w-7xl mx-auto flex flex-col gap-8">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-[-0.01em]">System operations</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Real-time overview of the Ascend skill verification engine.
          </p>
        </div>
        <div className="text-[13px] px-3 py-1.5 rounded-[var(--radius-md)] font-medium flex items-center gap-2" style={{ background: 'var(--success-bg)', color: 'var(--success)' }}>
          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
          System operational
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((item, idx) => (
          <div key={idx} className="p-5 rounded-[var(--radius-lg)] border flex flex-col justify-between h-[120px] transition-colors hover:bg-[var(--bg-raised)]" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex justify-between items-start">
              <div className="w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center" style={{ background: 'var(--bg-raised)' }}>
                <item.icon className="w-4 h-4 text-[var(--text-tertiary)]" />
              </div>
              <span className={`text-[12px] font-medium px-2 py-0.5 rounded-[var(--radius-sm)] flex items-center gap-1`} style={{ background: item.isPositive ? 'var(--success-bg)' : 'var(--danger-bg)', color: item.isPositive ? 'var(--success)' : 'var(--danger)' }}>
                {item.change}
                {item.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              </span>
            </div>
            <div>
              <p className="text-[12px] font-medium text-[var(--text-tertiary)]">{item.title}</p>
              <h3 className="text-[24px] font-medium text-[var(--text-primary)] tracking-tight mt-0.5">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Demo Tables Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Recent Activity Table (takes up 2 columns) */}
        <div className="lg:col-span-2 rounded-[var(--radius-lg)] border overflow-hidden flex flex-col" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <div className="px-6 py-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
            <h3 className="text-[15px] font-medium text-[var(--text-primary)]">Recent user onboarding</h3>
            <button className="text-[13px] text-[var(--accent)] font-medium hover:underline">View all</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-[14px] text-left">
              <thead className="text-[var(--text-tertiary)] border-b text-[12px] font-medium" style={{ borderColor: 'var(--border-subtle)' }}>
                <tr>
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Target role</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                {[
                  { name: 'Sarah Connor', email: 'sarah@example.com', role: 'Frontend Engineer', status: 'Verifying', date: 'Just now' },
                  { name: 'John Doe', email: 'john@example.com', role: 'Fullstack Dev', status: 'Completed', date: '2h ago' },
                  { name: 'Alice Smith', email: 'alice@example.com', role: 'Backend Engineer', status: 'Scanning', date: '5h ago' },
                  { name: 'Bob Wilson', email: 'bob@example.com', role: 'DevOps', status: 'Completed', date: '1d ago' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-[var(--bg-raised)] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
                      <p className="text-[12px] text-[var(--text-tertiary)]">{row.email}</p>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-secondary)]">{row.role}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[12px] font-medium rounded-[var(--radius-sm)]`}
                        style={{
                          background: row.status === 'Completed' ? 'var(--accent-bg)' : row.status === 'Verifying' ? 'var(--warning-bg)' : 'var(--bg-raised)',
                          color: row.status === 'Completed' ? 'var(--accent)' : row.status === 'Verifying' ? 'var(--warning)' : 'var(--text-secondary)',
                        }}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[var(--text-tertiary)] text-right">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Alerts Side Panel */}
        <div className="rounded-[var(--radius-lg)] border flex flex-col" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
           <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-raised)' }}>
            <h3 className="text-[15px] font-medium text-[var(--text-primary)]">System alerts</h3>
          </div>
          <div className="p-6 flex flex-col gap-5 flex-1">
            {[
              { title: "MongoDB Indexes optimized", time: "10 mins ago", type: "info" },
              { title: "High memory usage detected", time: "1 hour ago", type: "warning" },
              { title: "Github API rate limit near", time: "3 hours ago", type: "danger" },
            ].map((alert, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0`} style={{ background: alert.type === 'danger' ? 'var(--danger)' : alert.type === 'warning' ? 'var(--warning)' : 'var(--accent)' }} />
                <div>
                  <p className="text-[14px] font-medium text-[var(--text-primary)] leading-none">{alert.title}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)] mt-1.5">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
            <button className="w-full py-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors">
              View all alerts
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

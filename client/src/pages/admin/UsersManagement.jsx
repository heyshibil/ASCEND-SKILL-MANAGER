import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  MoreVertical, 
  ShieldAlert, 
  ShieldCheck, 
  Mail, 
  Copy, 
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../services/adminServices';
import { toast } from "sonner";


export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [pagination.page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllUsers({ search, page: pagination.page });
      setUsers(data?.data?.users || []);
      setPagination(data?.data?.pagination ?? { page: 1, pages: 1 });
    } catch (error) {
      toast.error('Failed to load users');
      console.error(error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      setPagination(prev => ({ ...prev, page: 1 }));
      fetchUsers();
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const status = currentStatus || 'active';
    const newStatus = status === 'active' ? 'blocked' : 'active';
    try {
      await adminService.updateUserStatus(userId, newStatus);
      toast.success(`User ${newStatus === 'active' ? 'unblocked' : 'blocked'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Action failed');
    }
  };

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('ID copied to clipboard', { duration: 1000 });
  };

  const getOnlineStatus = (lastSeen) => {
    if (!lastSeen) return { label: 'Never', color: 'var(--text-tertiary)' };
    const now = new Date();
    const seen = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - seen) / (1000 * 60));

    if (diffInMinutes < 5) return { label: 'Online', color: 'var(--success)' };
    if (diffInMinutes < 60) return { label: `${diffInMinutes}m ago`, color: 'var(--text-tertiary)' };
    if (diffInMinutes < 1440) return { label: `${Math.floor(diffInMinutes / 60)}h ago`, color: 'var(--text-tertiary)' };
    return { label: seen.toLocaleDateString(), color: 'var(--text-tertiary)' };
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-medium text-[var(--text-primary)] tracking-tight">User management</h1>
          <p className="text-[14px] text-[var(--text-secondary)] mt-1">
            Monitor activity and manage account permissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-tertiary)]" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="pl-9 pr-4 h-10 w-[300px] bg-[var(--bg-surface)] border border-[var(--border-base)] rounded-[var(--radius-md)] text-[14px] focus:outline-none focus:border-[var(--accent)] transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>
          <button className="flex items-center gap-2 px-3 h-10 rounded-[var(--radius-md)] border border-[var(--border-base)] text-[var(--text-secondary)] text-[13px] font-medium hover:bg-[var(--bg-raised)] transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-raised)] border-b border-[var(--border-subtle)]">
                <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">User ID</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Online Status</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Account</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-6 h-20 bg-[var(--bg-surface)]">
                      <div className="flex gap-4">
                        <div className="w-10 h-10 bg-[var(--bg-raised)] rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-[var(--bg-raised)] rounded w-1/4"></div>
                          <div className="h-3 bg-[var(--bg-raised)] rounded w-1/3"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (users?.length || 0) === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center text-[var(--text-tertiary)]">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users?.map((user) => (
                  <tr key={user._id} className="hover:bg-[var(--bg-raised)] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.username} className="w-10 h-10 rounded-full border border-[var(--border-subtle)] object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--bg-raised)] flex items-center justify-center text-[14px] font-bold text-[var(--text-secondary)] border border-[var(--border-subtle)]">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-[14px] font-medium text-[var(--text-primary)]">{user.username}</p>
                          <p className="text-[12px] text-[var(--text-tertiary)] flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 group cursor-pointer" onClick={() => copyToClipboard(user._id)}>
                        <code className="text-[12px] text-[var(--text-secondary)] bg-[var(--bg-raised)] px-2 py-1 rounded-[var(--radius-sm)] border border-[var(--border-subtle)]">
                          {user._id.substring(0, 8)}...
                        </code>
                        <Copy className="w-3 h-3 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getOnlineStatus(user.lastSeen).label === 'Online' && (
                          <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse"></span>
                        )}
                        <span className="text-[13px]" style={{ color: getOnlineStatus(user.lastSeen).color }}>
                          {getOnlineStatus(user.lastSeen).label}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border`}
                        style={{ 
                          background: user.status === 'active' ? 'var(--success-bg)' : 'var(--danger-bg)',
                          color: user.status === 'active' ? 'var(--success)' : 'var(--danger)',
                          borderColor: user.status === 'active' ? 'var(--success)' : 'var(--danger)',
                          borderOpacity: 0.2
                        }}
                      >
                        {user.status === 'active' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                        {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => toggleUserStatus(user._id, user.status)}
                        className={`text-[13px] font-medium px-4 py-1.5 rounded-[var(--radius-md)] transition-all border ${
                          user.status === 'active' 
                            ? 'text-[var(--danger)] border-[var(--danger)] hover:bg-[var(--danger-bg)]' 
                            : 'text-[var(--success)] border-[var(--success)] hover:bg-[var(--success-bg)]'
                        }`}
                      >
                        {user.status === 'active' ? 'Block User' : 'Unblock User'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-4 bg-[var(--bg-raised)] border-t border-[var(--border-subtle)] flex items-center justify-between">
          <p className="text-[13px] text-[var(--text-tertiary)]">
            Showing <span className="font-medium text-[var(--text-secondary)]">{users?.length || 0}</span> users
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={pagination.page === 1 || loading}
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              className="p-1.5 rounded-[var(--radius-md)] border border-[var(--border-base)] disabled:opacity-50 hover:bg-[var(--bg-surface)] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[13px] font-medium px-3 text-[var(--text-secondary)]">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button 
              disabled={pagination.page === pagination.pages || loading}
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              className="p-1.5 rounded-[var(--radius-md)] border border-[var(--border-base)] disabled:opacity-50 hover:bg-[var(--bg-surface)] transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

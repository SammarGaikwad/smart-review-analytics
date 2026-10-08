import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { getUsersList, getRolesList, createNewUser, changeUserStatus, assignUserRole, removeUserRole, deleteUser } from '../api/users';
import { UserManagementUser, RoleItem } from '../types';
import { Users, UserPlus, Shield, CheckCircle2, XCircle, Trash2, Plus, X, AlertTriangle } from 'lucide-react';

export const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserManagementUser[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Create User Modal State
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('Analyst');
  const [modalError, setModalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Assign Role State
  const [assigningUserId, setAssigningUserId] = useState<string | null>(null);
  const [selectedRoleToAssign, setSelectedRoleToAssign] = useState<string>('BusinessUser');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, rolesData] = await Promise.all([
        getUsersList({ role: roleFilter }),
        getRolesList(),
      ]);
      setUsers(usersData.items || []);
      setRoles(rolesData || []);
    } catch (err: any) {
      console.error('Failed to load user management data:', err);
      setError(err.message || 'Failed to load user records from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [roleFilter]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setIsSubmitting(true);
    try {
      await createNewUser({
        email: newEmail,
        fullName: newFullName,
        password: newPassword,
        role: newRole,
      });
      setShowCreateModal(false);
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      loadData();
    } catch (err: any) {
      setModalError(err.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: UserManagementUser) => {
    try {
      await changeUserStatus(user.id, !user.isActive);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update user status');
    }
  };

  const handleAssignRole = async (userId: string) => {
    try {
      await assignUserRole(userId, selectedRoleToAssign);
      setAssigningUserId(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign role');
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string, roleName: string) => {
    if (!window.confirm(`Are you sure you want to revoke role '${roleName}' from this user?`)) return;
    try {
      await removeUserRole(userId, roleId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to remove role');
    }
  };

  const handleDeleteUser = async (user: UserManagementUser) => {
    if (!window.confirm(`Are you sure you want to delete account '${user.email}'? This action cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Analyst':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'BusinessUser':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Access Control (RBAC)"
        subtitle="Enterprise Systems Unit III - Role-based authorization, user identities, and policy administration."
      >
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Enterprise User</span>
        </button>
      </PageHeader>

      {/* Role Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-semibold text-slate-700">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Roles</option>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Showing {users.length} Database Accounts
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching user records from PostgreSQL database..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        /* Users Table */
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Name & Email</th>
                  <th className="px-4 py-3">Assigned Roles</th>
                  <th className="px-4 py-3">Account Status</th>
                  <th className="px-4 py-3">Registered At</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {u.userRoles?.map((ur) => (
                          <span
                            key={ur.id}
                            className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full border text-[10px] font-semibold ${getRoleBadgeStyle(
                              ur.roleName
                            )}`}
                          >
                            <span>{ur.roleName}</span>
                            {u.userRoles && u.userRoles.length > 1 && (
                              <button
                                onClick={() => handleRemoveRole(u.id, ur.roleId, ur.roleName)}
                                className="hover:text-rose-600 ml-1"
                                title="Revoke role"
                              >
                                &times;
                              </button>
                            )}
                          </span>
                        ))}
                        <button
                          onClick={() => setAssigningUserId(u.id)}
                          className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold"
                          title="Assign new role"
                        >
                          + Role
                        </button>
                      </div>

                      {/* Role Assignment Selector Inline */}
                      {assigningUserId === u.id && (
                        <div className="mt-2 flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                          <select
                            value={selectedRoleToAssign}
                            onChange={(e) => setSelectedRoleToAssign(e.target.value)}
                            className="text-xs bg-white border border-slate-300 rounded px-2 py-1"
                          >
                            {roles.map((r) => (
                              <option key={r.id} value={r.name}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignRole(u.id)}
                            className="px-2 py-1 bg-indigo-600 text-white rounded text-[11px] font-bold"
                          >
                            Assign
                          </button>
                          <button
                            onClick={() => setAssigningUserId(null)}
                            className="text-slate-400 hover:text-slate-600 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {u.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-2">
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                        title="Delete User Account"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>Create Enterprise User</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600">
                {modalError}
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="user@analytics.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Role</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name} — {r.description || ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

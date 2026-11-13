import React, { useState, useEffect, useCallback } from 'react';
import {
  Pencil,
  Trash2,
  RefreshCw,
  X,
  Check,
  Shield,
  Users,
} from 'lucide-react';
import {
  API_BASE_URL,
  fetchAdminUsersApi,
  updateAdminUserApi,
  deleteAdminUserApi,
} from '../services/api';
import { ensureAdminAuthToken } from '../utils/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    password: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();
      const result = await fetchAdminUsersApi();
      setUsers(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error('AdminUsers fetch error:', error);
      setErrorMessage(
        error.message ||
          `Gagal terhubung ke server API (${API_BASE_URL}/admin/users).`
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      password: '',
    });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        ...(formData.password ? { password: formData.password } : {}),
      };

      const result = await updateAdminUserApi(editingUser.id, payload);

      setUsers((prev) =>
        prev.map((u) => (u.id === editingUser.id ? result.data : u))
      );
      setEditingUser(null);
    } catch (error) {
      console.error('AdminUsers update error:', error);
      setErrorMessage(error.message || 'Gagal memperbarui pengguna.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    setErrorMessage('');

    try {
      await ensureAdminAuthToken();
      await deleteAdminUserApi(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      console.error('AdminUsers delete error:', error);
      setErrorMessage(error.message || 'Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="space-y-6 pb-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600 block">
            Access Control & Community
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2.5 mt-1">
            <Users className="w-6 h-6 text-red-600" />
            <span>Customers & Users ({users.length})</span>
          </h1>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          className="px-4 py-2.5 rounded-2xl bg-white hover:bg-red-50 text-gray-700 hover:text-red-600 shadow-sm text-xs font-bold flex items-center gap-2 transition-all"
        >
          <RefreshCw
            className={`w-4 h-4 text-red-600 ${isLoading ? 'animate-spin' : ''}`}
          />
          <span>Refresh Users</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-sm font-medium flex items-center justify-between shadow-sm">
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage('')}
            className="text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {editingUser && (
        <form
          onSubmit={handleUpdateUser}
          className="bg-white rounded-2xl p-6 space-y-5 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-600" />
              <span>Edit User Profile & Role (#{editingUser.id})</span>
            </h2>
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                System Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1.5">
                New Password (Optional)
              </label>
              <input
                type="password"
                placeholder="Keep current"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: e.target.value,
                  }))
                }
                className="w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-gray-200 focus:border-red-500 focus:bg-white text-sm text-gray-900 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditingUser(null)}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm shadow-red-600/20 flex items-center gap-2 transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Update User'}</span>
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-slate-700 uppercase text-xs font-semibold tracking-wider">
                <th className="py-4 px-6">ID</th>
                <th className="py-4 px-6">Full Name</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Orders</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    Loading users from database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr className="bg-white">
                  <td
                    colSpan={6}
                    className="py-12 px-6 text-center bg-white text-gray-500 text-sm"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="bg-white border-b border-gray-100 hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      #{u.id}
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                      {u.name}
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500">
                      {u.email}
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          u.role === 'admin'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-gray-600'
                        }`}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-500 font-medium">
                      {u.orders_count ?? 0} orders
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-gray-700 hover:text-red-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u.id)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

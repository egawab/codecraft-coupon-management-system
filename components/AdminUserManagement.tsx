import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { UserCircleIcon, TrashIcon, ShieldCheckIcon, BuildingStorefrontIcon, CurrencyDollarIcon, UserIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'shop_owner' | 'affiliate' | 'customer' | 'admin';
  createdAt: any;
  phoneNumber?: string;
  shopName?: string;
  referralCode?: string;
  totalEarnings?: number;
  isActive: boolean;
}

interface Coupon {
  id: string;
  title: string;
  shopOwnerId: string;
  shopOwnerName: string;
  createdAt: any;
  status: string;
}

export const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'user' | 'coupon'; id: string; name: string } | null>(null);

  // Load all users
  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load all coupons
  const loadCoupons = async () => {
    try {
      const couponsSnapshot = await getDocs(collection(db, 'coupons'));
      const couponsData = couponsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Coupon[];
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error loading coupons:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadUsers(), loadCoupons()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Filter users based on search and role
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.shopName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get user's coupons
  const getUserCoupons = (userId: string) => {
    return coupons.filter(coupon => coupon.shopOwnerId === userId);
  };

  // Delete user account
  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user document
      await deleteDoc(doc(db, 'users', userId));
      
      // Delete all user's coupons
      const userCoupons = getUserCoupons(userId);
      await Promise.all(
        userCoupons.map(coupon => deleteDoc(doc(db, 'coupons', coupon.id)))
      );

      // Reload data
      await loadUsers();
      await loadCoupons();
      setSelectedUser(null);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      alert('User and all associated data deleted successfully');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  // Delete coupon
  const handleDeleteCoupon = async (couponId: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', couponId));
      await loadCoupons();
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
      alert('Coupon deleted successfully');
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error deleting coupon');
    }
  };

  // Toggle user active status
  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus
      });
      await loadUsers();
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'shop_owner':
        return <BuildingStorefrontIcon className="h-5 w-5" />;
      case 'affiliate':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'admin':
        return <ShieldCheckIcon className="h-5 w-5" />;
      default:
        return <UserIcon className="h-5 w-5" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'shop_owner':
        return 'bg-blue-100 text-blue-800';
      case 'affiliate':
        return 'bg-green-100 text-green-800';
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
        <span className="ml-3 text-gray-600">Loading user data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all registered users, their accounts, and coupons</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{users.length}</p>
            </div>
            <UserCircleIcon className="h-12 w-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Shop Owners</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">
                {users.filter(u => u.role === 'shop_owner').length}
              </p>
            </div>
            <BuildingStorefrontIcon className="h-12 w-12 text-blue-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Affiliates</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {users.filter(u => u.role === 'affiliate').length}
              </p>
            </div>
            <CurrencyDollarIcon className="h-12 w-12 text-green-400" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Customers</p>
              <p className="text-3xl font-bold text-purple-600 mt-1">
                {users.filter(u => u.role === 'customer').length}
              </p>
            </div>
            <UserIcon className="h-12 w-12 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email, name, or shop..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <FunnelIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="shop_owner">Shop Owners</option>
              <option value="affiliate">Affiliates</option>
              <option value="customer">Customers</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid/List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">
              Users ({filteredUsers.length})
            </h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {filteredUsers.map(user => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 truncate">
                          {user.displayName || 'No Name'}
                        </p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                          {user.role.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                      {user.shopName && (
                        <p className="text-sm text-gray-500 mt-1">🏪 {user.shopName}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                        {user.role === 'shop_owner' && (
                          <span className="text-xs text-gray-500">
                            {getUserCoupons(user.id).length} coupons
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No users found matching your criteria
              </div>
            )}
          </div>
        </div>

        {/* User Details Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {selectedUser ? (
            <div>
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedUser.displayName || 'No Name'}</h2>
                    <p className="text-gray-600 mt-1">{selectedUser.email}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                    {selectedUser.role.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* User Details */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">User ID</label>
                    <p className="text-gray-900 font-mono text-sm mt-1">{selectedUser.id}</p>
                  </div>

                  {selectedUser.phoneNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone Number</label>
                      <p className="text-gray-900 mt-1">{selectedUser.phoneNumber}</p>
                    </div>
                  )}

                  {selectedUser.shopName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Shop Name</label>
                      <p className="text-gray-900 mt-1">{selectedUser.shopName}</p>
                    </div>
                  )}

                  {selectedUser.referralCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Referral Code</label>
                      <p className="text-gray-900 font-mono mt-1">{selectedUser.referralCode}</p>
                    </div>
                  )}

                  {selectedUser.totalEarnings !== undefined && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Total Earnings</label>
                      <p className="text-gray-900 font-semibold mt-1">${selectedUser.totalEarnings.toFixed(2)}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-500">Account Status</label>
                    <p className={`mt-1 font-semibold ${
                      selectedUser.isActive !== false ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-gray-900 mt-1">
                      {selectedUser.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </p>
                  </div>
                </div>

                {/* User's Coupons */}
                {selectedUser.role === 'shop_owner' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      User's Coupons ({getUserCoupons(selectedUser.id).length})
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {getUserCoupons(selectedUser.id).map(coupon => (
                        <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{coupon.title}</p>
                            <p className="text-sm text-gray-500">Status: {coupon.status}</p>
                          </div>
                          <button
                            onClick={() => {
                              setDeleteTarget({ type: 'coupon', id: coupon.id, name: coupon.title });
                              setShowDeleteConfirm(true);
                            }}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                      {getUserCoupons(selectedUser.id).length === 0 && (
                        <p className="text-gray-500 text-center py-4">No coupons yet</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => handleToggleUserStatus(selectedUser.id, selectedUser.isActive !== false)}
                    className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedUser.isActive !== false
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-green-100 text-green-800 hover:bg-green-200'
                    }`}
                  >
                    {selectedUser.isActive !== false ? 'Deactivate Account' : 'Activate Account'}
                  </button>

                  <button
                    onClick={() => {
                      setDeleteTarget({ type: 'user', id: selectedUser.id, name: selectedUser.displayName || selectedUser.email });
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <TrashIcon className="h-5 w-5" />
                    Delete User & All Data
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <UserCircleIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Select a user to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Confirm {deleteTarget.type === 'user' ? 'User' : 'Coupon'} Deletion
              </h3>
              <p className="text-gray-600">
                Are you sure you want to delete <span className="font-semibold">{deleteTarget.name}</span>?
                {deleteTarget.type === 'user' && (
                  <span className="block mt-2 text-red-600 font-semibold">
                    This will delete the user account and ALL associated coupons permanently!
                  </span>
                )}
                <span className="block mt-2 text-sm">This action cannot be undone.</span>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteTarget(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteTarget.type === 'user') {
                    handleDeleteUser(deleteTarget.id);
                  } else {
                    handleDeleteCoupon(deleteTarget.id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

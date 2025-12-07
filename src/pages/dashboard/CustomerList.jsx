// frontend/src/pages/dashboard/CustomerList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  Search, 
  Mail, 
  Phone, 
  ShoppingBag,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react';
import API_URL from '../../utils/api';

const CustomerList = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'user', 'guest'

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    filterCustomers();
  }, [searchTerm, filter, customers]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Fetch all orders
      const ordersRes = await fetch(`${API_URL}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const ordersData = await ordersRes.json();
      const orders = ordersData.orders || [];

      // Extract unique customers
      const customerMap = new Map();

      orders.forEach(order => {
        let customerId, customerData;

        if (order.orderType === 'user' && order.userId) {
          // Registered user
          customerId = order.userId._id || order.userId;
          
          if (!customerMap.has(customerId)) {
            customerData = {
              id: customerId,
              type: 'user',
              name: order.userId.name || order.shippingAddress?.fullName || 'N/A',
              email: order.userId.email || order.shippingAddress?.email || 'N/A',
              phone: order.userId.phone || order.shippingAddress?.phone || 'N/A',
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt
            };
          } else {
            customerData = customerMap.get(customerId);
          }
        } else if (order.orderType === 'guest' && order.guestInfo) {
          // Guest user (use phone as unique ID)
          customerId = `guest-${order.guestInfo.phone}`;
          
          if (!customerMap.has(customerId)) {
            customerData = {
              id: customerId,
              type: 'guest',
              name: order.guestInfo.name || order.shippingAddress?.fullName || 'Guest',
              email: order.guestInfo.email || order.shippingAddress?.email || 'N/A',
              phone: order.guestInfo.phone || order.shippingAddress?.phone || 'N/A',
              totalOrders: 0,
              totalSpent: 0,
              lastOrderDate: order.createdAt
            };
          } else {
            customerData = customerMap.get(customerId);
          }
        }

        if (customerData) {
          customerData.totalOrders++;
          if (order.status === 'delivered') {
            customerData.totalSpent += order.totalAmount || 0;
          }
          
          // Update last order date if this order is more recent
          if (new Date(order.createdAt) > new Date(customerData.lastOrderDate)) {
            customerData.lastOrderDate = order.createdAt;
          }

          customerMap.set(customerId, customerData);
        }
      });

      // Convert map to array and sort by total spent
      const customersArray = Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);

      setCustomers(customersArray);
      setFilteredCustomers(customersArray);

    } catch (error) {
      console.error('❌ Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCustomers = () => {
    let filtered = customers;

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(c => c.type === filter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm)
      );
    }

    setFilteredCustomers(filtered);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Danh sách khách hàng</h1>
            <p className="text-gray-600 mt-1">
              Tổng {customers.length} khách hàng ({customers.filter(c => c.type === 'user').length} user, {customers.filter(c => c.type === 'guest').length} guest)
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Tổng khách hàng</p>
              <p className="text-3xl font-bold mt-1">{customers.length}</p>
            </div>
            <Users size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">User đã đăng ký</p>
              <p className="text-3xl font-bold mt-1">{customers.filter(c => c.type === 'user').length}</p>
            </div>
            <UserCheck size={40} className="opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Guest</p>
              <p className="text-3xl font-bold mt-1">{customers.filter(c => c.type === 'guest').length}</p>
            </div>
            <UserX size={40} className="opacity-80" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, email, số điện thoại..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-rose-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả ({customers.length})
            </button>
            <button
              onClick={() => setFilter('user')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'user'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              User ({customers.filter(c => c.type === 'user').length})
            </button>
            <button
              onClick={() => setFilter('guest')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'guest'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Guest ({customers.filter(c => c.type === 'guest').length})
            </button>
          </div>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Không tìm thấy khách hàng nào' : 'Chưa có khách hàng'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khách hàng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng chi tiêu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đơn gần nhất
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          customer.type === 'user' ? 'bg-green-100' : 'bg-purple-100'
                        }`}>
                          {customer.type === 'user' ? (
                            <UserCheck size={20} className="text-green-600" />
                          ) : (
                            <UserX size={20} className="text-purple-600" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {customer.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        customer.type === 'user' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {customer.type === 'user' ? 'User' : 'Guest'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 flex items-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        {customer.phone}
                      </div>
                      {customer.email !== 'N/A' && (
                        <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                          <Mail size={14} className="text-gray-400" />
                          {customer.email}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={16} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-900">
                          {customer.totalOrders}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar size={14} className="text-gray-400" />
                        {formatDate(customer.lastOrderDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerList;
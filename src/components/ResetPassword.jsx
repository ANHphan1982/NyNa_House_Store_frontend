// frontend/src/components/ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, ArrowLeft, AlertCircle, CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import API_URL from '../utils/api';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu đặt lại mật khẩu mới.');
    }
  }, [token]);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    if (!/[!@#$%^&*]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validation
    if (!token) {
      setError('Token không hợp lệ');
      return;
    }

    if (!formData.newPassword) {
      setError('Vui lòng nhập mật khẩu mới');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    console.log('🔑 Password reset attempt');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          newPassword: formData.newPassword
        })
      });

      const data = await response.json();
      console.log('📦 Response:', data);

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({ newPassword: '', confirmPassword: '' });
        console.log('✅ Password reset successful');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Reset password error:', error);
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return null;
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 2) return { level: 'Yếu', color: 'bg-red-500', width: '33%' };
    if (strength <= 4) return { level: 'Trung bình', color: 'bg-yellow-500', width: '66%' };
    return { level: 'Mạnh', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Back to Login */}
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </Link>

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-rose-100 rounded-full mb-4">
            <Lock className="text-rose-600" size={32} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đặt lại mật khẩu
          </h2>
          <p className="text-sm text-gray-600">
            Nhập mật khẩu mới cho tài khoản của bạn
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-green-800">Đặt lại mật khẩu thành công!</p>
                <p className="text-sm text-green-600 mt-1">
                  Đang chuyển hướng đến trang đăng nhập...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading || !token}
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Password Strength Indicator */}
            {formData.newPassword && passwordStrength && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.level === 'Mạnh' ? 'text-green-600' :
                    passwordStrength.level === 'Trung bình' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.level}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: passwordStrength.width }}
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading || !token}
                maxLength={128}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">Yêu cầu mật khẩu:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li className="flex items-center gap-2">
                <span className={formData.newPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}>
                  {formData.newPassword.length >= 8 ? '✓' : '○'}
                </span>
                Ít nhất 8 ký tự
              </li>
              <li className="flex items-center gap-2">
                <span className={/[A-Z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                  {/[A-Z]/.test(formData.newPassword) ? '✓' : '○'}
                </span>
                Ít nhất 1 chữ hoa
              </li>
              <li className="flex items-center gap-2">
                <span className={/[a-z]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                  {/[a-z]/.test(formData.newPassword) ? '✓' : '○'}
                </span>
                Ít nhất 1 chữ thường
              </li>
              <li className="flex items-center gap-2">
                <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                  {/[0-9]/.test(formData.newPassword) ? '✓' : '○'}
                </span>
                Ít nhất 1 số
              </li>
              <li className="flex items-center gap-2">
                <span className={/[!@#$%^&*]/.test(formData.newPassword) ? 'text-green-600' : 'text-gray-400'}>
                  {/[!@#$%^&*]/.test(formData.newPassword) ? '✓' : '○'}
                </span>
                Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
              </li>
            </ul>
          </div>

          <button
            type="submit"
            disabled={loading || !token || success}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang xử lý...
              </>
            ) : success ? (
              'Thành công!'
            ) : (
              <>
                <Lock size={20} />
                Đặt lại mật khẩu
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
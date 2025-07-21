import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { 
  FiHome, 
  FiPlus, 
  FiEdit, 
  FiClock, 
  FiTrophy, 
  FiAward,
  FiUser,
  FiChevronDown,
  FiMenu,
  FiX
} from "react-icons/fi";
import { getCurrentUser, isAuthenticated, signoutUser } from "../../services/authService";

const ManagerLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const currentUser = getCurrentUser();
        // ตรวจสอบว่าเป็น manager หรือ admin
        if (currentUser && (currentUser.role === 'manager' || currentUser.role === 'admin')) {
          setUser(currentUser);
        } else {
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signoutUser();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      icon: FiHome,
      label: "แดชบอร์ด",
      path: "/manager/dashboard"
    },
    {
      icon: FiPlus,
      label: "จัดการกิจกรรม",
      path: "/manager/create-activity"
    },
    {
      icon: FiEdit,
      label: "แก้ไขข้อมูลกิจกรรม",
      path: "/manager/edit-activity"
    },
    {
      icon: FiClock,
      label: "ประวัติจัดกิจกรรม",
      path: "/manager/activity-history"
    },
    {
      icon: FiTrophy,
      label: "การแข่งขัน",
      path: "/manager/competitions"
    },
    {
      icon: FiAward,
      label: "ผลคะแนน",
      path: "/manager/results"
    }
  ];

  const Sidebar = ({ className = "" }) => (
    <div className={`bg-purple-800 text-white min-h-screen w-64 fixed left-0 top-0 z-40 transform transition-transform duration-300 ease-in-out ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-purple-700">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">ผู้จัดการประกวด</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-purple-300"
          >
            <FiX size={24} />
          </button>
        </div>
        <p className="text-purple-300 text-sm mt-1">BettaFish Manager</p>
      </div>

      {/* Menu Items */}
      <nav className="mt-6">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={index}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-6 py-3 text-white hover:bg-purple-700 transition-colors ${
                isActive ? 'bg-purple-700 border-r-4 border-purple-300' : ''
              }`}
            >
              <Icon size={20} className="mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <Sidebar className="hidden lg:block" />

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <Sidebar />
        </div>
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-600 hover:text-gray-900"
            >
              <FiMenu size={24} />
            </button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h2 className="text-xl font-semibold text-gray-800">
                {menuItems.find(item => item.path === location.pathname)?.label || 'แดชบอร์ด'}
              </h2>
            </div>

            {/* User Dropdown */}
            <div className="relative">
              {user ? (
                <div>
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-3 text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                      <FiUser className="text-white" size={16} />
                    </div>
                    <span className="hidden md:block font-medium">
                      {user.email}
                    </span>
                    <FiChevronDown size={16} className="hidden md:block" />
                  </button>

                  {/* Dropdown Menu */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link
                        to="/manager/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiUser className="mr-2" size={16} />
                        แก้ไขข้อมูลส่วนตัว
                      </Link>
                      <Link
                        to="/manager/change-password"
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FiEdit className="mr-2" size={16} />
                        แก้ไขรหัสผ่าน
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FiX className="mr-2" size={16} />
                        ออกจากระบบ
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-purple-600 hover:text-purple-800 font-medium"
                >
                  เข้าสู่ระบบ
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Click outside to close dropdown */}
      {showUserDropdown && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowUserDropdown(false)}
        />
      )}
    </div>
  );
};

export default ManagerLayout;
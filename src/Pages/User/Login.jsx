// D:\ProJectFinal\Lasts\my-project\src\Pages\User\Login.jsx (ไม่มีการเปลี่ยนแปลงจากที่คุณให้มา)

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ตัวนี้คือ AuthContext.js ที่แก้ไปแล้ว

const Login = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!formData.email || !formData.password) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    setLoading(true);
    try {
      // ตรงนี้ Login.jsx คาดหวัง { profile } กลับมา ซึ่ง AuthContext ที่แก้ไปแล้วจะส่งให้
      const { profile } = await signin(formData.email, formData.password); 
      
      toast.success("เข้าสู่ระบบสำเร็จ!");

      const roleRedirects = {
        admin: '/admin/dashboard',
        manager: '/manager/dashboard',
        expert: '/expert/dashboard',
        user: '/',
      };

      // ตรงนี้ `profile` จะมี `role` จาก Backend แล้ว
      const redirectTo = roleRedirects[profile?.role] || '/';

      navigate(redirectTo, { replace: true });
      
    } catch (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-red-200 p-4">
      <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="hidden md:block md:w-1/2 bg-purple-50 p-6 flex items-center justify-center">
            <h2 className="text-xl text-purple-600 font-semibold">
              ยินดีต้อนรับสู่ BettaFish
            </h2>
        </div>
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold text-center mb-4 text-purple-700">
            เข้าสู่ระบบ
          </h2>
          {message && <div className={`mb-4 text-center text-red-500`}>{message}</div>}
          <form onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 font-medium text-gray-700">อีเมล</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="กรอกอีเมลของคุณ" required />
              </div>
              <div className="mt-4">
                <label className="block mb-2 font-medium text-gray-700">รหัสผ่าน</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="กรอกรหัสผ่านของคุณ" required />
              </div>
              <button type="submit" className="mt-6 w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition" disabled={loading}>
                {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
              </button>
          </form>
          <div className="mt-4 flex justify-between items-center text-sm">
              <Link to="/forgot-password" className="text-purple-500 hover:underline">ลืมรหัสผ่าน?</Link>
              <Link to="/signup" className="text-purple-500 hover:underline">สมัครสมาชิก</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
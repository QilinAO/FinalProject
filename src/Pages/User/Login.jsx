// D:\ProJectFinal\Lasts\my-project\src\Pages\User\Login.jsx (ไม่มีการเปลี่ยนแปลงจากที่คุณให้มา)

import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext"; // ตัวนี้คือ AuthContext.js ที่แก้ไปแล้ว

const Login = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!formData.identifier || !formData.password) {
      setMessage("กรุณากรอกข้อมูลให้ครบถ้วน!");
      return;
    }

    setLoading(true);
    try {
      const { profile } = await signin(formData.identifier, formData.password); 
      toast.success("เข้าสู่ระบบสำเร็จ!");
      const roleRedirects = { admin: '/admin/dashboard', manager: '/manager/dashboard', expert: '/expert/dashboard', user: '/', };
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
    <main className="page-container">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              🔐 เข้าสู่ระบบ
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
              ยินดีต้อนรับกลับสู่ BettaFish Platform
            </p>
          </div>
        </div>
      </section>

      <div className="page-main">
        <section className="page-section">
          <div className="container-responsive">
            <div className="content-card max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4 text-purple-700">
            เข้าสู่ระบบ
          </h2>
          {message && <div className={`mb-4 text-center text-red-500`}>{message}</div>}
          <form onSubmit={handleSubmit}>
              <div>
                <label className="block mb-2 font-medium text-gray-700">อีเมลหรือชื่อผู้ใช้</label>
                <input type="text" name="identifier" value={formData.identifier} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="กรอกอีเมลหรือชื่อผู้ใช้" required />
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
        </section>
      </div>
    </main>
  );
};

export default Login;
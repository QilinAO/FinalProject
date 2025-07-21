// my-project/src/Pages/User/SignUp.jsx (ฉบับแก้ไขสมบูรณ์)

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signupUser } from "../../services/authService"; // เรียกใช้ service ที่ถูกต้อง
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    // [สำคัญ] กลับมาใช้ camelCase ให้ตรงกับ Backend Service ที่ให้มา
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const updatedFormData = { ...prevData, [name]: value };
      if (name === "password" || name === "confirmPassword") {
        if (updatedFormData.password === updatedFormData.confirmPassword) {
          setPasswordError("");
        } else {
          setPasswordError("รหัสผ่านไม่ตรงกัน");
        }
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (formData.password !== formData.confirmPassword) {
      setPasswordError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    setLoading(true);
    try {
      // [แก้ไข] ส่งข้อมูลที่จำเป็นไปยัง service ใหม่
      const { confirmPassword, ...signupData } = formData;
      await signupUser(signupData);

      setMessage("สมัครสมาชิกสำเร็จ กรุณาตรวจสอบอีเมลเพื่อยืนยันและเข้าสู่ระบบ");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-red-200 p-4">
      <div className="w-full max-w-lg bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">สร้างบัญชี</h2>
        {message && <div className={`mb-4 text-center ${message.includes("สำเร็จ") ? "text-green-500" : "text-red-500"}`}>{message}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* [สำคัญ] แก้ name ของ input ให้เป็น camelCase */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">ชื่อ</label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">นามสกุล</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" required />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">ชื่อผู้ใช้</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700">อีเมล</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">รหัสผ่าน</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={() => setShowPassword((p) => !p)}>{showPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className={`w-full p-3 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 border ${passwordError ? "border-red-500" : "border-gray-300"}`} required />
                <button type="button" className="absolute right-3 top-3 text-gray-500 hover:text-gray-700" onClick={() => setShowConfirmPassword((p) => !p)}>{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition" disabled={loading}>{loading ? "กำลังสมัคร..." : "สมัครสมาชิก"}</button>
        </form>
        <div className="text-center mt-6">
          <p>มีบัญชีแล้ว? <Link to="/login" className="text-purple-600 hover:underline">เข้าสู่ระบบ</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
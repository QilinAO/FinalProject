import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("กรุณากรอกอีเมลของคุณ!");
      return;
    }
    // สมมติว่ามีการส่งคำขอรีเซ็ตรหัสผ่าน
    setTimeout(() => {
      setMessage("ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว!");
    }, 1000); // จำลองการทำงานของ API
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-red-200 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">
          รีเซ็ตรหัสผ่านของคุณ
        </h2>
        {message && (
          <div
            className={`mb-4 text-center ${
              message.includes("ลิงก์") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-medium text-gray-700">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="กรอกอีเมลของคุณ"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition"
          >
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          หรือ{" "}
          <a
            href="/login"
            className="text-purple-500 hover:underline font-medium"
          >
            กลับไปที่หน้าล็อกอิน
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

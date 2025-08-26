import React, { useState } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      setMessage("กรุณากรอกอีเมลของคุณ!");
      return;
    }
    setLoading(true);
    // สมมติว่ามีการส่งคำขอรีเซ็ตรหัสผ่าน
    setTimeout(() => {
      setMessage("ลิงก์สำหรับรีเซ็ตรหัสผ่านถูกส่งไปยังอีเมลของคุณแล้ว!");
      setLoading(false);
    }, 1000); // จำลองการทำงานของ API
  };

  const success = message.includes("ลิงก์");

  return (
    <main className="page-container">
      <section className="page-hero">
        <div className="page-hero-content">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-8">
              🔑 รีเซ็ตรหัสผ่าน
            </h1>
            <p className="text-2xl md:text-3xl text-white/95 font-medium leading-relaxed">
              กู้คืนการเข้าถึงบัญชีของคุณ
            </p>
          </div>
        </div>
      </section>

      <div className="page-main">
        <section className="page-section">
          <div className="container-responsive">
            <div className="content-card max-w-2xl mx-auto">

            {message && (
              <div
                className={[
                  "mb-4 rounded-lg border px-4 py-3 text-sm",
                  success
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-red-200 bg-red-50 text-red-700",
                ].join(" ")}
              >
                {message}
              </div>
            )}

            {/* ฟอร์มแบบ responsive:
                - มือถือ: ซ้อนแนวตั้ง
                - ≥ md: แบ่งเป็น 3 คอลัมน์ (ช่องอีเมล 2 คอลัมน์ + ปุ่ม 1 คอลัมน์) */}
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 items-end gap-3 sm:gap-4"
            >
              <div className="md:col-span-2">
                <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                  อีเมล
                </label>
                <input
                  id="email"
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
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน"}
              </button>
            </form>

            <p className="mt-6 text-sm text-gray-600">
              หรือ{" "}
              <a href="/login" className="text-purple-600 hover:underline font-medium">
                กลับไปที่หน้าล็อกอิน
              </a>
            </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default ForgotPassword;

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
    <>
      {/* พื้นหลังเต็มหน้าจอ (full-bleed) */}
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200"
        aria-hidden="true"
      />

      <main className="relative min-h-screen w-screen overflow-x-hidden">
        {/* ปรับ pt-* ให้พอดีกับความสูง navbar ของคุณ */}
        <section className="w-full pt-24 sm:pt-28 lg:pt-32 pb-10 px-3 sm:px-6 lg:px-10">
          {/* กล่องคอนเทนต์แบบเต็มกว้าง (ไม่จัดกลาง) */}
          <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 lg:p-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-700 mb-4 sm:mb-6">
              รีเซ็ตรหัสผ่านของคุณ
            </h2>

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
        </section>
      </main>
    </>
  );
};

export default ForgotPassword;

// src/Pages/DetailModal.jsx (ฉบับแก้ไขสมบูรณ์)
import React from "react";

const DetailModal = ({ data, onClose, type }) => {
  // [ปรับปรุง] เราจะแสดงข้อมูลจาก object `data` ที่ได้รับมาโดยตรง
  const isQualityEvaluation = type === "quality";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none z-10"
        >
          ×
        </button>

        <div className="p-6 pb-2">
          <h2 className="text-2xl font-semibold text-purple-700">
            รายละเอียด{isQualityEvaluation ? "การประเมินคุณภาพ" : "การแข่งขัน"}
          </h2>
        </div>

        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* --- คอลัมน์ซ้าย: รูปภาพและวิดีโอ --- */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-purple-600 mb-2">รูปภาพปลากัด</h3>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(data.images) && data.images.length > 0 ? (
                  data.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`fish-${idx}`}
                      className="w-24 h-24 object-cover rounded border border-purple-300 shadow-sm"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-medium text-purple-600 mb-2">วิดีโอ</h3>
              {data.video ? (
                <video width="100%" controls className="rounded border border-purple-300 shadow-sm">
                  <source src={data.video} type="video/mp4" />
                  เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                </video>
              ) : (
                <p className="text-gray-500 text-sm">ไม่มีวิดีโอ</p>
              )}
            </div>
          </div>

          {/* --- คอลัมน์ขวา: รายละเอียดและคะแนน --- */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-purple-600 mb-2">รายละเอียดปลากัด</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                <li><strong>ชื่อปลากัด:</strong> {data.betta_name || "ไม่มีข้อมูล"}</li>
                <li><strong>ประเภท:</strong> {data.fish_type || "ไม่มีข้อมูล"}</li>
                <li><strong>อายุ:</strong> {data.fish_age_months ? `${data.fish_age_months} เดือน` : "ไม่มีข้อมูล"}</li>
              </ul>
            </div>

            {isQualityEvaluation && (
              <div>
                <h3 className="text-xl font-medium text-purple-600 mb-2">ผลการประเมิน</h3>
                <p className="text-gray-700"><strong>สถานะ:</strong> {data.status}</p>
                <p className="text-gray-700"><strong>รายละเอียด:</strong> {data.detail}</p>
              </div>
            )}

            {/* ส่วนนี้สำหรับแสดงผลการแข่งขัน (ถ้ามี) */}
            {!isQualityEvaluation && (
              <div>
                <h3 className="text-xl font-medium text-purple-600 mb-2">ผลการแข่งขัน</h3>
                {data.rank ? (
                  <p className="text-green-700 font-bold">อันดับที่ {data.rank}</p>
                ) : (
                  <p className="text-gray-500">ยังไม่มีผลการจัดอันดับ</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;
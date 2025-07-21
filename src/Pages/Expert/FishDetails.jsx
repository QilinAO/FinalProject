import React from "react";

const FishDetails = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("บันทึกผลการประเมินสำเร็จ!");
  };

  return (
    // ใช้ min-h-screen + bg-gray-50 เพื่อให้เต็มหน้าจอ
    <div className="min-h-screen bg-gray-50">
      {/* เลื่อนคอนเทนต์ลงด้วย pt-20 แทน ml-64 */}
      <div className="pt-20 p-4">
        <h1 className="text-2xl font-bold mb-4">รายละเอียดปลากัด</h1>
        <div className="mb-4">
          <img
            src="https://via.placeholder.com/300"
            alt="ปลากัด"
            className="w-64 h-64 object-cover rounded shadow"
          />
        </div>
        <p>
          <strong>ชื่อปลากัด:</strong> Betta A
        </p>
        <p>
          <strong>เจ้าของ:</strong> John Doe
        </p>
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block mb-2">ให้คะแนน (0-10):</label>
          <input
            type="number"
            min="0"
            max="10"
            className="border p-2 w-full mb-4"
            placeholder="กรอกคะแนน"
          />
          <label className="block mb-2">ความคิดเห็น:</label>
          <textarea
            className="border p-2 w-full mb-4"
            placeholder="เขียนความคิดเห็น..."
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            บันทึกผลการประเมิน
          </button>
        </form>
      </div>
    </div>
  );
};

export default FishDetails;

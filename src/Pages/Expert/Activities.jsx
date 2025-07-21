import React, { useState } from "react";
import { X, Fish, Image as ImageIcon } from "lucide-react";

const Activities = () => {
  const [showEvaluationPopup, setShowEvaluationPopup] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [selectedFish, setSelectedFish] = useState(null);
  const [scores, setScores] = useState({
    headEyeScore: "",
    bodyScaleScore: "",
    dorsalFinScore: "",
    tailFinScore: "",
    analFinScore: "",
    otherFinScore: "",
    colorPatternScore: "",
    swimmingStanceScore: "",
    flareScore: "",
    overallScore: "",
    totalScore: "",
  });

  const activities = [
    {
      id: 1,
      name: "การประกวดปลากัดครั้งที่ 1",
      startDate: "2025-01-10",
      endDate: "2025-01-15",
      status: "กำลังดำเนินการ",
      fishes: [
        {
          id: 101,
          name: "Betta A",
          owner: "สมชาย ใจดี",
          details: {
            age: "6 เดือน",
            size: "5 ซม.",
            type: "Halfmoon",
            species: "สายพันธุ์ไทย",
          },
        },
        {
          id: 102,
          name: "Betta B",
          owner: "สมหญิง สายเพาะ",
          details: {
            age: "8 เดือน",
            size: "6 ซม.",
            type: "Crowntail",
            species: "สายพันธุ์มาเลเซีย",
          },
        },
      ],
    },
  ];

  const openEvaluationPopup = (activity) => {
    setSelectedActivity(activity);
    setShowEvaluationPopup(true);
  };

  const closeEvaluationPopup = () => {
    setShowEvaluationPopup(false);
    setSelectedActivity(null);
  };

  const openFishDetails = (fish) => {
    setSelectedFish(fish);
  };

  const closeFishDetails = () => {
    setSelectedFish(null);
  };

  const handleScoreChange = (field, value) => {
    setScores((prevScores) => ({
      ...prevScores,
      [field]: value,
    }));
  };

  const calculateTotalScore = () => {
    const numericScores = Object.values(scores)
      .map(Number)
      .filter((score) => !isNaN(score));
    return numericScores.length > 0
      ? (
          numericScores.reduce((a, b) => a + b, 0) / numericScores.length
        ).toFixed(2)
      : "0";
  };

  const handleSaveScores = () => {
    const totalScore = calculateTotalScore();
    const finalScores = {
      ...scores,
      totalScore,
    };
    console.log("คะแนนที่บันทึก:", finalScores);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* แทนการใช้ lg:ml-64 ด้วย pt-20 เพื่อกันไม่ให้เมนู Navbar ด้านบนทับเนื้อหา */}
      <div className="pt-20 p-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-6 drop-shadow-sm">
            กิจกรรมที่ได้รับเชิญเป็นกรรมการ
          </h1>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-100">
                <tr>
                  {["ID", "ชื่อกิจกรรม", "วันที่เริ่ม", "วันที่สิ้นสุด", "สถานะ", "การกระทำ"].map(
                    (header) => (
                      <th
                        key={header}
                        className="px-4 py-3 text-left text-xs font-bold text-blue-900 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-gray-700">{activity.id}</td>
                    <td className="px-4 py-3 font-medium text-blue-900">
                      {activity.name}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {activity.startDate}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {activity.endDate}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {activity.status === "กำลังดำเนินการ" && (
                        <button
                          className="text-blue-600 hover:text-blue-800 transition-colors flex items-center font-medium"
                          onClick={() => openEvaluationPopup(activity)}
                        >
                          <Fish className="mr-2" size={16} />
                          ทำการประเมินคุณภาพ
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Popup รายชื่อปลาที่เข้าประกวด */}
          {showEvaluationPopup && selectedActivity && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full relative p-6 overflow-y-auto max-h-screen">
                <button
                  onClick={closeEvaluationPopup}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  รายชื่อปลาที่เข้าประกวด ({selectedActivity.name})
                </h2>
                <ul className="space-y-3">
                  {selectedActivity.fishes.map((fish) => (
                    <li
                      key={fish.id}
                      className="bg-blue-50 rounded-lg p-4 flex justify-between items-center hover:bg-blue-100 transition-colors"
                    >
                      <div>
                        <p className="font-semibold text-blue-800 text-lg">{fish.name}</p>
                        <p className="text-gray-600">เจ้าของ: {fish.owner}</p>
                      </div>
                      <button
                        onClick={() => openFishDetails(fish)}
                        className="text-blue-600 hover:text-blue-800 flex items-center font-medium"
                      >
                        <ImageIcon className="mr-2" size={16} />
                        ดูรายละเอียด
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Popup รายละเอียดปลากัด + ให้คะแนน */}
          {selectedFish && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
              <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full relative p-6 overflow-y-auto max-h-screen">
                <button
                  onClick={closeFishDetails}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                  <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-blue-900 mb-4">
                  {selectedFish.name}
                </h2>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <p>
                    <strong>เจ้าของ:</strong> {selectedFish.owner}
                  </p>
                  <p>
                    <strong>อายุ:</strong> {selectedFish.details.age}
                  </p>
                  <p>
                    <strong>ขนาด:</strong> {selectedFish.details.size}
                  </p>
                  <p>
                    <strong>ประเภท:</strong> {selectedFish.details.type}
                  </p>
                  <p>
                    <strong>ชนิด:</strong> {selectedFish.details.species}
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-blue-900">ภาพปลากัด</h3>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {[1, 2, 3].map((_, idx) => (
                      <img
                        key={idx}
                        src={`/path-to-image-${idx + 1}.jpg`}
                        alt={`Fish ${idx + 1}`}
                        className="w-full h-auto rounded-md object-cover shadow-sm"
                      />
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-blue-900 mt-6">
                    วิดีโอปลากัด
                  </h3>
                  <video controls className="w-full rounded-md shadow-sm mt-2">
                    <source src="/path-to-video.mp4" type="video/mp4" />
                    เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                  </video>
                </div>

                <div className="mt-6 space-y-4">
                  <h3 className="text-lg font-bold text-blue-900">ให้คะแนน</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { key: "headEyeScore", label: "หัวและตา" },
                      { key: "bodyScaleScore", label: "ลำตัวและเกล็ด" },
                      { key: "dorsalFinScore", label: "ครีบหลัง (กระโดง)" },
                      { key: "tailFinScore", label: "ครีบหาง (หาง)" },
                      { key: "analFinScore", label: "ครีบก้น (ชายน้ำ)" },
                      { key: "otherFinScore", label: "ครีบอื่น ๆ" },
                      { key: "colorPatternScore", label: "สีสันและลวดลาย" },
                      {
                        key: "swimmingStanceScore",
                        label: "การว่ายน้ำและการทรงตัว",
                      },
                      { key: "flareScore", label: "การพองสู้" },
                      { key: "overallScore", label: "ภาพรวม" },
                    ].map(({ key, label }) => (
                      <div key={key}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {label}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10"
                          className="block w-full border rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                          value={scores[key]}
                          onChange={(e) => handleScoreChange(key, e.target.value)}
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-sm font-bold text-blue-900 mb-1">
                        คะแนนรวม
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={calculateTotalScore()}
                        className="block w-full border rounded-md p-2 bg-gray-100 font-bold text-blue-900"
                      />
                    </div>
                  </div>
                  <button
                    onClick={handleSaveScores}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    บันทึกผลคะแนน
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Activities;

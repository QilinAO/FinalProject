// D:\ProJectFinal\Lasts\my-project\src\Pages\User\DetailModal.jsx

// --- ส่วนที่ 1: การนำเข้า (Imports) ---
import React from "react";
import { getBettaTypeLabel } from "../../utils/bettaTypes";

// ---------- helpers ----------
function safeJoinName(obj) {
  if (!obj) return null;
  const full =
    [obj.first_name, obj.last_name].filter(Boolean).join(" ") ||
    obj.username ||
    obj.email ||
    null;
  return full;
}

/** ดึง assignment แรก โดยพยายามใช้ข้อมูลที่ “ครบ” ที่สุด */
function getFirstAssignment(data) {
  // 1) ให้ความสำคัญ raw_assignments ก่อน (มี scores ครบกว่า)
  if (Array.isArray(data?.raw_assignments) && data.raw_assignments.length > 0) {
    const a0 = data.raw_assignments[0];
    return {
      status: a0?.status ?? null,
      total_score: a0?.total_score ?? null,
      evaluated_at: a0?.evaluated_at ?? null,
      assigned_at: a0?.assigned_at ?? null,
      scores: a0?.scores ?? null,
      evaluator_name: safeJoinName(a0?.evaluator) || "ผู้เชี่ยวชาญ",
      evaluator: a0?.evaluator ?? null,
    };
  }

  // 2) รองรับรูปแบบใหม่ที่ map แล้ว (อาจไม่มี scores)
  if (Array.isArray(data?.assignees) && data.assignees.length > 0) {
    const a0 = data.assignees[0];
    return {
      status: a0?.status ?? null,
      total_score: a0?.total_score ?? null,
      evaluated_at: a0?.evaluated_at ?? null,
      assigned_at: a0?.assigned_at ?? null,
      scores: a0?.scores ?? null, // อาจไม่มี
      evaluator_name: a0?.evaluator_name || "ผู้เชี่ยวชาญ",
      evaluator: a0?.evaluator ?? null,
    };
  }

  return null;
}

/** พยายามอ่าน “คอมเมนต์/ความเห็น” จากโครง scores */
function extractExpertComment(scores) {
  if (!scores) return null;
  const candidates = [
    "comment",
    "comments",
    "note",
    "remark",
    "summary",
    "ความคิดเห็น",
    "หมายเหตุ",
  ];
  for (const key of candidates) {
    const val = scores?.[key];
    if (typeof val === "string" && val.trim()) return val.trim();
  }
  // เผื่ออยู่ในซับโครง เช่น meta.comment
  if (scores?.meta && typeof scores.meta.comment === "string") {
    const v = scores.meta.comment.trim();
    if (v) return v;
  }
  return null;
}

// --- ส่วนที่ 2: Main Component ---
const DetailModal = ({ data = {}, onClose, type }) => {
  const isQualityEvaluation = type === "quality";

  // ชื่อปลา
  const nameLabel = data?.betta_name || data?.fish_name || "ไม่มีข้อมูล";

  // ประเภท (รองรับทั้ง slug/ไทย, ถ้า map ไม่ได้ให้ใช้ค่าดิบ)
  const rawType = (data?.fish_type || data?.betta_type || "").toString().trim();
  const typeLabel =
    (rawType && (getBettaTypeLabel(rawType.toLowerCase()) || rawType)) ||
    "ไม่มีข้อมูล";

  const submissionStatus = data?.status || data?.submission_status || "-";
  const normalizedFinal =
    data?.final_score !== undefined && data?.final_score !== null
      ? Number(data.final_score)
      : data?.score !== undefined && data?.score !== null
      ? Number(data.score)
      : NaN;
  const finalScoreValue = Number.isFinite(normalizedFinal) ? normalizedFinal : null;
  const rejectReason = data?.reject_reason || null;
  const judgeScores = Array.isArray(data?.raw_assignments) ? data.raw_assignments : [];

  // อายุ
  const ageLabel =
    typeof data?.fish_age_months === "number" ||
    (typeof data?.fish_age_months === "string" && data.fish_age_months !== "")
      ? `${data.fish_age_months} เดือน`
      : "ไม่มีข้อมูล";

  // สื่อ
  const images = Array.isArray(data?.images) ? data.images : [];
  const videoUrl = data?.video || null;

  // ข้อมูลการมอบหมาย/ประเมิน
  const a0 = getFirstAssignment(data);
  const assignedExpertName = a0?.evaluator_name || (a0 ? "ผู้เชี่ยวชาญ" : "ยังไม่มอบหมาย");
  const isEvaluated =
    a0?.status === "evaluated" || data?.status === "ประเมินเสร็จสิ้น";
  const totalScore =
    typeof a0?.total_score === "number"
      ? a0.total_score
      : typeof data?.final_score === "number"
      ? data.final_score
      : null;
  const expertComment = extractExpertComment(a0?.scores);

  // --- Main Render (JSX) ---
  return (
    // Overlay (พื้นหลังสีดำโปร่งแสง)
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="รายละเอียด"
    >
      {/* กล่อง Modal หลัก */}
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-lg shadow-lg overflow-y-auto">
        {/* ปุ่มปิด Modal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-2xl font-bold focus:outline-none z-10"
          aria-label="ปิดหน้าต่างรายละเอียด"
        >
          ×
        </button>

        {/* ส่วนหัวของ Modal */}
        <div className="p-6 pb-2">
          <h2 className="text-2xl font-semibold text-purple-700">
            รายละเอียด{isQualityEvaluation ? "การประเมินคุณภาพ" : "การแข่งขัน"}
          </h2>
        </div>

        {/* เนื้อหา 2 คอลัมน์ */}
        <div className="p-6 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ซ้าย: รูป/วิดีโอ */}
          <div className="space-y-4">
            {/* รูปภาพ */}
            <div>
              <h3 className="text-xl font-medium text-purple-600 mb-2">รูปภาพปลากัด</h3>
              <div className="flex flex-wrap gap-2">
                {images.length > 0 ? (
                  images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`ภาพปลากัด ${nameLabel} - รูปที่ ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded border border-purple-300 shadow-sm"
                    />
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">ไม่มีรูปภาพ</p>
                )}
              </div>
            </div>

            {/* วิดีโอ */}
            {videoUrl && (
              <div>
                <h3 className="text-xl font-medium text-purple-600 mb-2">วิดีโอ</h3>
                <video
                  width="100%"
                  controls
                  className="rounded border border-purple-300 shadow-sm"
                >
                  <source src={videoUrl} type="video/mp4" />
                  เบราว์เซอร์ของคุณไม่รองรับวิดีโอ
                </video>
              </div>
            )}
          </div>

          {/* ขวา: รายละเอียดและผล */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-purple-600 mb-2">
                รายละเอียดปลากัด
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                <li>
                  <strong>ชื่อปลากัด:</strong> {nameLabel}
                </li>
                <li>
                  <strong>ประเภท:</strong> {typeLabel}
                </li>
                <li>
                  <strong>อายุ:</strong> {ageLabel}
                </li>
              </ul>
            </div>

            {/* ผลการประเมิน */}
            {isQualityEvaluation && (
              <div>
                <h3 className="text-xl font-medium text-purple-600 mb-2">ผลการประเมิน</h3>

                <p className="text-gray-700">
                  <strong>สถานะ:</strong> {data?.status ?? "-"}
                </p>

                <p className="text-gray-700">
                  <strong>มอบหมายงานให้ผู้เชี่ยวชาญ:</strong>{" "}
                  {assignedExpertName || (a0 ? "ผู้เชี่ยวชาญ" : "ยังไม่มอบหมาย")}
                </p>

                {/* รายละเอียด = ความเห็นของผู้เชี่ยวชาญ */}
                {isEvaluated ? (
                  <>
                    <p className="text-gray-700">
                      <strong>รายละเอียด:</strong>{" "}
                      {expertComment || "ไม่มีความเห็น"}
                    </p>
                    <p className="text-gray-700">
                      <strong>คะแนนรวม:</strong>{" "}
                      {typeof totalScore === "number" ? totalScore : "—"}
                    </p>
                  </>
                ) : (
                  <p className="text-gray-700">
                    <strong>รายละเอียด:</strong> กำลังรอความเห็นจากผู้เชี่ยวชาญ
                  </p>
                )}
              </div>
            )}

            {/* ผลการแข่งขัน */}
            {!isQualityEvaluation && (
              <div>
                <h3 className="text-xl font-medium text-purple-600 mb-2">ผลการแข่งขัน</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
                  <li>
                    <strong>สถานะ:</strong> {submissionStatus || "-"}
                  </li>
                  <li>
                    <strong>คะแนนสุดท้าย:</strong> {finalScoreValue != null ? finalScoreValue.toFixed(2) : "-"}
                  </li>
                  {data?.contest_name && (
                    <li>
                      <strong>ชื่อการประกวด:</strong> {data.contest_name}
                    </li>
                  )}
                  {data?.rank && (
                    <li className="text-green-700 font-semibold">อันดับที่ {data.rank}</li>
                  )}
                </ul>

                {rejectReason && (
                  <div className="mt-3 p-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm whitespace-pre-line">
                    <strong>เหตุผลที่ถูกปฏิเสธ:</strong>
                    <p className="mt-1">{rejectReason}</p>
                  </div>
                )}

                {judgeScores.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-medium text-purple-600 mb-2">คะแนนจากกรรมการ</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm text-left border border-purple-100">
                        <thead className="bg-purple-50">
                          <tr>
                            <th className="px-3 py-2 font-semibold text-purple-700">กรรมการ</th>
                            <th className="px-3 py-2 font-semibold text-purple-700">สถานะ</th>
                            <th className="px-3 py-2 font-semibold text-purple-700">คะแนน</th>
                            <th className="px-3 py-2 font-semibold text-purple-700">เวลาให้คะแนน</th>
                          </tr>
                        </thead>
                        <tbody>
                          {judgeScores.map((row, idx) => (
                            <tr key={idx} className="border-t border-purple-100">
                              <td className="px-3 py-2 text-gray-700">{row.evaluator_name || "กรรมการ"}</td>
                              <td className="px-3 py-2 text-gray-600">{row.status || '-'}</td>
                              <td className="px-3 py-2 text-gray-900 font-medium">{typeof row.total_score === "number" ? row.total_score.toFixed(2) : '-'}</td>
                              <td className="px-3 py-2 text-gray-500">
                                {row.evaluated_at ? new Date(row.evaluated_at).toLocaleString("th-TH") : '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
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

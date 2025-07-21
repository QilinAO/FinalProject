import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom"; // [1] Import useNavigate เพิ่ม
import { submitBettaForEvaluation } from "../../services/userService";
import apiService from "../../services/api";

const BETTA_TYPE_OPTIONS = [
  "ปลากัดพื้นบ้านภาคกลางและเหนือ", "ปลากัดพื้นบ้านภาคอีสาน", "ปลากัดพื้นภาคใต้",
  "ปลากัดพื้นบ้านมหาชัย", "ปลากัดพื้นบ้านภาคตะวันออก", "ปลากัดพื้นบ้านอีสานหางลาย",
];

const BettaEvaluationForm = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const location = useLocation();
  const navigate = useNavigate(); // [2] เรียกใช้ useNavigate

  // --- State สำหรับจัดการไฟล์ ---
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- State สำหรับการประกวด (รับค่ามาจาก state เท่านั้น) ---
  const [submissionMode, setSubmissionMode] = useState(location.state?.defaultMode || 'evaluate');
  const [contestId, setContestId] = useState(location.state?.defaultContestId || null);
  const [contestName, setContestName] = useState('');

  // --- useEffect: ถ้ามี contestId ส่งมา ให้ไปดึงชื่อการประกวดมาแสดง ---
  useEffect(() => {
    // ทำงานเฉพาะเมื่อเปิดหน้านี้ในโหมด 'compete' และมี contestId
    if (submissionMode === 'compete' && contestId) {
      apiService.get(`/public/content/${contestId}`)
        .then(response => {
          setContestName(response.data.name);
        })
        .catch(() => {
          toast.error("ไม่พบข้อมูลการประกวดที่ระบุ");
          setContestName('การประกวดที่ไม่รู้จัก');
        });
    }
  }, [submissionMode, contestId]);

  // --- ฟังก์ชันสำหรับ Dropzone (ไม่มีการเปลี่ยนแปลง) ---
  const onDropImages = (acceptedFiles) => setImages(prev => [...prev, ...acceptedFiles].slice(0, 3));
  const onDropVideo = (acceptedFiles) => setVideo(acceptedFiles[0]);
  const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages } = useDropzone({ onDrop: onDropImages, accept: { "image/*": [] }, multiple: true });
  const { getRootProps: getRootPropsVideo, getInputProps: getInputPropsVideo } = useDropzone({ onDrop: onDropVideo, accept: { "video/*": [] }, multiple: false });
  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
  const removeVideo = () => setVideo(null);

  // --- Logic การ Submit ฟอร์ม ---
  const onSubmit = async (formData) => {
    if (images.length === 0) return toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");

    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append('betta_name', formData.betta_name);
      apiFormData.append('betta_type', formData.betta_type);
      if (formData.betta_age_months) apiFormData.append('betta_age_months', formData.betta_age_months);
      images.forEach(imageFile => apiFormData.append('images', imageFile));
      if (video) apiFormData.append('video', video);
      
      // ส่ง contest_id ไปด้วย ถ้ามี (กรณีมาจากหน้าประกวด)
      if (contestId) {
        apiFormData.append('contest_id', contestId);
      }

      await submitBettaForEvaluation(apiFormData); 

      toast.success("ส่งแบบฟอร์มสำเร็จ!");
      reset();
      setImages([]);
      setVideo(null);
      
      // [3] หลังจากส่งฟอร์มเสร็จ ให้พาผู้ใช้กลับไปหน้าประวัติ
      navigate('/history');

    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการส่งแบบฟอร์ม");
    } finally {
      setIsSubmitting(false);
    }
  };

  // กำหนดหัวข้อของหน้าตามโหมด
  const pageTitle = submissionMode === 'compete' ? "ส่งปลากัดเข้าร่วมประกวด" : "ส่งปลากัดเพื่อประเมินคุณภาพ";

  return (
    <main className="bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 py-12 min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full bg-white bg-opacity-90 p-8 rounded shadow-lg">
        <h2 className="text-3xl font-bold text-center mb-4 text-purple-700">{pageTitle}</h2>
        
        {/* แสดงชื่อการประกวด ถ้ามี */}
        {contestName && (
          <div className="text-center mb-8 p-3 bg-purple-100 rounded-lg">
            <p className="font-semibold text-purple-800">การประกวด: {contestName}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* ส่วนอัปโหลดไฟล์และฟิลด์ข้อมูล (ไม่มีการเปลี่ยนแปลง) */}
          <div>
            <label className="font-semibold">รูปภาพ (สูงสุด 3 รูป):</label>
            <div {...getRootPropsImages()} className="border-2 border-dashed p-4 mt-1 text-center cursor-pointer">
              <input {...getInputPropsImages()} />
              <p>ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
            </div>
            <div className="flex gap-2 mt-2">{images.map((file, i) => <div key={i} className="relative"><img src={URL.createObjectURL(file)} alt="" className="w-20 h-20 object-cover rounded" /><button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><FaTimes size={10}/></button></div>)}</div>
          </div>
           <div>
            <label className="font-semibold">วิดีโอ (ถ้ามี):</label>
            <div {...getRootPropsVideo()} className="border-2 border-dashed p-4 mt-1 text-center cursor-pointer">
              <input {...getInputPropsVideo()} />
              <p>ลากไฟล์มาวาง หรือ คลิกเพื่อเลือก</p>
            </div>
            {video && <div className="relative mt-2"><video src={URL.createObjectURL(video)} controls className="w-full rounded" /><button type="button" onClick={removeVideo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FaTimes size={12}/></button></div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">ชื่อปลากัด:</label>
              <input {...register("betta_name", { required: true })} className="w-full p-2 border rounded mt-1" />
              {errors.betta_name && <span className="text-red-500 text-sm">กรุณากรอกชื่อปลากัด</span>}
            </div>
            <div>
              <label className="font-semibold">อายุ (เดือน):</label>
              <input type="number" {...register("betta_age_months")} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div>
            <label className="font-semibold">ประเภทปลากัด:</label>
            <select {...register("betta_type", { required: true })} className="w-full p-2 border rounded mt-1">
              <option value="">-- เลือกประเภท --</option>
              {BETTA_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {errors.betta_type && <span className="text-red-500 text-sm">กรุณาเลือกประเภท</span>}
          </div>
          
          <div className="pt-4">
            <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-3 rounded hover:bg-purple-700 font-bold disabled:bg-purple-300">
              {isSubmitting ? 'กำลังส่ง...' : 'ส่งแบบฟอร์ม'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default BettaEvaluationForm;
import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { FaTimes } from "react-icons/fa";
import { X } from 'lucide-react';
import { toast } from "react-toastify";
import { submitBettaForEvaluation } from "../services/userService";

const SubmissionFormModal = ({ isOpen, onRequestClose, contest }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedSubcategories = contest.allowed_subcategories || [];

  useEffect(() => {
    if (isOpen) {
        reset();
        setImages([]);
        setVideo(null);
        if (allowedSubcategories.length === 1) {
            setValue("betta_type", allowedSubcategories[0]);
        }
    }
  }, [isOpen, allowedSubcategories, setValue, reset]);

  const onDropImages = (acceptedFiles) => setImages(prev => [...prev, ...acceptedFiles].slice(0, 3));
  const onDropVideo = (acceptedFiles) => setVideo(acceptedFiles[0]);
  const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages } = useDropzone({ onDrop: onDropImages, accept: { "image/*": [] }, multiple: true });
  const { getRootProps: getRootPropsVideo, getInputProps: getInputPropsVideo } = useDropzone({ onDrop: onDropVideo, accept: { "video/*": [] }, multiple: false });
  const removeImage = (index) => setImages(prev => prev.filter((_, i) => i !== index));
  const removeVideo = () => setVideo(null);

  const onSubmit = async (formData) => {
    if (images.length === 0) return toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append('contest_id', contest.id);
      apiFormData.append('betta_name', formData.betta_name);
      apiFormData.append('betta_type', formData.betta_type);
      if (formData.betta_age_months) apiFormData.append('betta_age_months', formData.betta_age_months);
      images.forEach(file => apiFormData.append('images', file));
      if (video) apiFormData.append('video', video);

      await submitBettaForEvaluation(apiFormData);
      toast.success(`สมัครเข้าร่วม "${contest.name}" สำเร็จ!`);
      onRequestClose();
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
      className="fixed inset-0 flex items-center justify-center p-4"
      contentLabel="Submission Form Modal"
    >
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <button onClick={onRequestClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800"><X /></button>
        <h2 className="text-2xl font-bold mb-2">สมัครเข้าร่วมประกวด</h2>
        <p className="text-purple-700 font-semibold mb-6">{contest.name}</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold">ชื่อปลากัด:</label>
              <input {...register("betta_name", { required: "กรุณากรอกชื่อปลากัด" })} className="w-full p-2 border rounded mt-1" />
              {errors.betta_name && <span className="text-red-500 text-sm">{errors.betta_name.message}</span>}
            </div>
            <div>
              <label className="font-semibold">อายุ (เดือน):</label>
              <input type="number" {...register("betta_age_months")} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div>
            <label className="font-semibold">ประเภทปลากัด:</label>
            <select 
              {...register("betta_type", { required: "กรุณาเลือกประเภท" })} 
              className="w-full p-2 border rounded mt-1"
              disabled={allowedSubcategories.length === 1}
            >
              <option value="">-- เลือกประเภท --</option>
              {allowedSubcategories.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            {errors.betta_type && <span className="text-red-500 text-sm">{errors.betta_type.message}</span>}
          </div>
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
          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-purple-300">
            {isSubmitting ? 'กำลังส่ง...' : 'ยืนยันการสมัคร'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default SubmissionFormModal;
// ======================================================================
// File: src/Component/SubmissionFormModal.jsx
// หน้าที่: Modal กลางสำหรับส่งปลากัดเข้าร่วมการประกวด
// ======================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Modal from 'react-modal';
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { X, ImagePlus, Video, LoaderCircle } from 'lucide-react';
import { submitBettaForCompetition } from "../services/userService";
import { BETTA_TYPE_MAP_ID } from '../utils/bettaTypes';

/**
 * ส่วนหัวของ Modal
 */
const ModalHeader = ({ contestName, onClose }) => (
  <div className="flex justify-between items-start pb-4 border-b mb-6">
    <div>
      <h2 className="text-2xl font-bold text-gray-800">สมัครเข้าร่วมประกวด</h2>
      <p className="text-purple-700 font-semibold">{contestName}</p>
    </div>
    <button onClick={onClose} className="text-gray-400 hover:text-gray-800">
      <X size={28} />
    </button>
  </div>
);

/**
 * Component สำหรับ Dropzone อัปโหลดรูปภาพและแสดง Preview
 */
const ImageDropzone = ({ getRootProps, getInputProps, images, onRemove }) => (
  <div>
    <label className="block font-semibold text-gray-700 mb-1">รูปภาพ (สูงสุด 3 รูป):</label>
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition">
      <input {...getInputProps()} />
      <ImagePlus size={40} className="mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600">ลากไฟล์มาวาง หรือ <span className="font-semibold text-purple-600">คลิกเพื่อเลือก</span></p>
    </div>
    {images.length > 0 && (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-3">
        {images.map((file, i) => (
          <div key={i} className="relative group">
            <img src={file.preview} alt={`preview ${i}`} className="w-full aspect-square object-cover rounded-lg shadow" />
            <button type="button" onClick={() => onRemove(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition">
              <X size={12} />
            </button>
          </div>
        ))}
      </div>
    )}
  </div>
);

/**
 * Component สำหรับ Dropzone อัปโหลดวิดีโอและแสดง Preview
 */
const VideoDropzone = ({ getRootProps, getInputProps, video, onRemove }) => (
  <div>
    <label className="block font-semibold text-gray-700 mb-1">วิดีโอ (ถ้ามี):</label>
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-purple-400 transition">
      <input {...getInputProps()} />
      <Video size={40} className="mx-auto text-gray-400 mb-2" />
      <p className="text-gray-600">ลากไฟล์มาวาง หรือ <span className="font-semibold text-purple-600">คลิกเพื่อเลือก</span></p>
    </div>
    {video && (
      <div className="relative mt-3">
        <video src={video.preview} controls className="w-full rounded-lg shadow aspect-video" />
        <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg">
          <X size={14} />
        </button>
      </div>
    )}
  </div>
);

/**
 * Component หลักของ Submission Form Modal
 */
const SubmissionFormModal = ({ isOpen, onRequestClose, contest }) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm();
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedSubcategories = useMemo(() => {
    const contestCodes = contest?.allowed_subcategories || [];
    console.log('Contest codes from API:', contestCodes);
    
    return Object.entries(BETTA_TYPE_MAP_ID)
      .filter(([id]) => {
        // รองรับทั้ง uppercase และ lowercase
        const upperCaseId = id.toUpperCase();
        const lowerCaseId = id.toLowerCase();
        return contestCodes.includes(id) || contestCodes.includes(upperCaseId) || contestCodes.includes(lowerCaseId);
      })
      .map(([id, label]) => ({ id, label }))
      // กรองให้เหลือแค่ uppercase เพื่อไม่ให้ซ้ำ
      .filter(item => item.id === item.id.toUpperCase());
  }, [contest]);

  useEffect(() => {
    if (isOpen) {
      reset();
      setImages([]);
      setVideo(null);
      if (allowedSubcategories.length === 1) {
        setValue("betta_type", allowedSubcategories[0].id);
      }
    }
  }, [isOpen, allowedSubcategories, setValue, reset]);

  // [สำคัญ] Cleanup Object URLs เพื่อป้องกัน Memory Leaks
  useEffect(() => {
    return () => {
      images.forEach(file => URL.revokeObjectURL(file.preview));
      if (video) {
        URL.revokeObjectURL(video.preview);
      }
    };
  }, [images, video]);

  const onDropImages = (acceptedFiles) => {
    const newImages = acceptedFiles.map(file => Object.assign(file, { preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages].slice(0, 3));
  };
  
  const onDropVideo = (acceptedFiles) => {
    if (acceptedFiles[0]) {
      setVideo(Object.assign(acceptedFiles[0], { preview: URL.createObjectURL(acceptedFiles[0]) }));
    }
  };

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
      if (formData.betta_age_months) {
        apiFormData.append('betta_age_months', formData.betta_age_months);
      }
      images.forEach(file => apiFormData.append('images', file));
      if (video) {
        apiFormData.append('video', video);
      }

      await submitBettaForCompetition(apiFormData);
      toast.success(`สมัครเข้าร่วม "${contest.name}" สำเร็จ!`);
      onRequestClose();
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
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
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        <ModalHeader contestName={contest?.name} onClose={onRequestClose} />
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-700 mb-1">ชื่อปลากัด:</label>
              <input {...register("betta_name", { required: "กรุณากรอกชื่อปลากัด" })} className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-purple-500" />
              {errors.betta_name && <span className="text-red-500 text-sm">{errors.betta_name.message}</span>}
            </div>
            <div>
              <label className="block font-semibold text-gray-700 mb-1">อายุ (เดือน):</label>
              <input type="number" {...register("betta_age_months")} className="w-full p-2 border rounded-md mt-1 focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-gray-700 mb-1">ประเภทปลากัด:</label>
            <select 
              {...register("betta_type", { required: "กรุณาเลือกประเภท" })} 
              className="w-full p-2 border rounded-md mt-1 bg-white focus:ring-2 focus:ring-purple-500"
              disabled={allowedSubcategories.length === 1}
            >
              <option value="">-- เลือกประเภท --</option>
              {allowedSubcategories.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {errors.betta_type && <span className="text-red-500 text-sm">{errors.betta_type.message}</span>}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ImageDropzone getRootProps={getRootPropsImages} getInputProps={getInputPropsImages} images={images} onRemove={removeImage} />
            <VideoDropzone getRootProps={getRootPropsVideo} getInputProps={getInputPropsVideo} video={video} onRemove={removeVideo} />
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center transition">
            {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัคร'}
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default SubmissionFormModal;
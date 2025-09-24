// ======================================================================
// File: src/Component/SubmissionFormModal.jsx
// หน้าที่: Modal กลางสำหรับส่งปลากัดเข้าร่วมการประกวด
// ======================================================================

import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import { X, ImagePlus, Video, Hourglass } from 'lucide-react';
import { submitBettaForCompetition } from "../services/userService";
import modelService from "../services/modelService";
import { BETTA_TYPE_MAP_ID, getBettaTypeLabel } from '../utils/bettaTypes';

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
    <label className="block font-semibold text-gray-800 mb-2 text-sm">รูปภาพ (สูงสุด 3 รูป)</label>
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/40 transition min-h-[180px] flex flex-col items-center justify-center">
      <input {...getInputProps()} />
      <ImagePlus size={48} className="mx-auto text-gray-400 mb-3" />
      <p className="text-gray-700 text-base">ลากไฟล์มาวาง หรือ <span className="font-semibold text-purple-600">คลิกเพื่อเลือก</span></p>
      <p className="text-gray-400 text-xs mt-1">รองรับ JPG/PNG/WebP • แนะนำความคมชัดชัดเจน</p>
    </div>
    {images.length > 0 && (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
        {images.map((file, i) => (
          <div key={i} className="relative group">
            <img src={file.preview} alt={`preview ${i}`} className="w-full aspect-square object-cover rounded-xl shadow" />
            <button type="button" onClick={() => onRemove(i)} className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition">
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
    <label className="block font-semibold text-gray-800 mb-2 text-sm">วิดีโอ (ถ้ามี)</label>
    <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/40 transition min-h-[180px] flex flex-col items-center justify-center">
      <input {...getInputProps()} />
      <Video size={48} className="mx-auto text-gray-400 mb-3" />
      <p className="text-gray-700 text-base">ลากไฟล์มาวาง หรือ <span className="font-semibold text-purple-600">คลิกเพื่อเลือก</span></p>
      <p className="text-gray-400 text-xs mt-1">รองรับ MP4/WebM/QuickTime • ไม่บังคับ</p>
    </div>
    {video && (
      <div className="relative mt-4">
        <video src={video.preview} controls className="w-full rounded-xl shadow aspect-video" />
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
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm();
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [aiChecking, setAiChecking] = useState(false);
  const [aiNote, setAiNote] = useState(null); // { status: 'match'|'mismatch'|'error', code?: string }

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
      setAiNote(null);
      if (allowedSubcategories.length === 1) {
        setValue("betta_type", allowedSubcategories[0].id);
      }
    }
  }, [isOpen, allowedSubcategories, setValue, reset]);

  // [สำคัญ] Cleanup Object URLs เพื่อป้องกัน Memory Leaks
  // หมายเหตุ: หลีกเลี่ยงการ revoke ระหว่างที่ยังใช้งานอยู่
  // - เมื่อ remove รูป/วิดีโอ ให้ revoke ทันทีเฉพาะรายการนั้น
  // - เมื่อ modal ถูกปิด (unmount) ค่อย revoke ทั้งหมดที่เหลืออยู่
  useEffect(() => {
    return () => {
      images.forEach(file => {
        try { URL.revokeObjectURL(file.preview); } catch {}
      });
      if (video) {
        try { URL.revokeObjectURL(video.preview); } catch {}
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

  const removeImage = (index) => {
    setImages(prev => {
      const target = prev[index];
      if (target?.preview) {
        try { URL.revokeObjectURL(target.preview); } catch {}
      }
      return prev.filter((_, i) => i !== index);
    });
  };
  const removeVideo = () => {
    setVideo(prev => {
      if (prev?.preview) {
        try { URL.revokeObjectURL(prev.preview); } catch {}
      }
      return null;
    });
  };

  // Reset confirmation when modal opens
  useEffect(() => {
    if (isOpen) setConfirmAccept(false);
  }, [isOpen]);

  // Live AI check when images or betta_type changes (debounced)
  const watchedBettaType = watch("betta_type");
  useEffect(() => {
    if (!isOpen) return;
    if (images.length === 0 || !watchedBettaType) { setAiNote(null); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      setAiChecking(true);
      try {
        const aiResult = await modelService.analyzeForCompetition({ betta_type: watchedBettaType }, [images[0]]);
        const predictedCode = aiResult?.final_label?.code || aiResult?.top1?.display_code || null;
        const predictedName = aiResult?.final_label?.name || aiResult?.top1?.display_name || null;
        const isConfident = !!(aiResult?.is_confident);
        if (!cancelled) {
          if (!predictedCode || !isConfident) {
            setAiNote({ status: 'uncertain' });
            try { toast.info('AI ไม่มั่นใจว่าเป็นประเภทไหน ผู้ใช้โปรดเลือกประเภทเอง หรือสามารถส่งเข้าร่วมการประกวดได้'); } catch {}
          } else {
            const predictedUpper = String(predictedCode).toUpperCase();
            const allowed = (contest?.allowed_subcategories || []).map(c => String(c).toUpperCase());
            const match = allowed.includes(predictedUpper);
            const displayName = getBettaTypeLabel(predictedName || predictedUpper);
            setAiNote({ status: match ? 'match' : 'mismatch', code: predictedUpper, name: displayName });
            try {
              const nameForShow = displayName;
              if (match) toast.success(`AI ตรวจพบประเภท: ${nameForShow} — ตรงตามเงื่อนไข`);
              else toast.warning(`AI ตรวจพบประเภท: ${nameForShow} — ไม่ตรงเงื่อนไข แต่ยังสามารถส่งได้`);
            } catch {}
          }
        }
      } catch (e) {
        if (!cancelled) {
          setAiNote({ status: 'error' });
          try { toast.info('ไม่สามารถใช้ AI ตรวจสอบได้ในขณะนี้'); } catch {}
        }
      } finally {
        if (!cancelled) setAiChecking(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(t); };
  }, [images, watchedBettaType, isOpen, contest]);

  const onSubmit = async (formData) => {
    if (images.length === 0) return toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    
    setIsSubmitting(true);
    const deferredAiToasts = [];
    try {
      // เรียก AI เพื่อตรวจสอบประเภทเบื้องต้น (ไม่บล็อกการส่ง) แต่เลื่อน toast ไปหลังบันทึกสำเร็จ
      try {
        const aiResult = await modelService.analyzeForCompetition(formData, images);
        const predictedCode =
          aiResult?.final_label?.code ||
          aiResult?.top1?.display_code ||
          aiResult?.data?.final_label?.code || null;
        const predictedName =
          aiResult?.final_label?.name ||
          aiResult?.top1?.display_name ||
          aiResult?.data?.final_label?.name || null;
        const isConfident = !!(aiResult?.is_confident);
        if (isConfident && predictedCode) {
          const predictedUpper = String(predictedCode).toUpperCase();
          const allowed = (contest?.allowed_subcategories || []).map(c => String(c).toUpperCase());
          const nameForShow = getBettaTypeLabel(predictedName || predictedUpper);
          if (allowed.includes(predictedUpper)) {
            deferredAiToasts.push({ type: 'success', message: `AI ตรวจพบประเภท: ${nameForShow} — ตรงตามเงื่อนไข` });
          } else {
            deferredAiToasts.push({ type: 'warning', message: `AI ตรวจพบประเภท: ${nameForShow} — ไม่ตรงเงื่อนไข แต่ยังสามารถส่งได้` });
          }
        }
      } catch (e) {
        // หาก AI ไม่พร้อมใช้งาน ไม่ต้องแจ้งเตือนซ้ำหลังการส่งสำเร็จ
      }

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

      const response = await submitBettaForCompetition(apiFormData);
      
      // ตรวจสอบ AI validation warning
      if (response.aiValidation && response.aiValidation.warning) {
        const warning = response.aiValidation.warning;
        const severity = warning.severity;
        
        if (severity === 'error') {
          toast.error(warning.message);
        } else if (severity === 'warning') {
          toast.warning(warning.message);
        } else {
          toast.info(warning.message);
        }
        
        // แสดง success message หลังจาก warning
        setTimeout(() => {
          toast.success(`สมัครเข้าร่วม "${contest.name}" สำเร็จ!`);
          deferredAiToasts.forEach(({ type, message }) => toast[type]?.(message));
        }, 1000);
      } else {
        toast.success(`สมัครเข้าร่วม "${contest.name}" สำเร็จ!`);
        deferredAiToasts.forEach(({ type, message }) => toast[type]?.(message));
      }
      
      onRequestClose();
    } catch (error) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} title={contest?.name ? `สมัครเข้าร่วม: ${contest.name}` : 'สมัครเข้าร่วมประกวด'} maxWidth="max-w-5xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold text-gray-800 mb-2 text-sm">ชื่อปลากัด</label>
              <input {...register("betta_name", { required: "กรุณากรอกชื่อปลากัด" })} className="w-full h-11 px-3 border rounded-lg mt-1 focus:ring-2 focus:ring-purple-500 text-base" placeholder="เช่น เจ้าฟ้า น้องสปาร์ค ฯลฯ" />
              {errors.betta_name && <span className="text-red-500 text-sm">{errors.betta_name.message}</span>}
            </div>
            <div>
              <label className="block font-semibold text-gray-800 mb-2 text-sm">อายุ (เดือน)</label>
              <input type="number" {...register("betta_age_months")} className="w-full h-11 px-3 border rounded-lg mt-1 focus:ring-2 focus:ring-purple-500 text-base" placeholder="เช่น 6" />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-gray-800 mb-2 text-sm">ประเภทปลากัด</label>
            <select 
              {...register("betta_type", { required: "กรุณาเลือกประเภท" })}
              className="w-full h-11 px-3 border rounded-lg mt-1 bg-white focus:ring-2 focus:ring-purple-500 text-base"
              disabled={allowedSubcategories.length === 1}
            >
              <option value="">-- เลือกประเภท --</option>
              {allowedSubcategories.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            {errors.betta_type && <span className="text-red-500 text-sm">{errors.betta_type.message}</span>}
            {aiNote && (
              <div className={`mt-2 text-sm ${aiNote.status === 'match' ? 'text-green-600' : aiNote.status === 'mismatch' ? 'text-amber-600' : 'text-gray-500'}`}>
                {aiChecking ? 'AI กำลังตรวจสอบภาพ...' : (
                  aiNote.status === 'match' ? `AI ตรวจพบประเภท: ${getBettaTypeLabel(aiNote.name || aiNote.code)} — ตรงตามเงื่อนไข` :
                  aiNote.status === 'mismatch' ? `AI ตรวจพบประเภท: ${getBettaTypeLabel(aiNote.name || aiNote.code)} — ไม่ตรงเงื่อนไข แต่ยังสามารถส่งได้` :
                  'ไม่สามารถใช้ AI ตรวจสอบได้ในขณะนี้'
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ImageDropzone getRootProps={getRootPropsImages} getInputProps={getInputPropsImages} images={images} onRemove={removeImage} />
            <VideoDropzone getRootProps={getRootPropsVideo} getInputProps={getInputPropsVideo} video={video} onRemove={removeVideo} />
          </div>

          {/* Confirm intent before submit */}
          <div className="mt-4">
            <label htmlFor="confirm-submit" className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer">
              <input
                id="confirm-submit"
                type="checkbox"
                className="mt-1.5 h-4 w-4 text-purple-600"
                checked={confirmAccept}
                onChange={(e) => setConfirmAccept(e.target.checked)}
              />
              <span className="text-sm text-gray-700">
                ฉันยืนยันที่จะส่งข้อมูลเข้าร่วมการประกวด และได้ตรวจสอบความถูกต้องของข้อมูลเรียบร้อยแล้ว
              </span>
            </label>
          </div>

          <button type="submit" disabled={isSubmitting || !confirmAccept} className="w-full bg-purple-600 text-white py-4 rounded-lg font-bold hover:bg-purple-700 disabled:bg-purple-300 flex items-center justify-center transition text-lg">
            {isSubmitting && <Hourglass className="animate-spin mr-2" />}
            {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ยืนยันการสมัคร'}
          </button>
        </form>
    </Modal>
  );
};

export default SubmissionFormModal;

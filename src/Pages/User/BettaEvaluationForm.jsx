import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { Upload, Image, Video, Fish, Calendar, Award, Sparkles, ArrowLeft, Send } from "lucide-react";

import { BETTA_TYPES } from "../../utils/bettaTypes";
import { isUuid } from "../../utils/apiErrorHandler";
import apiService from "../../services/api";

// Environment variables
const API_BASE = "http://localhost:5000/api"; // Local development API
const API_TOPK = Number(import.meta.env.VITE_BETTA_TOPK ?? 3) || 3;
const API_THRESHOLD = Number(import.meta.env.VITE_BETTA_THRESHOLD ?? 0.9) || 0.9;

const BettaEvaluationForm = () => {
  // --- States ---
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSuggest, setAutoSuggest] = useState(null);

  // --- Hooks ---
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contestId = searchParams.get("contest");
  const submissionMode = contestId ? "compete" : "evaluate";
  const [contestName, setContestName] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      betta_name: "",
      betta_age_months: "",
      betta_type: "",
    },
  });

  // --- AI Analysis Function ---
  const analyzeBettaTypeAuto = useCallback(async (imageFile) => {
    if (!imageFile) return;

    try {
      const fd = new FormData();
      fd.append("file", imageFile);

      const resp = await fetch(`${API_BASE}/predict?topk=${API_TOPK}&threshold=${API_THRESHOLD}`, {
        method: "POST",
        body: fd,
      });

      if (!resp.ok) {
        // ไม่เอา error โผล่ผู้ใช้มากนัก
        console.error("Predict API not ok:", resp.status);
        return;
      }

      const result = await resp.json();
      // โครงสร้างผลลัพธ์จาก API ใหม่:
      // { topk: [...], top1: {...}, is_confident: bool, final_label: {code,name,reason} }
      const top1 = result?.top1;
      const finalLabel = result?.final_label;

      if (top1 && finalLabel) {
        const code = finalLabel.code;      // เช่น 'D','F','C' หรือ 'OTHER'
        const name = finalLabel.name;      // ชื่อไทยตาม taxonomy
        const prob = typeof top1.prob === "number" ? top1.prob : null;

        // แนะนำเฉพาะเมื่อมั่นใจและไม่ใช่ OTHER
        if (result.is_confident && code && code !== "OTHER") {
          // ตรวจว่า code มีอยู่ใน BETTA_TYPES ไหม
          const exist = BETTA_TYPES.some((opt) => opt.value === code);
          if (exist) {
            // ตั้งค่าให้ select เลือกตาม AI
            setValue("betta_type", code, { shouldValidate: true, shouldDirty: true });
            setAutoSuggest({ code, name, prob });
            toast.success(`AI วิเคราะห์เป็น: ${name}${prob != null ? ` (${(prob * 100).toFixed(1)}%)` : ""}`);
          } else {
            // code ไม่อยู่ในรายการ BETTA_TYPES ก็แจ้งเฉย ๆ
            setAutoSuggest({ code, name, prob });
            toast.info(`AI วิเคราะห์ได้: ${name} (แต่ไม่มีรหัสนี้ในตัวเลือก)`);
          }
        } else {
          // ไม่มั่นใจ หรือ OTHER
          setAutoSuggest({ code: code || "OTHER", name: name || "อื่นๆ / ไม่แน่ใจ", prob });
          toast.info(`AI ยังไม่มั่นใจ (${name || "OTHER"}) — กรุณาเลือกประเภทด้วยตนเอง`);
        }
      }
    } catch (err) {
      console.error("Error analyzing betta type:", err);
      // เงียบไว้สำหรับ UX
    }
  }, [setValue]);

  // วิเคราะห์รูปแรกอัตโนมัติเมื่อมีการอัปโหลด
  useEffect(() => {
    if (images.length > 0) {
      const timer = setTimeout(() => {
        analyzeBettaTypeAuto(images[0]);
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [images, analyzeBettaTypeAuto]);

  // โหลดชื่อการประกวด (ถ้ามี)
  useEffect(() => {
    if (submissionMode === "compete" && isUuid(contestId)) {
      apiService
        .get(`/public/content/${contestId}`)
        .then((response) => setContestName(response?.data?.name || ""))
        .catch(() => {
          toast.error("ไม่พบข้อมูลการประกวดที่ระบุ");
          setContestName("การประกวดที่ไม่รู้จัก");
        });
    }
  }, [submissionMode, contestId]);

  const imagePreviews = useMemo(
    () => images.map((f) => ({ file: f, url: URL.createObjectURL(f) })),
    [images]
  );
  const videoPreview = useMemo(() => (video ? URL.createObjectURL(video) : null), [video]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((p) => URL.revokeObjectURL(p.url));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreviews, videoPreview]);

  const onDropImages = (acceptedFiles) => {
    setImages((prev) => {
      const newImages = [...prev, ...acceptedFiles];
      if (newImages.length > 3) {
        toast.info("เลือกรูปได้สูงสุด 3 รูป");
      }
      return newImages.slice(0, 3);
    });
  };

  const onDropVideo = (acceptedFiles) => setVideo(acceptedFiles[0]);

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const removeVideo = () => setVideo(null);

  const { getRootProps: getRootPropsImages, getInputProps: getInputPropsImages } = useDropzone({
    onDrop: onDropImages,
    accept: { "image/*": [] },
    maxFiles: 3,
  });

  const { getRootProps: getRootPropsVideo, getInputProps: getInputPropsVideo } = useDropzone({
    onDrop: onDropVideo,
    accept: { "video/*": [] },
    maxFiles: 1,
  });

  const onSubmit = async (formData) => {
    if (!formData.betta_type) {
      toast.error("กรุณาเลือกประเภทปลากัด");
      return;
    }

    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("betta_name", formData.betta_name);
      apiFormData.append("betta_type", formData.betta_type); // ใช้ code เช่น 'D','F','C'
      if (formData.betta_age_months) {
        apiFormData.append("betta_age_months", String(formData.betta_age_months));
      }

      // เพิ่มรูปภาพ
      images.forEach((image) => {
        apiFormData.append("images", image);
      });

      // เพิ่มวิดีโอ (ถ้ามี)
      if (video) {
        apiFormData.append("video", video);
      }

      // เพิ่ม contest_id (ถ้าเป็นการประกวด)
      if (submissionMode === "compete" && contestId) {
        apiFormData.append("contest_id", contestId);
      }

      const response = await apiService.post("/submissions", apiFormData);
      toast.success("ส่งข้อมูลสำเร็จ!");
      navigate("/history");
    } catch (error) {
      let errorMessage = "เกิดข้อผิดพลาดในการส่งข้อมูล";

      if (error?.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === "string") {
          errorMessage = errorData;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (error?.message) {
        if (error.message.includes("Network Error")) {
          errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
        } else if (error.message.includes("timeout")) {
          errorMessage = "การเชื่อมต่อหมดเวลา กรุณาลองใหม่อีกครั้ง";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageTitle = submissionMode === "compete" ? "ส่งปลากัดเข้าร่วมประกวด" : "ส่งปลากัดเพื่อประเมินคุณภาพ";
  const selectedType = watch("betta_type");

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white py-20 lg:py-28 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-32 right-32 w-60 h-60 bg-white/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="container-responsive relative z-10">
          <div className="max-w-5xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-3 mb-8 px-8 py-4 bg-white/20 hover:bg-white/30 rounded-2xl text-white font-medium transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-white/20"
            >
              <ArrowLeft className="h-5 w-5" />
              กลับหน้าหลัก
            </button>

            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-4 bg-white/15 backdrop-blur-md rounded-full px-8 py-4 mb-8 border border-white/20">
                <div className="bg-white/20 rounded-full p-3">
                  <Fish className="h-8 w-8 text-white" />
                </div>
                <span className="text-xl font-semibold">
                  {submissionMode === "compete" ? "ระบบส่งเข้าประกวด" : "ระบบประเมินคุณภาพปลากัด"}
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight">
                {submissionMode === "compete" ? (
                  <>
                    <span className="block">ส่งปลากัดเข้า</span>
                    <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                      การประกวดระดับมืออาชีพ
                    </span>
                  </>
                ) : (
                  <>
                    <span className="block">ส่งปลากัดเพื่อ</span>
                    <span className="block bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                      ประเมินคุณภาพ
                    </span>
                  </>
                )}
              </h1>
              
              <p className="text-2xl md:text-3xl text-white/95 leading-relaxed max-w-5xl mx-auto font-medium">
                {submissionMode === "compete" ? (
                  <>🏆 แข่งขันระดับมืออาชีพ พร้อมรางวัลมากมาย</>
                ) : (
                  <>📋 ส่งข้อมูลปลากัดของคุณให้ผู้เชี่ยวชาญประเมิน</>
                )}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">อัปโหลดรูปภาพ</h3>
                <p className="text-white/90 leading-relaxed">อัปโหลดรูปภาพปลากัดที่ชัดเจนเพื่อการประเมิน</p>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">ผู้เชี่ยวชาญตรวจสอบ</h3>
                <p className="text-white/90 leading-relaxed">ผู้เชี่ยวชาญมืออาชีพตรวจสอบและให้คำแนะนำ</p>
              </div>
              
              <div className="group bg-white/15 backdrop-blur-md rounded-3xl p-8 border border-white/30 text-center hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Send className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-white">
                  {submissionMode === "compete" ? "รางวัลมากมาย" : "รับผลประเมิน"}
                </h3>
                <p className="text-white/90 leading-relaxed">
                  {submissionMode === "compete" 
                    ? "รางวัลและเกียรติยศสำหรับผู้ชนะ" 
                    : "รับผลการประเมินและคำแนะนำจากผู้เชี่ยวชาญ"
                  }
                </p>
              </div>
            </div>
          </div>

          {contestName && (
            <div className="max-w-4xl mx-auto mt-12">
              <div className="bg-gradient-to-r from-accent-500/20 to-warning-500/20 backdrop-blur-sm border border-accent-400/30 rounded-3xl p-8">
                <div className="flex items-center gap-4">
                  <div className="bg-accent-400 rounded-2xl p-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-2xl mb-2">🏆 การประกวด: {contestName}</h3>
                    <p className="text-white/90 text-lg">คุณกำลังส่งปลากัดเข้าร่วมการประกวดระดับมืออาชีพ</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-b from-blue-800 to-gray-100 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto container-responsive">
          {/* Progress Steps */}
          <div className="mb-16">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">ขั้นตอนการส่งประเมิน</h3>
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">1</div>
                  <span className="text-blue-700 font-semibold text-lg">อัปโหลดรูปภาพ</span>
                </div>
                <div className="w-16 h-2 bg-blue-200 rounded-full">
                  <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">2</div>
                  <span className="text-purple-700 font-semibold text-lg">กรอกข้อมูล</span>
                </div>
                <div className="w-16 h-2 bg-gray-200 rounded-full"></div>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-lg font-bold">3</div>
                  <span className="text-gray-600 font-semibold text-lg">ส่งประเมิน</span>
                </div>
              </div>
            </div>
          </div>

          <div className="betta-card max-w-7xl mx-auto p-8 lg:p-12">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* ซ้าย: อัปโหลดสื่อ */}
              <section className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-primary-100 p-3 rounded-2xl">
                      <Image className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-heading">📸 รูปภาพปลากัด</h3>
                      <p className="text-body">อัปโหลดรูปภาพปลากัดที่ชัดเจน เพื่อให้ AI วิเคราะห์ได้แม่นยำ</p>
                    </div>
                  </div>
                  
                  <div
                    {...getRootPropsImages()}
                    className="relative border-3 border-dashed border-primary-300 rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-primary-500 hover:bg-gradient-to-br hover:from-primary-50 hover:to-secondary-50 group bg-white/50 backdrop-blur-sm"
                  >
                    <input {...getInputPropsImages()} />
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="h-10 w-10 text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-heading mb-3">
                        ลากรูปภาพมาวาง หรือ <span className="text-primary-600">คลิกเพื่อเลือก</span>
                      </h4>
                      <div className="space-y-2">
                        <p className="text-body font-medium">📱 รองรับไฟล์: JPG, PNG, WEBP</p>
                        <p className="text-muted">สูงสุด 3 รูป • ขนาดไม่เกิน 10MB ต่อรูป</p>
                        <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium">
                          <Image className="h-4 w-4" />
                          อัปโหลดรูปที่ชัดเจนเพื่อการประเมิน
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {imagePreviews.length > 0 && (
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold text-heading mb-4 flex items-center gap-2">
                        ✅ รูปภาพที่อัปโหลด ({imagePreviews.length}/3)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {imagePreviews.map((p, i) => (
                          <div key={i} className="relative group bg-white rounded-2xl p-3 shadow-soft hover:shadow-medium transition-all duration-300">
                            <img 
                              src={p.url} 
                              alt={`ปลากัด ${i + 1}`}
                              className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300" 
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(i)}
                              className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-2 shadow-medium hover:bg-error-600 hover:scale-110 transition-all duration-200"
                              aria-label={`ลบรูปที่ ${i + 1}`}
                            >
                              <FaTimes size={14} />
                            </button>
                            <div className="mt-3 text-center">
                              <p className="text-sm font-medium text-muted">รูปที่ {i + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-secondary-100 p-3 rounded-2xl">
                      <Video className="h-6 w-6 text-secondary-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-heading">🎥 วิดีโอปลากัด</h3>
                      <p className="text-body">เพิ่มวิดีโอเพื่อแสดงการเคลื่อนไหว (ไม่บังคับ)</p>
                    </div>
                  </div>
                  
                  <div
                    {...getRootPropsVideo()}
                    className="relative border-3 border-dashed border-secondary-300 rounded-3xl p-10 text-center cursor-pointer transition-all duration-300 hover:border-secondary-500 hover:bg-gradient-to-br hover:from-secondary-50 hover:to-accent-50 group bg-white/50 backdrop-blur-sm"
                  >
                    <input {...getInputPropsVideo()} />
                    <div className="relative z-10">
                      <div className="bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Video className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-heading mb-2">
                        ลากวิดีโอมาวาง หรือ <span className="text-secondary-600">คลิกเพื่อเลือก</span>
                      </h4>
                      <div className="space-y-1">
                        <p className="text-body">📹 รองรับไฟล์: MP4, MOV, AVI</p>
                        <p className="text-muted">ขนาดไม่เกิน 50MB • แสดงการเคลื่อนไหวของปลากัด</p>
                      </div>
                    </div>
                  </div>
                  
                  {videoPreview && (
                    <div className="relative mt-4">
                      <video 
                        src={videoPreview} 
                        controls 
                        className="w-full rounded-xl shadow-medium aspect-video" 
                      />
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute -top-2 -right-2 bg-error-500 text-white rounded-full p-1.5 shadow-medium hover:bg-error-600 transition-colors duration-200"
                        aria-label="ลบวิดีโอนี้"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* ขวา: ฟอร์มข้อมูล */}
              <section className="space-y-8">
                <div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="bg-accent-100 p-3 rounded-2xl">
                      <Fish className="h-6 w-6 text-accent-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-heading">🐠 ข้อมูลปลากัด</h3>
                      <p className="text-body">กรอกข้อมูลรายละเอียดปลากัดของคุณ</p>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-heading mb-2">
                          🏷️ ชื่อปลากัด
                        </label>
                        <input
                          {...register("betta_name", { required: true })}
                          className="form-input-enhanced text-lg"
                          placeholder="กรอกชื่อปลากัดของคุณ เช่น มังกรทอง"
                        />
                        {errors.betta_name && (
                          <p className="form-error flex items-center gap-1">
                            ❌ กรุณากรอกชื่อปลากัด
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-heading mb-2">
                          📅 อายุ (เดือน)
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={120}
                          {...register("betta_age_months")}
                          className="form-input-enhanced text-lg"
                          placeholder="เช่น 8"
                        />
                        <p className="text-xs text-muted">อายุโดยประมาณ (ไม่บังคับ)</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-heading mb-2">
                        🧬 ประเภทปลากัด
                      </label>
                      <select
                        {...register("betta_type", { required: true })}
                        className="form-select-enhanced text-lg"
                        value={selectedType || ""}
                        onChange={(e) => setValue("betta_type", e.target.value, { shouldDirty: true })}
                      >
                        <option value="">🔍 เลือกประเภทปลากัด...</option>
                        {BETTA_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.betta_type && (
                        <p className="form-error flex items-center gap-1">
                          ❌ กรุณาเลือกประเภทปลากัด
                        </p>
                      )}


                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Submit Button */}
            <div className="mt-12 border-t-2 border-gradient-to-r from-primary-200 to-secondary-200 pt-12">
              <div className="text-center mb-8">
                <h4 className="text-xl font-bold text-heading mb-2">
                  {submissionMode === "compete" ? "🏆 พร้อมส่งเข้าประกวดแล้วใช่ไหม?" : "🔍 พร้อมส่งประเมินแล้วใช่ไหม?"}
                </h4>
                <p className="text-body">
                  {submissionMode === "compete" 
                    ? "ปลากัดของคุณจะเข้าร่วมการประกวดระดับมืออาชีพ" 
                    : "AI และผู้เชี่ยวชาญจะประเมินปลากัดของคุณอย่างละเอียด"
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex items-center justify-center gap-3 px-8 py-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-2xl transition-all duration-300 hover:scale-105 border-2 border-neutral-200"
                >
                  <ArrowLeft className="h-5 w-5" />
                  ย้อนกลับ
                </button>
                
                <button
                  type="submit"
                  disabled={isSubmitting || images.length === 0}
                  className="relative flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-large hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg flex-1 sm:flex-none"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                      <span>กำลังส่ง...</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/20 to-secondary-400/20 rounded-2xl animate-pulse"></div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/20 rounded-full p-2">
                        <Send className="h-5 w-5" />
                      </div>
                      <span>
                        {submissionMode === "compete" ? "🏆 ส่งเข้าร่วมประกวด" : "🚀 ส่งประเมินปลากัด"}
                      </span>
                    </>
                  )}
                </button>
              </div>
              
              {images.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-error-600 font-medium flex items-center justify-center gap-2">
                    ⚠️ กรุณาอัปโหลดรูปภาพปลากัดอย่างน้อย 1 รูป
                  </p>
                </div>
              )}
            </div>
          </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BettaEvaluationForm;

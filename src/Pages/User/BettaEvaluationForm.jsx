import React, { useState, useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FaTimes } from "react-icons/fa";
import { Upload, Image, Video, Fish, Calendar, Award, Sparkles, ArrowLeft, Send } from "lucide-react";

import { BETTA_TYPES } from "../../utils/bettaTypes";
import { isUuid } from "../../utils/apiErrorHandler";
import apiService from "../../services/api";
import modelService from "../../services/modelService";

// Environment variables
// const API_BASE = "http://localhost:4000/api"; // Local development API (ยกเลิกการฮาร์ดโค้ด ใช้ proxy /api แทน)
const API_TOPK = Number(import.meta.env.VITE_BETTA_TOPK ?? 3) || 3;
const API_THRESHOLD = Number(import.meta.env.VITE_BETTA_THRESHOLD ?? 0.9) || 0.9;

const BettaEvaluationForm = () => {
  // --- States ---
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisSummary, setAnalysisSummary] = useState(null);
  const [aiSuggestedType, setAiSuggestedType] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);
  const latestAnalysisRef = useRef(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState(null);
  const [showTypeChangeModal, setShowTypeChangeModal] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState(null);

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

  const removeImagesByIndices = useCallback((indices) => {
    if (!indices || indices.length === 0) {
      return;
    }

    const removeSet = new Set(indices);

    setImagePreviews((prev) => {
      const next = [];
      prev.forEach((item, idx) => {
        if (removeSet.has(idx)) {
          try {
            item?.url && URL.revokeObjectURL(item.url);
          } catch {}
        } else {
          next.push(item);
        }
      });
      return next;
    });

    setImages((prev) => prev.filter((_, idx) => !removeSet.has(idx)));
  }, []);

  const analyzeImagesForConsistency = useCallback(async (files) => {
    const runId = ++latestAnalysisRef.current;

    if (!files || files.length === 0) {
      setAnalysisSummary(null);
      setAiSuggestedType(null);
      setAnalysisError(null);
      setAnalysisLoading(false);
      setValue("betta_type", "", { shouldDirty: true });
      return;
    }

    if (files.length < 3) {
      setAnalysisSummary(null);
      setAiSuggestedType(null);
      setAnalysisError("กรุณาอัปโหลดรูปภาพให้ครบ 3 รูปเพื่อให้ AI ตรวจสอบความตรงกัน");
      setAnalysisLoading(false);
      setValue("betta_type", "", { shouldDirty: true });
      return;
    }

    setAnalysisError(null);
    setAnalysisLoading(true);

    try {
      const response = await modelService.analyzeBatchImages(files, { analysis_type: "quality" });
      if (runId !== latestAnalysisRef.current) return;

      const payload = response?.data || response;
      const perImage = payload?.consistency?.per_image || [];
      const inconsistent = payload?.consistency?.inconsistent_indices || [];
      const consensusType = payload?.consensus?.predicted_type || null;
      const successfulCount = payload?.successful_images ?? perImage.filter((item) => item.success).length;

      if (successfulCount !== files.length) {
        const failed = perImage.filter((item) => !item.success).map((item) => item.index);
        if (failed.length) {
          removeImagesByIndices(failed);
          toast.error("บางรูปไม่สามารถวิเคราะห์ได้ ระบบจึงลบรูปนั้นออก กรุณาอัปโหลดใหม่");
        }
        setAnalysisSummary(null);
        setAiSuggestedType(null);
        setValue("betta_type", "", { shouldDirty: true });
        return;
      }

      if (!consensusType) {
        setAnalysisSummary(null);
        setAiSuggestedType(null);
        setValue("betta_type", "", { shouldDirty: true });
        toast.error("ไม่สามารถสรุปประเภทปลากัดได้ กรุณาลองใหม่");
        return;
      }

      if (inconsistent.length > 0) {
        if (inconsistent.length === files.length) {
          setImagePreviews((prev) => {
            prev.forEach((item) => {
              try { item?.url && URL.revokeObjectURL(item.url); } catch {}
            });
            return [];
          });
          setImages([]);
          toast.error("ปลากัดทั้ง 3 รูปไม่ตรงกัน ระบบจึงลบรูปทั้งหมด กรุณาอัปโหลดใหม่ให้เป็นประเภทเดียวกัน");
        } else {
          const displayNumbers = inconsistent.map((i) => i + 1).join(", ");
          removeImagesByIndices(inconsistent);
          toast.error(`รูปภาพหมายเลข ${displayNumbers} ไม่เป็นประเภทเดียวกัน ระบบจึงลบออก กรุณาอัปโหลดใหม่ให้เป็นประเภทเดียวกันทั้งหมด`);
        }
        setAnalysisSummary(null);
        setAiSuggestedType(null);
        setValue("betta_type", "", { shouldDirty: true });
        return;
      }

      const confidences = files.map((_, idx) => {
        const entry = perImage.find((item) => item.index === idx);
        const raw = Number(entry?.confidence ?? 0);
        return Number.isFinite(raw) ? Math.max(0, raw) : 0;
      });
      const sumConfidence = confidences.reduce((sum, value) => sum + value, 0);
      const normalizedPercents = confidences.map((value) => {
        if (sumConfidence > 0) {
          return (value / sumConfidence) * 100;
        }
        return files.length ? 100 / files.length : 0;
      });
      const averageConfidence = confidences.length
        ? sumConfidence / confidences.length
        : Number(payload?.consensus?.confidence ?? 0);
      const bettaInfo = BETTA_TYPES.find((opt) => opt.value === consensusType);

      if (!bettaInfo) {
        setAnalysisSummary(null);
        setAiSuggestedType(null);
        setValue("betta_type", "", { shouldDirty: true });
        const warnMsg = "AI ไม่มั่นใจว่าเป็นปลากัดประเภทใด กรุณาเลือกประเภทด้วยตนเองหรืออัปโหลดรูปใหม่";
        setAnalysisError(warnMsg);
        toast.warn(warnMsg);
        return;
      }

      setAnalysisSummary({
        code: consensusType,
        name: bettaInfo.label,
        confidence: Number.isFinite(averageConfidence) ? Math.min(1, Math.max(0, averageConfidence)) : 0,
        normalizedPercents,
      });
      setAiSuggestedType(consensusType);
      setAnalysisError(null);
      setValue("betta_type", consensusType, { shouldValidate: true, shouldDirty: false });
    } catch (error) {
      if (runId !== latestAnalysisRef.current) return;
      console.error("Error analyzing images:", error);
      setAnalysisSummary(null);
      setAiSuggestedType(null);
      setValue("betta_type", "", { shouldDirty: true });
      const message = error?.message?.includes("เซสชัน")
        ? "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่เพื่อใช้งานการวิเคราะห์"
        : "ไม่สามารถวิเคราะห์รูปภาพได้ กรุณาลองใหม่อีกครั้ง";
      setAnalysisError(message);
      toast.error(message);
    } finally {
      if (runId === latestAnalysisRef.current) {
        setAnalysisLoading(false);
      }
    }
  }, [removeImagesByIndices, setValue]);

  useEffect(() => {
    analyzeImagesForConsistency(images);
  }, [images, analyzeImagesForConsistency]);

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

  const [videoPreview, setVideoPreview] = useState(null);

  useEffect(() => {
    if (video) {
      const url = URL.createObjectURL(video);
      setVideoPreview(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoPreview(null);
    }
  }, [video]);

  // ย้ายการสร้าง URL ไปทำเฉพาะตอน drop และลบตอน remove/unmount เพื่อลดโอกาส revoke เร็วเกินไป
  const onDropImages = (acceptedFiles) => {
    if (images.length + acceptedFiles.length > 3) {
      toast.info("อัปโหลดได้สูงสุด 3 รูปภาพเท่านั้น");
    }

    const newFiles = [...images, ...acceptedFiles].slice(0, 3);
    const added = acceptedFiles.slice(0, Math.max(0, 3 - images.length));
    const newPreviews = added.map((f) => ({ file: f, url: URL.createObjectURL(f) }));

    setImages(newFiles);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
    setAnalysisSummary(null);
    setAiSuggestedType(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
    setShowTypeChangeModal(false);
    setPendingTypeChange(null);
  };

  const onDropVideo = (acceptedFiles) => setVideo(acceptedFiles[0]);

  const removeImage = (index) => {
    setImagePreviews((prev) => {
      const target = prev[index];
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
    setImages((prev) => prev.filter((_, i) => i !== index));
    setAnalysisSummary(null);
    setAiSuggestedType(null);
    setAnalysisError(null);
    setAnalysisLoading(false);
    setShowTypeChangeModal(false);
    setPendingTypeChange(null);
  };
  const removeVideo = () => setVideo(null);

  useEffect(() => {
    // cleanup เมื่อ component ถูกถอด เพื่อไม่ให้รั่วหน่วยความจำ
    return () => {
      try {
        imagePreviews.forEach((p) => p?.url && URL.revokeObjectURL(p.url));
      } catch {}
    };
  }, [imagePreviews]);

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

  const validateBeforeSubmit = (formData) => {
    if (!formData.betta_type) {
      toast.error("กรุณาเลือกประเภทปลากัด");
      return false;
    }

    if (images.length !== 3) {
      toast.error("กรุณาอัปโหลดรูปภาพปลากัดให้ครบ 3 รูปก่อนส่งประเมิน");
      return false;
    }

    if (!analysisSummary) {
      toast.error("กรุณาให้ระบบ AI ตรวจสอบและยืนยันรูปภาพทั้ง 3 รูปให้เรียบร้อยก่อนส่งประเมิน");
      return false;
    }

    return true;
  };

  const submitForm = async (formData) => {
    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("betta_name", formData.betta_name);
      apiFormData.append("betta_type", formData.betta_type);
      if (formData.betta_age_months) {
        apiFormData.append("betta_age_months", String(formData.betta_age_months));
      }

      images.forEach((image) => {
        apiFormData.append("images", image);
      });

      if (video) {
        apiFormData.append("video", video);
      }

      if (submissionMode === "compete" && contestId) {
        apiFormData.append("contest_id", contestId);
      }

      await apiService.post("/submissions", apiFormData);
      toast.success("ส่งข้อมูลสำเร็จ!");
      setShowConfirmModal(false);
      setPendingFormData(null);
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

  const requestSubmit = (formData) => {
    if (!validateBeforeSubmit(formData)) return;
    setPendingFormData(formData);
    setShowConfirmModal(true);
  };

  const confirmSubmit = () => {
    if (!pendingFormData || isSubmitting) return;
    submitForm(pendingFormData);
  };

  const cancelConfirm = () => {
    if (isSubmitting) return;
    setShowConfirmModal(false);
    setPendingFormData(null);
  };

  const selectedType = watch("betta_type");
  const bettaTypeField = register("betta_type", { required: true });

  const handleBettaTypeChange = (event, defaultOnChange) => {
    const nextType = event.target.value;
    const currentType = selectedType || "";

    if (!nextType) {
      defaultOnChange(event);
      return;
    }

    if (aiSuggestedType && nextType !== aiSuggestedType) {
      setPendingTypeChange(nextType);
      setShowTypeChangeModal(true);
      // Revert to current value (AI suggestion) until user confirms
      setValue("betta_type", currentType, { shouldDirty: false });
      return;
    }

    defaultOnChange(event);
  };

  const confirmTypeChange = () => {
    if (!pendingTypeChange) return;
    setValue("betta_type", pendingTypeChange, { shouldDirty: true, shouldValidate: true });
    setPendingTypeChange(null);
    setShowTypeChangeModal(false);
  };

  const cancelTypeChange = () => {
    setPendingTypeChange(null);
    setShowTypeChangeModal(false);
  };

  const isReadyForSubmission = images.length === 3 && !!analysisSummary;

  return (
    <>
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
            <form onSubmit={handleSubmit(requestSubmit)} className="space-y-12">
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
                        <p className="text-muted">ต้องอัปโหลดครบ 3 รูป • ชัดเจน • ประเภทต้องตรงกันทั้งหมด</p>
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

                  {images.length === 3 && analysisLoading && (
                    <div className="mt-6 p-6 rounded-2xl bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-400 border-t-transparent"></div>
                      AI กำลังตรวจสอบความตรงกันของรูปภาพทั้ง 3 รูป กรุณารอสักครู่...
                    </div>
                  )}

                  {!!analysisError && !analysisLoading && (
                    <div className="mt-6 p-6 rounded-2xl bg-error-50 border border-error-200 text-error-700 text-sm font-medium">
                      {analysisError}
                    </div>
                  )}

                  {analysisSummary && !analysisLoading && (
                    <div className="mt-6 p-6 rounded-2xl bg-green-50 border border-green-200 text-green-800">
                      <h4 className="text-lg font-semibold flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-green-500" />
                        ผลวิเคราะห์จาก AI (รวม 3 รูปภาพ)
                      </h4>
                      <p className="text-sm md:text-base mb-4 leading-relaxed">
                        AI สรุปว่าปลากัดของคุณเป็น <span className="font-bold">{analysisSummary.name}</span> ด้วยความมั่นใจรวม
                        <span className="font-semibold"> {(analysisSummary.confidence * 100).toFixed(1)}%</span>
                      </p>
                      <div className="flex flex-col items-center gap-2">
                        <div className="relative w-40 h-40 flex items-center justify-center rounded-full bg-white shadow-inner">
                          <div className="text-3xl font-bold text-green-700">
                            {(analysisSummary.confidence * 100).toFixed(1)}%
                          </div>
                        </div>
                        <p className="text-xs text-muted text-center">
                          ระบบตรวจสอบความตรงกันของทั้ง 3 รูปภาพแล้ว และลบรูปที่ไม่ตรงประเภทโดยอัตโนมัติหากพบความคลาดเคลื่อน
                        </p>
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
                        name={bettaTypeField.name}
                        ref={bettaTypeField.ref}
                        onBlur={bettaTypeField.onBlur}
                        className="form-select-enhanced text-lg"
                        value={selectedType || ""}
                        onChange={(event) => handleBettaTypeChange(event, bettaTypeField.onChange)}
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

            {/* Submit Section */}
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
                  disabled={isSubmitting || !isReadyForSubmission}
                  className="relative flex items-center justify-center gap-3 px-12 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-large hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-lg flex-1 sm:flex-none"
                >
                  <div className="bg-white/20 rounded-full p-2">
                    <Send className="h-5 w-5" />
                  </div>
                  <span>
                    {submissionMode === "compete" ? "🏆 ส่งเข้าร่วมประกวด" : "🚀 ส่งประเมินปลากัด"}
                  </span>
                </button>
              </div>
              
              {images.length !== 3 && (
                <div className="mt-6 text-center">
                  <p className="text-error-600 font-medium flex items-center justify-center gap-2">⚠️ กรุณาอัปโหลดรูปภาพปลากัดให้ครบ 3 รูป</p>
                </div>
              )}

              {images.length === 3 && !analysisLoading && !analysisSummary && (
                <div className="mt-6 text-center">
                  <p className="text-amber-600 font-medium flex items-center justify-center gap-2">⚠️ กรุณารอให้ AI ตรวจสอบรูปภาพทั้ง 3 รูปให้เรียบร้อยก่อนส่ง</p>
                </div>
              )}
            </div>
          </form>
          </div>
        </div>
      </div>
    </main>

    {showTypeChangeModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="type-change-title"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-secondary-500" />
            <h3 id="type-change-title" className="text-lg font-bold text-heading">ยืนยันการเปลี่ยนประเภทปลากัด</h3>
          </div>
          <p className="text-sm text-body">
            AI แนะนำประเภท <span className="font-semibold">{analysisSummary?.name}</span> แต่คุณเลือกประเภทอื่น
            ท่านต้องการยืนยันการเปลี่ยนแปลงประเภทปลากัดหรือไม่?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={cancelTypeChange}
              className="px-5 py-2.5 rounded-2xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition"
            >
              ไม่
            </button>
            <button
              type="button"
              onClick={confirmTypeChange}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-secondary-500 to-accent-500 text-white font-semibold hover:from-secondary-600 hover:to-accent-600 transition"
            >
              ใช่
            </button>
          </div>
        </div>
      </div>
    )}

    {showConfirmModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 space-y-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-submit-title"
        >
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-primary-500" />
            <h3 id="confirm-submit-title" className="text-xl font-bold text-heading">ยืนยันการส่งประเมินปลากัด</h3>
          </div>

          <p className="text-body text-sm">
            ระบบจะส่งข้อมูลปลากัด ประเภท:{analysisSummary.name} ของคุณให้ผู้เชี่ยวชาญ ทำการประเมินทันทีหลังจากกดยืนยัน คุณต้องการดำเนินการต่อหรือไม่?
          </p>

          {analysisSummary && (
            <div className="bg-primary-50 border border-primary-200 rounded-2xl p-4 text-primary-700 text-sm space-y-1">
              <p><span className="font-semibold">ประเภท:</span> {analysisSummary.name}</p>
              {pendingFormData?.betta_name && (
                <p><span className="font-semibold">ชื่อปลากัด:</span> {pendingFormData.betta_name}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              type="button"
              onClick={cancelConfirm}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl border border-neutral-200 text-neutral-700 hover:bg-neutral-100 transition disabled:opacity-60"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={confirmSubmit}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:from-primary-600 hover:to-secondary-600 transition disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>กำลังส่ง...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>ยืนยันการส่ง</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default BettaEvaluationForm;

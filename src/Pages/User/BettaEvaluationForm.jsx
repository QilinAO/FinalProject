import React, {
  useState,
  useEffect,
  useMemo
} from "react";
import {
  useForm
} from "react-hook-form";
import {
  useDropzone
} from "react-dropzone";
import {
  FaTimes
} from "react-icons/fa";
import {
  toast
} from "react-toastify";
import {
  useLocation,
  useNavigate
} from "react-router-dom";
import {
  submitBettaForEvaluation,
  submitBettaForCompetition
} from "../../services/userService";
import apiService from "../../services/api";
import {
  BETTA_TYPES
} from "../../utils/bettaTypes";

const isUuid = (v) =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

const BettaEvaluationForm = () => {
  const {
    register,
    handleSubmit,
    formState: {
      errors
    },
    reset
  } = useForm();
  const location = useLocation();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contestId = location.state?.defaultContestId || null;
  const submissionMode = contestId ? "compete" : "evaluate";
  const [contestName, setContestName] = useState("");

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

  const imagePreviews = useMemo(() => images.map((f) => ({
    file: f,
    url: URL.createObjectURL(f)
  })), [images]);
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

  const {
    getRootProps: getRootPropsImages,
    getInputProps: getInputPropsImages
  } = useDropzone({
    onDrop: onDropImages,
    accept: {
      "image/*": []
    },
    multiple: true
  });
  const {
    getRootProps: getRootPropsVideo,
    getInputProps: getInputPropsVideo
  } = useDropzone({
    onDrop: onDropVideo,
    accept: {
      "video/*": []
    },
    multiple: false
  });

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));
  const removeVideo = () => setVideo(null);

  const onSubmit = async (formData) => {
    if (images.length === 0) {
      return toast.error("กรุณาอัปโหลดรูปภาพอย่างน้อย 1 รูป");
    }
    if (!formData.betta_type) {
      return toast.error("กรุณาเลือกประเภทปลากัด");
    }

    setIsSubmitting(true);
    try {
      const apiFormData = new FormData();
      apiFormData.append("betta_name", formData.betta_name);
      apiFormData.append("betta_type", formData.betta_type);
      if (formData.betta_age_months) {
        apiFormData.append("betta_age_months", String(formData.betta_age_months));
      }
      images.forEach((imageFile) => apiFormData.append("images", imageFile));
      if (video) apiFormData.append("video", video);

      if (submissionMode === "compete") {
        apiFormData.append("contest_id", contestId);
        await submitBettaForCompetition(apiFormData);
      } else {
        await submitBettaForEvaluation(apiFormData);
      }

      toast.success("ส่งแบบฟอร์มสำเร็จ!");
      reset();
      setImages([]);
      setVideo(null);
      navigate("/history");
    } catch (error) {
      console.error('Submission error:', error);
      
      // จัดการ error ตาม response structure ของ backend
      let errorMessage = "เกิดข้อผิดพลาดในการส่งแบบฟอร์ม";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        
        // ถ้ามี details (validation errors)
        if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.map(d => d.message).join(', ');
        }
        // ถ้ามี error message โดยตรง
        else if (errorData.error) {
          errorMessage = errorData.error;
        }
        // ถ้ามี message
        else if (errorData.message) {
          errorMessage = errorData.message;
        }
      }
      // ถ้าเป็น network error หรือ error อื่นๆ
      else if (error?.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต";
        } else if (error.message.includes('timeout')) {
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

  const pageTitle = submissionMode === "compete" ?
    "ส่งปลากัดเข้าร่วมประกวด" :
    "ส่งปลากัดเพื่อประเมินคุณภาพ";

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-gradient-to-br from-purple-200 via-pink-200 to-red-200"
        aria-hidden="true"
      />
      <main className="relative min-h-screen">
        <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8 sm:pb-10 lg:pb-12">
          <div className="w-full bg-white/90 backdrop-blur rounded-2xl shadow-lg">
            <div className="p-4 sm:p-6 lg:p-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 sm:mb-6 md:mb-8 text-purple-700">
                {pageTitle}
              </h2>

              {contestName && (
                <div className="text-center mb-6 sm:mb-8 p-3 sm:p-4 bg-purple-100 rounded-lg">
                  <p className="font-semibold text-purple-800 text-sm sm:text-base">
                    การประกวด: {contestName}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8">
                  <section className="lg:col-span-2">
                    <div>
                      <label className="font-semibold text-gray-800 block">
                        รูปภาพ (สูงสุด 3 รูป):
                      </label>
                      <div
                        {...getRootPropsImages()}
                        className="mt-1 border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors hover:border-purple-300"
                      >
                        <input {...getInputPropsImages()} />
                        <p className="text-sm sm:text-base text-gray-600">
                          ลากไฟล์มาวาง หรือ{" "}
                          <span className="font-semibold text-purple-700">
                            คลิกเพื่อเลือก
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          รองรับไฟล์รูปภาพ รวมได้ไม่เกิน 3 รูป
                        </p>
                      </div>
                      {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mt-3">
                          {imagePreviews.map((p, i) => (
                            <div key={i} className="relative group">
                              <img
                                src={p.url}
                                alt="preview"
                                className="w-full aspect-square object-cover rounded-lg shadow"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                aria-label="ลบรูปนี้"
                              >
                                <FaTimes size={10} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-5">
                      <label className="font-semibold text-gray-800 block">
                        วิดีโอ (ถ้ามี):
                      </label>
                      <div
                        {...getRootPropsVideo()}
                        className="mt-1 border-2 border-dashed rounded-xl p-4 sm:p-5 text-center cursor-pointer transition-colors hover:border-purple-300"
                      >
                        <input {...getInputPropsVideo()} />
                        <p className="text-sm sm:text-base text-gray-600">
                          ลากไฟล์มาวาง หรือ{" "}
                          <span className="font-semibold text-purple-700">
                            คลิกเพื่อเลือก
                          </span>
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          รองรับไฟล์วิดีโอ 1 ไฟล์
                        </p>
                      </div>
                      {videoPreview && (
                        <div className="relative mt-3">
                          <video
                            src={videoPreview}
                            controls
                            className="w-full rounded-lg shadow aspect-video"
                          />
                          <button
                            type="button"
                            onClick={removeVideo}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                            aria-label="ลบวิดีโอนี้"
                          >
                            <FaTimes size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="lg:col-span-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="font-semibold">ชื่อปลากัด:</label>
                        <input
                          {...register("betta_name", { required: true })}
                          className="w-full p-2.5 sm:p-3 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                        {errors.betta_name && (
                          <span className="text-red-500 text-sm">
                            กรุณากรอกชื่อปลากัด
                          </span>
                        )}
                      </div>
                      <div>
                        <label className="font-semibold">อายุ (เดือน):</label>
                        <input
                          type="number"
                          min={0}
                          {...register("betta_age_months")}
                          className="w-full p-2.5 sm:p-3 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="font-semibold">ประเภทปลากัด:</label>
                      <select
                        {...register("betta_type", { required: true })}
                        className="w-full p-2.5 sm:p-3 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                        defaultValue=""
                      >
                        <option value="">-- เลือกประเภท --</option>
                        {BETTA_TYPES.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.betta_type && (
                        <span className="text-red-500 text-sm">
                          กรุณาเลือกประเภท
                        </span>
                      )}
                    </div>
                  </section>
                </div>

                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                    className="w-full sm:w-auto sm:min-w-48 bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 font-bold disabled:bg-purple-300 shadow"
                  >
                    {isSubmitting ? "กำลังส่ง..." : "ส่งแบบฟอร์ม"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default BettaEvaluationForm;
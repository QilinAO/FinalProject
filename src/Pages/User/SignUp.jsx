// ======================================================================
// File: src/Pages/User/SignUp.jsx
// หน้าที่: จัดการฟอร์มการสมัครสมาชิกสำหรับผู้ใช้ใหม่
// ======================================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { LoaderCircle } from "lucide-react";
import { signupUser } from "../../services/authService";

/**
 * Component สำหรับ Input Field ที่ใช้ซ้ำได้ พร้อมการแสดง Error
 */
const InputField = ({ id, label, type = "text", register, error, validationRules }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div>
      <label htmlFor={id} className="block mb-1 font-medium text-gray-700">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          {...register(id, validationRules)}
          className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 transition ${
            error ? "border-red-500 ring-red-200" : "border-gray-300 focus:ring-purple-500"
          }`}
        />
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            onClick={() => setShowPassword(p => !p)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
};

/**
 * Component หลักสำหรับหน้าสมัครสมาชิก
 */
const SignUp = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onBlur" });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...signupData } = data;
      await signupUser(signupData);
      toast.success("สมัครสมาชิกสำเร็จ! กำลังนำท่านไปหน้าเข้าสู่ระบบ...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-red-200 p-4">
      <div className="w-full max-w-lg bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-purple-700">สร้างบัญชีใหม่</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              id="firstName"
              label="ชื่อ"
              register={register}
              error={errors.firstName}
              validationRules={{ required: "กรุณากรอกชื่อ" }}
            />
            <InputField
              id="lastName"
              label="นามสกุล"
              register={register}
              error={errors.lastName}
              validationRules={{ required: "กรุณากรอกนามสกุล" }}
            />
          </div>
          <InputField
            id="username"
            label="ชื่อผู้ใช้"
            register={register}
            error={errors.username}
            validationRules={{
              required: "กรุณากรอกชื่อผู้ใช้",
              minLength: { value: 3, message: "ต้องมีอย่างน้อย 3 ตัวอักษร" },
            }}
          />
          <InputField
            id="email"
            label="อีเมล"
            type="email"
            register={register}
            error={errors.email}
            validationRules={{
              required: "กรุณากรอกอีเมล",
              pattern: { value: /^\S+@\S+$/i, message: "รูปแบบอีเมลไม่ถูกต้อง" },
            }}
          />
          <InputField
            id="password"
            label="รหัสผ่าน"
            type="password"
            register={register}
            error={errors.password}
            validationRules={{
              required: "กรุณากรอกรหัสผ่าน",
              minLength: { value: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" },
            }}
          />
          <InputField
            id="confirmPassword"
            label="ยืนยันรหัสผ่าน"
            type="password"
            register={register}
            error={errors.confirmPassword}
            validationRules={{
              required: "กรุณายืนยันรหัสผ่าน",
              validate: value => value === password || "รหัสผ่านไม่ตรงกัน",
            }}
          />
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition disabled:bg-purple-300 flex items-center justify-center"
          >
            {isSubmitting && <LoaderCircle className="animate-spin mr-2" />}
            {isSubmitting ? "กำลังดำเนินการ..." : "สมัครสมาชิก"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-gray-600">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="text-purple-600 hover:underline font-medium">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
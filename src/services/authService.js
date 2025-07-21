// my-project/src/services/authService.js (ฉบับแก้ไข)
import apiService from './api';

const TOKEN_KEY = 'authToken';

// --- Core Authentication Functions ---

export const loginUser = async (email, password) => {
  try {
    // apiService.post จะคืนค่า response.data มาโดยตรง
    const response = await apiService.post('/auth/signin', { email, password });

    // [แก้ไข] ดึง token และ profile จากโครงสร้างใหม่ที่ Backend ส่งมา
    const token = response?.token;
    const profile = response?.profile;

    if (token && profile) {
      // บันทึก Token และ Profile ลงใน Local Storage
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('user_profile', JSON.stringify(profile));
      
      // คืนค่า profile เพื่อให้ AuthContext และหน้า Login นำไปใช้ต่อได้
      return { profile }; 
    } else {
      // กรณีที่ Backend ไม่ได้ส่ง token หรือ profile มาให้
      throw new Error('การตอบกลับจากเซิร์ฟเวอร์ไม่ถูกต้อง');
    }
  } catch (error) {
    // หากเกิดข้อผิดพลาดใดๆ ให้เคลียร์ข้อมูลเก่าทิ้งทั้งหมดเพื่อความปลอดภัย
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user_profile');
    throw error; // ส่งต่อ error ให้ส่วนที่เรียกใช้ (เช่น หน้า Login) จัดการ
  }
};

export const signupUser = (userData) => {
  // ฟังก์ชันนี้เรียกใช้ api ที่ถูกต้องอยู่แล้ว ไม่ต้องแก้ไข
  return apiService.post('/auth/signup', userData);
};

export const signoutUser = async () => {
  try {
    // เราไม่จำเป็นต้องรอ (await) การเรียก API นี้ก็ได้
    // เพราะหัวใจของการ Logout คือการลบ Token ฝั่ง Client
    apiService.post('/auth/signout');
  } catch (error) {
    // ไม่ต้องจัดการ error แบบจริงจัง เพราะยังไงก็จะลบ token อยู่ดี
    console.error('Signout API error (This can often be ignored):', error);
  } finally {
    // สำคัญที่สุด: ลบ Token และ Profile ออกจาก Local Storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('user_profile');
  }
};


// --- Helper Functions: อ่านสถานะจาก Local Storage ---

// เช็คว่ามี Token ในเครื่องหรือไม่
export const isAuthenticated = () => !!localStorage.getItem(TOKEN_KEY);

// ดึงข้อมูล Profile ที่เก็บไว้
export const getStoredUserProfile = () => {
  try {
    const profileString = localStorage.getItem('user_profile');
    return profileString ? JSON.parse(profileString) : null;
  } catch (e) {
    return null; // ถ้าข้อมูลใน local storage ไม่ใช่ JSON ที่ถูกต้อง
  }
};
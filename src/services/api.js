// D:\ProJectFinal\Lasts\my-project\src\services\api.js (ฉบับแก้ไขถาวร)

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('authToken');
    const headers = { ...options.headers };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { ...options, headers };

    if (options.body && !(options.body instanceof FormData)) {
        config.headers['Content-Type'] = 'application/json';
        config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      
      // =================================================================
      // ▼▼▼ [ เพิ่ม Logic การตรวจสอบ Token ที่นี่ ] ▼▼▼
      // =================================================================
      if (response.status === 401 || response.status === 403) {
        // ถ้าได้รับสถานะ 401 (Unauthorized) หรือ 403 (Forbidden)
        // แสดงว่า Token ไม่ถูกต้อง หรือหมดอายุ
        
        console.error('Authentication Error: Token is invalid or expired. Redirecting to login.');
        
        // 1. เคลียร์ข้อมูลการ Login เก่าทิ้งทั้งหมด
        localStorage.removeItem('authToken');
        localStorage.removeItem('user_profile');
        
        // 2. ส่งผู้ใช้กลับไปที่หน้า Login โดยอัตโนมัติ
        // ใช้ window.location.href เพื่อให้เกิดการ Hard Refresh และเคลียร์ State ทั้งหมดของ React
        window.location.href = '/login';
        
        // 3. โยน Error เพื่อหยุดการทำงานส่วนที่เหลือ และแสดงข้อความให้ผู้ใช้ทราบ
        throw new Error('เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่'); 
      }
      // =================================================================
      // ▲▲▲ [ จบส่วนที่เพิ่ม ] ▲▲▲
      // =================================================================

      if (response.status === 204) return null;
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์');
      }

      return data;
    } catch (error) {
      // ส่วนนี้จะแสดง Error ใน Console log
      console.error(`API Error on ${endpoint}:`, error);
      // ส่งต่อ Error ไปให้ Component ที่เรียกใช้ (เช่น .catch(err => toast.error(err.message)))
      throw error; 
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, { method: 'POST', body: data, ...options });
  }

  put(endpoint, data) {
    return this.request(endpoint, { method: 'PUT', body: data });
  }
  
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

export default new ApiService();
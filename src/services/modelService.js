// ======================================================================
// File: src/services/modelService.js
// หน้าที่: Service สำหรับเรียกใช้ Model API ผ่าน Backend
// ======================================================================

import apiService from './api';
import { toast } from 'react-toastify';

class ModelService {
  
  /**
   * วิเคราะห์รูปภาพปลากัดเดี่ยว
   * @param {File} imageFile - ไฟล์รูปภาพ
   * @param {Object} metadata - ข้อมูลเพิ่มเติม
   * @returns {Promise<Object>} ผลการวิเคราะห์
   */
  async analyzeSingleImage(imageFile, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      
      if (metadata.betta_type) {
        formData.append('betta_type', metadata.betta_type);
      }
      if (metadata.betta_age_months) {
        formData.append('betta_age_months', metadata.betta_age_months.toString());
      }
      if (metadata.analysis_type) {
        formData.append('analysis_type', metadata.analysis_type);
      }

      const response = await apiService.post('/model/analyze-single', formData, {
        // อย่าตั้ง Content-Type เอง ให้ browser กำหนด boundary อัตโนมัติ
        timeoutMs: 60000 // 60 วินาที
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing single image:', error);
      
      // แสดง error message ที่เหมาะสม
      if (error.status === 400) {
        toast.error('ข้อมูลรูปภาพไม่ถูกต้อง');
      } else if (error.status === 413) {
        toast.error('รูปภาพมีขนาดใหญ่เกินไป');
      } else if (error.status === 0 || /timeout|หมดเวลา/i.test(error.message || '')) {
        toast.error('การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่');
      } else {
        toast.error('ไม่สามารถวิเคราะห์รูปภาพได้ในขณะนี้');
      }
      
      throw error;
    }
  }

  /**
   * วิเคราะห์หลายรูปภาพพร้อมกัน
   * @param {File[]} imageFiles - อาร์เรย์ของไฟล์รูปภาพ
   * @param {Object} metadata - ข้อมูลเพิ่มเติม
   * @returns {Promise<Object>} ผลการวิเคราะห์รวม
   */
  async analyzeBatchImages(imageFiles, metadata = {}) {
    try {
      const formData = new FormData();
      
      // เพิ่มรูปภาพทั้งหมด
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });
      
      if (metadata.betta_type) {
        formData.append('betta_type', metadata.betta_type);
      }
      if (metadata.betta_age_months) {
        formData.append('betta_age_months', metadata.betta_age_months.toString());
      }
      if (metadata.analysis_type) {
        formData.append('analysis_type', metadata.analysis_type);
      }

      const response = await apiService.post('/model/analyze-batch', formData, {
        timeoutMs: 90000 // 90 วินาที สำหรับหลายรูป
      });

      return response.data;
    } catch (error) {
      console.error('Error analyzing batch images:', error);
      
      if (error.status === 400) {
        toast.error('ข้อมูลรูปภาพไม่ถูกต้อง');
      } else if (error.status === 413) {
        toast.error('รูปภาพมีขนาดใหญ่เกินไป');
      } else if (error.status === 0 || /timeout|หมดเวลา/i.test(error.message || '')) {
        toast.error('การวิเคราะห์ใช้เวลานานเกินไป กรุณาลองใหม่');
      } else {
        toast.error('ไม่สามารถวิเคราะห์รูปภาพได้ในขณะนี้');
      }
      
      throw error;
    }
  }

  /**
   * ตรวจสอบสถานะ Model API
   * @returns {Promise<Object>} สถานะของ Model API
   */
  async checkModelHealth() {
    try {
      const response = await apiService.get('/model/health');
      return response.data;
    } catch (error) {
      console.error('Error checking model health:', error);
      return {
        available: false,
        status: 0,
        message: 'Cannot connect to model API'
      };
    }
  }

  /**
   * ดึงประวัติการวิเคราะห์
   * @param {string} submissionId - ID ของการส่ง
   * @returns {Promise<Object>} ประวัติการวิเคราะห์
   */
  async getAnalysisHistory(submissionId) {
    try {
      const response = await apiService.get(`/model/analysis/${submissionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting analysis history:', error);
      toast.error('ไม่สามารถดึงประวัติการวิเคราะห์ได้');
      throw error;
    }
  }

  /**
   * แปลงผลการวิเคราะห์เป็นรูปแบบที่แสดงใน UI
   * @param {Object} analysisResult - ผลการวิเคราะห์
   * @returns {Object|null} ข้อมูลสำหรับแสดงใน UI หรือ null ถ้าไม่มีข้อมูล
   */
  formatAnalysisForUI(analysisResult) {
    // ตรวจสอบข้อมูลพื้นฐาน
    if (!analysisResult) {
      console.warn('formatAnalysisForUI: analysisResult is null/undefined');
      return null;
    }

    // ตรวจสอบโครงสร้างข้อมูล
    if (!analysisResult.data && !analysisResult.analysis) {
      console.warn('formatAnalysisForUI: Invalid analysis result structure:', analysisResult);
      return null;
    }

    // ใช้ data หรือ analysis ตามที่มี
    const analysis = analysisResult.data || analysisResult.analysis || {};
    const metadata = analysisResult.metadata || {};
    
    return {
      score: analysis.overall_score || analysis.score || 0,
      grade: analysis.quality_grade || analysis.grade || 'C',
      confidence: Math.round((analysis.confidence || 0) * 100),
      suggestions: analysis.suggestions || [],
      detailedScores: analysis.detailed_scores || {},
      processingTime: analysis.processing_time || 0,
      isFallback: metadata?.is_fallback || false,
      analyzedAt: metadata?.analyzed_at || new Date().toISOString()
    };
  }

  /**
   * เรียกใช้ AI analysis ในหน้าส่งปลากัดประเมิน
   * @param {Object} formData - ข้อมูลจากฟอร์ม
   * @param {File[]} images - รูปภาพ
   * @returns {Promise<Object>} ผลการวิเคราะห์
   */
  async analyzeForEvaluation(formData, images) {
    // บังคับให้โหมดประเมินคุณภาพ (evaluate) วิเคราะห์เฉพาะรูปแรกเสมอ
    const metadata = {
      betta_type: formData?.betta_type,
      betta_age_months: formData?.betta_age_months ? parseInt(formData.betta_age_months) : null,
      analysis_type: 'quality'
    };
    if (!images || images.length === 0) return null;
    return await this.analyzeSingleImage(images[0], metadata);
  }

  /**
   * เรียกใช้ AI analysis ในหน้าแข่งขันปลากัด
   * @param {Object} formData - ข้อมูลจากฟอร์ม
   * @param {File[]} images - รูปภาพ
   * @returns {Promise<Object>} ผลการวิเคราะห์
   */
  async analyzeForCompetition(formData, images) {
    const metadata = {
      betta_type: formData.betta_type,
      betta_age_months: formData.betta_age_months ? parseInt(formData.betta_age_months) : null,
      analysis_type: 'competition'
    };

    if (images.length === 1) {
      return await this.analyzeSingleImage(images[0], metadata);
    } else {
      return await this.analyzeBatchImages(images, metadata);
    }
  }
}

const modelService = new ModelService();
export default modelService;

import React, { useState, useEffect } from 'react';
import { Save, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import * as expertService from '../../services/expertService';

const SpecialitiesManagement = () => {
  const [specialities, setSpecialities] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSpeciality, setNewSpeciality] = useState('');

  // Betta fish types mapping
  const bettaTypeOptions = [
    { value: 'halfmoon', label: 'ปลากัดหางพระจันทร์ (Halfmoon)' },
    { value: 'crowntail', label: 'ปลากัดหางมงกุฎ (Crowntail)' },
    { value: 'plakat', label: 'ปลากัดพลัด (Plakat)' },
    { value: 'veiltail', label: 'ปลากัดหางม่าน (Veiltail)' },
    { value: 'double_tail', label: 'ปลากัดหางคู่ (Double Tail)' },
    { value: 'delta', label: 'ปลากัดหางเดลต้า (Delta)' },
    { value: 'super_delta', label: 'ปลากัดหางซุปเปอร์เดลต้า (Super Delta)' },
    { value: 'rosetail', label: 'ปลากัดหางกุหลาบ (Rosetail)' },
    { value: 'feathertail', label: 'ปลากัดหางขนนก (Feathertail)' },
    { value: 'elephant_ear', label: 'ปลากัดหูช้าง (Elephant Ear)' },
    // Traditional Thai varieties
    { value: 'ปลากัดพื้นบ้านภาคกลางและเหนือ', label: 'ปลากัดพื้นบ้านภาคกลางและเหนือ' },
    { value: 'ปลากัดพื้นบ้านภาคอีสาน', label: 'ปลากัดพื้นบ้านภาคอีสาน' },
    { value: 'ปลากัดพื้นบ้านภาคตะวันออก', label: 'ปลากัดพื้นบ้านภาคตะวันออก' },
    { value: 'ปลากัดพื้นภาคใต้', label: 'ปลากัดพื้นภาคใต้' },
    { value: 'ปลากัดพื้นบ้านมหาชัย', label: 'ปลากัดพื้นบ้านมหาชัย' },
    { value: 'ปลากัดพื้นบ้านอีสานหางลาย', label: 'ปลากัดพื้นบ้านอีสานหางลาย' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [specialitiesResponse, suggestionsResponse] = await Promise.all([
        expertService.getSpecialities(),
        expertService.getSpecialitiesSuggestions()
      ]);
      
      setSpecialities(specialitiesResponse.data?.specialities || []);
      setSuggestions(suggestionsResponse.data?.suggestions || []);
    } catch (error) {
      console.error('Error loading specialities:', error);
      toast.error('ไม่สามารถโหลดข้อมูลความเชี่ยวชาญได้');
      setSpecialities([]);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await expertService.updateSpecialities({ specialities });
      toast.success('บันทึกความเชี่ยวชาญสำเร็จ');
    } catch (error) {
      console.error('Error saving specialities:', error);
      toast.error('ไม่สามารถบันทึกความเชี่ยวชาญได้');
    } finally {
      setSaving(false);
    }
  };

  const addSpeciality = (value) => {
    if (value && !specialities.includes(value)) {
      setSpecialities([...specialities, value]);
    }
    setNewSpeciality('');
  };

  const removeSpeciality = (value) => {
    setSpecialities(specialities.filter(s => s !== value));
  };

  const addFromSuggestion = (suggestion) => {
    addSpeciality(suggestion);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">จัดการความเชี่ยวชาญ</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>

        {/* Current Specialities */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">ความเชี่ยวชาญปัจจุบัน</h2>
          {specialities.length === 0 ? (
            <div className="text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <AlertCircle className="mx-auto mb-2" size={48} />
              <p>ยังไม่มีความเชี่ยวชาญ</p>
              <p className="text-sm">เพิ่มความเชี่ยวชาญเพื่อรับงานประเมินที่เหมาะสม</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {specialities.map((spec, index) => {
                const option = bettaTypeOptions.find(opt => opt.value === spec);
                return (
                  <div
                    key={index}
                    className="bg-purple-100 text-purple-800 px-3 py-2 rounded-lg flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">
                      {option ? option.label : spec}
                    </span>
                    <button
                      onClick={() => removeSpeciality(spec)}
                      className="text-purple-600 hover:text-purple-800 ml-2"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Speciality */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">เพิ่มความเชี่ยวชาญใหม่</h2>
          <div className="flex gap-2">
            <select
              value={newSpeciality}
              onChange={(e) => setNewSpeciality(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">เลือกประเภทปลากัด</option>
              {bettaTypeOptions
                .filter(option => !specialities.includes(option.value))
                .map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
            <button
              onClick={() => addSpeciality(newSpeciality)}
              disabled={!newSpeciality}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Plus size={16} />
              เพิ่ม
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">แนะนำความเชี่ยวชาญ</h2>
            <p className="text-gray-600 text-sm mb-4">
              ตามประวัติการประเมินของคุณ
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {suggestions
                .filter(suggestion => !specialities.includes(suggestion))
                .map((suggestion, index) => {
                  const option = bettaTypeOptions.find(opt => opt.value === suggestion);
                  return (
                    <div
                      key={index}
                      className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">
                        {option ? option.label : suggestion}
                      </span>
                      <button
                        onClick={() => addFromSuggestion(suggestion)}
                        className="text-blue-600 hover:text-blue-800 ml-2"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
          <div className="flex items-start">
            <CheckCircle className="text-blue-400 mr-3 mt-0.5" size={16} />
            <div>
              <h3 className="text-blue-800 font-medium">เกี่ยวกับความเชี่ยวชาญ</h3>
              <p className="text-blue-700 text-sm mt-1">
                การตั้งค่าความเชี่ยวชาญจะช่วยให้ระบบมอบหมายงานประเมินที่เหมาะสมกับคุณ 
                คุณจะได้รับงานประเมินปลากัดในประเภทที่คุณมีความเชี่ยวชาญเป็นหลัก
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecialitiesManagement;

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ManagerLayout from "./ManagerLayout";
import Dashboard from "./Dashboard";
import CreateActivity from "./CreateActivity";
import EditActivity from "./EditActivity";
import ActivityHistory from "./ActivityHistory";
import Competitions from "./Competitions";
import Results from "./Results";
import Profile from "../User/Profile"; // ใช้ Profile เดิมได้

const ManagerRoutes = () => {
  return (
    <Routes>
      <Route path="/manager" element={<ManagerLayout />}>
        {/* Redirect /manager to /manager/dashboard */}
        <Route index element={<Navigate to="/manager/dashboard" replace />} />
        
        {/* Manager Pages */}
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-activity" element={<CreateActivity />} />
        <Route path="edit-activity" element={<EditActivity />} />
        <Route path="activity-history" element={<ActivityHistory />} />
        <Route path="competitions" element={<Competitions />} />
        <Route path="results" element={<Results />} />
        
        {/* Profile Management */}
        <Route path="profile" element={<Profile />} />
        <Route path="change-password" element={<ChangePassword />} />
        
        {/* 404 for manager routes */}
        <Route path="*" element={<Navigate to="/manager/dashboard" replace />} />
      </Route>
    </Routes>
  );
};

// Component สำหรับเปลี่ยนรหัสผ่าน
const ChangePassword = () => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">เปลี่ยนรหัสผ่าน</h1>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านปัจจุบัน
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="กรอกรหัสผ่านปัจจุบัน"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              รหัสผ่านใหม่
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="กรอกรหัสผ่านใหม่"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ยืนยันรหัสผ่านใหม่
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="ยืนยันรหัสผ่านใหม่"
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              เปลี่ยนรหัสผ่าน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManagerRoutes;
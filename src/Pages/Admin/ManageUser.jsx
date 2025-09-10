import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Search, Edit, Trash, LoaderCircle, UserPlus, X, Key, AlertTriangle } from "lucide-react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";
import { getAllUsers, createUser, deleteUser } from "../../services/adminService";

// --- Component ย่อย: Modal สำหรับสร้างผู้ใช้ ---
const UserFormModal = ({ isOpen, onRequestClose, onFormSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await onFormSubmit(data);
      onRequestClose();
    } catch (error) {
      // Error toast is handled in the parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{ overlay: { zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
      className="fixed inset-0 flex items-center justify-center p-4"
      contentLabel="User Form Modal"
    >
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl relative">
        <button onClick={onRequestClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"><X/></button>
        <h2 className="text-xl font-bold mb-6">สร้างผู้ใช้ใหม่</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
              <input {...register("firstName", { required: "กรุณากรอกชื่อ" })} className="w-full p-2 border rounded mt-1" />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
              <input {...register("lastName", { required: "กรุณากรอกนามสกุล" })} className="w-full p-2 border rounded mt-1" />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input {...register("username", { required: "กรุณากรอก Username" })} className="w-full p-2 border rounded mt-1" />
            {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" {...register("email", { required: "กรุณากรอก Email" })} className="w-full p-2 border rounded mt-1" />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input type="password" {...register("password", { required: "กรุณากรอกรหัสผ่าน", minLength: { value: 6, message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" } })} className="w-full p-2 border rounded mt-1" />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select {...register("role", { required: true })} className="w-full p-2 border rounded mt-1">
              <option value="user">User</option>
              <option value="expert">Expert</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onRequestClose} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">ยกเลิก</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300">
              {isSubmitting ? "กำลังสร้าง..." : "สร้างผู้ใช้"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};


// --- Component หลัก: ManageUser ---
const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("email");
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      toast.error("ไม่สามารถดึงข้อมูลผู้ใช้ได้: " + error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Modal.setAppElement("#root");
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return users;
    return users.filter((user) =>
      user[searchType]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm, searchType]);

  const handleCreateUser = async (data) => {
    try {
      await createUser(data);
      toast.success(`สร้างผู้ใช้ ${data.username} สำเร็จ!`);
      fetchUsers();
    } catch (error) {
      toast.error(`สร้างผู้ใช้ไม่สำเร็จ: ${error.message}`);
      throw error;
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      // [แก้ไข] เรียกใช้ Service จริง
      await deleteUser(userToDelete.id);
      toast.success(`ลบผู้ใช้ ${userToDelete.username} สำเร็จ!`);
      fetchUsers(); // ดึงข้อมูลใหม่หลังลบสำเร็จ
    } catch (error) {
      toast.error(`ลบผู้ใช้ไม่สำเร็จ: ${error.message}`);
    } finally {
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditUser = (user) => {
    toast.info(`(ยังไม่เปิดใช้งาน) แก้ไขผู้ใช้: ${user.username}`);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoaderCircle className="animate-spin text-blue-500" size={48} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">จัดการผู้ใช้</h1>
        <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 w-full md:w-auto">
          <UserPlus size={18} /> สร้างผู้ใช้ใหม่
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="border border-gray-300 rounded-lg py-2 px-4 w-full md:w-auto focus:ring-2 focus:ring-blue-500"
            >
              <option value="email">ค้นหาด้วยอีเมล</option>
              <option value="username">ค้นหาด้วยชื่อผู้ใช้</option>
              <option value="role">ค้นหาด้วยบทบาท</option>
            </select>
            <div className="flex-grow relative w-full">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="พิมพ์คำค้นหา..."
                className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ชื่อผู้ใช้</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จัดการ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">@{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[user.role]}-100 text-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[user.role]}-800`}>{user.role}</span></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="แก้ไข"><Edit size={16} /></button>
                    <button className="p-2 text-orange-600 hover:bg-orange-100 rounded-full" title="รีเซ็ตรหัสผ่าน"><Key size={16} /></button>
                    <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="ลบ"><Trash size={16} /></button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-gray-500">ไม่พบข้อมูลผู้ใช้ที่ตรงกับคำค้นหา</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
       
      <UserFormModal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        onFormSubmit={handleCreateUser}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={() => setIsDeleteModalOpen(false)}
        style={{ overlay: { zIndex: 1051, backgroundColor: 'rgba(0, 0, 0, 0.75)' } }}
        className="fixed inset-0 flex items-center justify-center p-4"
        contentLabel="Delete Confirmation Modal"
      >
        <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto text-center shadow-xl">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
          <h2 className="text-xl font-bold mt-4 text-gray-800">ยืนยันการลบผู้ใช้</h2>
          <p className="text-gray-600 mt-2">
            คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ <br />
            <span className="font-semibold">&quot;{userToDelete?.username}&quot;</span>?
            <br />
            การกระทำนี้ไม่สามารถย้อนกลับได้
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button onClick={() => setIsDeleteModalOpen(false)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">ยกเลิก</button>
            <button onClick={confirmDeleteUser} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">ยืนยันการลบ</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageUser;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { Search, Edit, Trash, LoaderCircle, UserPlus, X, Key, AlertTriangle, Mail } from "lucide-react";
import Modal from "../../ui/Modal";
import { useForm } from "react-hook-form";
import { getAllUsers, createUser, deleteUser, updateUser, updateUserCredentials } from "../../services/adminService";
import PageHeader from "../../ui/PageHeader";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Select from "../../ui/Select";
import { Table, THead, TH, TD, TRow } from "../../ui/Table";
import EmptyState from "../../ui/EmptyState";

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
    <Modal isOpen={isOpen} onRequestClose={onRequestClose} title="สร้างผู้ใช้ใหม่" maxWidth="max-w-md">
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [isCredsModalOpen, setIsCredsModalOpen] = useState(false);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");

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

  const handleOpenCreds = (user) => {
    setUserToEdit(user);
    setCredEmail(user.email || "");
    setCredPassword("");
    setIsCredsModalOpen(true);
  };

  const submitCredentials = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    if (!credEmail && !credPassword) { toast.info('กรุณากรอกอีเมลหรือรหัสผ่านอย่างน้อย 1 อย่าง'); return; }
    try {
      await updateUserCredentials(userToEdit.id, { email: credEmail || undefined, password: credPassword || undefined });
      toast.success('อัปเดตอีเมล/รหัสผ่านสำเร็จ');
      setIsCredsModalOpen(false);
      setUserToEdit(null);
      setCredPassword("");
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'อัปเดตอีเมล/รหัสผ่านไม่สำเร็จ');
    }
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
    setUserToEdit(user);
    setIsEditModalOpen(true);
  };

  const submitEditUser = async (e) => {
    e.preventDefault();
    if (!userToEdit) return;
    try {
      const patch = {
        first_name: userToEdit.first_name || '',
        last_name: userToEdit.last_name || '',
        username: userToEdit.username || '',
        role: userToEdit.role || 'user',
      };
      await updateUser(userToEdit.id, patch);
      toast.success('อัปเดตผู้ใช้สำเร็จ');
      setIsEditModalOpen(false);
      setUserToEdit(null);
      fetchUsers();
    } catch (err) {
      toast.error(err?.message || 'อัปเดตผู้ใช้ไม่สำเร็จ');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-96"><LoaderCircle className="animate-spin text-blue-500" size={48} /></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการผู้ใช้"
        actions={<Button onClick={() => setIsCreateModalOpen(true)}><UserPlus size={18} className="mr-2"/> สร้างผู้ใช้ใหม่</Button>}
      />

      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <Select value={searchType} onChange={(e) => setSearchType(e.target.value)} className="w-full md:w-60">
            <option value="email">ค้นหาด้วยอีเมล</option>
            <option value="username">ค้นหาด้วยชื่อผู้ใช้</option>
            <option value="role">ค้นหาด้วยบทบาท</option>
          </Select>
          <div className="flex-grow relative w-full">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="พิมพ์คำค้นหา..."
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <Table>
          <THead>
            <TRow>
              <TH>ชื่อ-นามสกุล</TH>
              <TH>ชื่อผู้ใช้</TH>
              <TH>อีเมล</TH>
              <TH>บทบาท</TH>
              <TH>จัดการ</TH>
            </TRow>
          </THead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TRow key={user.id}>
                  <TD className="whitespace-nowrap text-sm font-medium text-gray-900">{user.first_name} {user.last_name}</TD>
                  <TD className="whitespace-nowrap text-sm text-gray-600">@{user.username}</TD>
                  <TD className="whitespace-nowrap text-sm text-gray-600">{user.email}</TD>
                  <TD className="whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full bg-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[user.role]}-100 text-${{admin:'red',manager:'amber',expert:'green',user:'blue'}[user.role]}-800`}>{user.role}</span>
                  </TD>
                  <TD className="whitespace-nowrap text-sm font-medium space-x-2">
                    <button onClick={() => handleEditUser(user)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full" title="แก้ไข"><Edit size={16} /></button>
                    <button onClick={() => handleOpenCreds(user)} className="p-2 text-orange-600 hover:bg-orange-100 rounded-full" title="อีเมล/รหัสผ่าน"><Key size={16} /></button>
                    <button onClick={() => handleDeleteUser(user)} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="ลบ"><Trash size={16} /></button>
                  </TD>
                </TRow>
              ))
            ) : (
              <TRow>
                <TD colSpan={5} className="text-center">
                  <EmptyState title="ไม่พบข้อมูลผู้ใช้ที่ตรงกับคำค้นหา" subtitle="ลองเปลี่ยนคำค้นหรือเงื่อนไขอื่น" />
                </TD>
              </TRow>
            )}
          </tbody>
        </Table>
      </div>
       
      <UserFormModal
        isOpen={isCreateModalOpen}
        onRequestClose={() => setIsCreateModalOpen(false)}
        onFormSubmit={handleCreateUser}
      />

      {/* Edit User Modal */}
      <Modal isOpen={isEditModalOpen} onRequestClose={() => { setIsEditModalOpen(false); setUserToEdit(null); }} title="แก้ไขผู้ใช้" maxWidth="max-w-md">
        <form onSubmit={submitEditUser}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ชื่อ</label>
              <input value={userToEdit?.first_name || ''} onChange={(e)=>setUserToEdit(prev=>({...prev, first_name:e.target.value}))} className="w-full p-2 border rounded mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
              <input value={userToEdit?.last_name || ''} onChange={(e)=>setUserToEdit(prev=>({...prev, last_name:e.target.value}))} className="w-full p-2 border rounded mt-1" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input value={userToEdit?.username || ''} onChange={(e)=>setUserToEdit(prev=>({...prev, username:e.target.value}))} className="w-full p-2 border rounded mt-1" />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">Role</label>
            <select value={userToEdit?.role || 'user'} onChange={(e)=>setUserToEdit(prev=>({...prev, role:e.target.value}))} className="w-full p-2 border rounded mt-1">
              <option value="user">User</option>
              <option value="expert">Expert</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={()=>{ setIsEditModalOpen(false); setUserToEdit(null); }} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">บันทึก</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onRequestClose={() => setIsDeleteModalOpen(false)} title="ยืนยันการลบผู้ใช้" maxWidth="max-w-sm">
        <div className="text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />
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

      {/* Credentials Modal */}
      <Modal isOpen={isCredsModalOpen} onRequestClose={() => { setIsCredsModalOpen(false); setUserToEdit(null); setCredPassword(""); }} title="อัปเดตอีเมล/รหัสผ่าน" maxWidth="max-w-md">
        <form onSubmit={submitCredentials}>
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <div className="relative">
              <input type="email" value={credEmail} onChange={e=>setCredEmail(e.target.value)} className="w-full p-2 border rounded mt-1 pr-9" placeholder="example@email.com" />
              <Mail size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700">รหัสผ่านใหม่</label>
            <input type="password" value={credPassword} onChange={e=>setCredPassword(e.target.value)} className="w-full p-2 border rounded mt-1" placeholder="อย่างน้อย 6 ตัวอักษร" />
          </div>
          <div className="flex justify-end gap-3 mt-5">
            <button type="button" onClick={()=>{ setIsCredsModalOpen(false); setUserToEdit(null); setCredPassword(""); }} className="px-4 py-2 bg-gray-200 rounded-lg">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">บันทึก</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageUser;

import React from 'react';
import AdminMenu from './AdminMenu';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => (
    <div className="bg-gray-100 min-h-screen">
      <AdminMenu />
      <main className="pt-16">
        <div className="p-4 sm:p-6 lg:p-8">
            <Outlet /> 
        </div>
      </main>
    </div>
);
export default AdminLayout;
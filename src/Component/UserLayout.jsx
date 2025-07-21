import React from 'react';
import Navbar from './Navbar';
import { Outlet } from 'react-router-dom';

const UserLayout = () => (
    <>
        <Navbar />
        <main className="pt-20">
            <Outlet />
        </main>
    </>
);
export default UserLayout;
import React from "react";
import AllNewsPage from '../Pages/User/AllNewsPage';
import SingleNewsPage from '../Pages/User/SingleNewsPage';
import Login from '../Pages/User/Login';
import SignUp from '../Pages/User/SignUp';
import ForgotPassword from '../Pages/User/ForgotPassword';
import ContestPage from '../Pages/User/ContestPage';

import HomePage from "../Pages/User/HomePage";

const PublicRoutes = [
    { path: "/", element: <HomePage /> },
    { path: "/news/:id", element: <SingleNewsPage /> },
    { path: "/news", element: <AllNewsPage /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <SignUp /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/contest", element: <ContestPage /> },
    { path: "/contest/:id", element: <SingleNewsPage /> },

];

export default PublicRoutes;

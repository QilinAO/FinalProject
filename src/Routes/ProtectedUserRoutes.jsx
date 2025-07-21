import React from "react";
import BettaEvaluationForm from '../Pages/User/BettaEvaluationForm';
import HistoryPage from '../Pages/User/HistoryPage';
import Profile from '../Pages/User/Profile';
import Unauthorized from "../context/Unauthorized";

const ProtectedUserRoutes = [
    { path: "/evaluate", element: <BettaEvaluationForm /> },
    { path: "/history", element: <HistoryPage /> },
    { path: "/profile", element: <Profile /> },
    { path: "/unauthorized", element: <Unauthorized /> },
];

export default ProtectedUserRoutes;

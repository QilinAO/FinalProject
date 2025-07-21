// import React from "react";
// import ExpertDashboard from "../Pages/Expert/ExpertDashboard";
// import ExpertProfile from "../Pages/Expert/ExpertProfile";
// import EvaluationHistory from "../Pages/Expert/EvaluationHistory";
// import Activities from "../Pages/Expert/Activities";
// import BettaReviewPage from "../Pages/Expert/BettaFish_ReviewPage";

// const ExpertRoutes = [
//     { path: "/expert-dashboard", element: <ExpertDashboard /> },
//     { path: "/expert/profile", element: <ExpertProfile /> },
//     { path: "/expert/evaluation-history", element: <EvaluationHistory /> },
//     { path: "/expert/activities", element: <Activities /> },
//     { path: "/fishreviewpage", element: <BettaReviewPage /> },
// ];

// export default ExpertRoutes;


// src/Routes/ExpertRoutes.js

// import React from "react";
// import ExpertDashboard from "../Pages/Expert/ExpertDashboard";
// import ExpertProfile from "../Pages/Expert/ExpertProfile";
// import EvaluationHistory from "../Pages/Expert/EvaluationHistory";
// import Activities from "../Pages/Expert/Activities";
// import BettaReviewPage from "../Pages/Expert/BettaFish_ReviewPage";

// const ExpertRoutes = [
//     // [แก้ไข] เปลี่ยน Path ทั้งหมดให้เป็นแบบ Relative
//     { path: "dashboard", element: <ExpertDashboard /> },
//     { path: "profile", element: <ExpertProfile /> },
//     { path: "evaluation-history", element: <EvaluationHistory /> },
//     { path: "activities", element: <Activities /> },
//     // [แก้ไข] แก้ path นี้ให้สอดคล้องกัน
//     { path: "fish-review", element: <BettaReviewPage /> },
// ];

// export default ExpertRoutes;

// src/Routes/ExpertRoutes.js (New File)

import React from "react";
import ExpertDashboard from "../Pages/Expert/ExpertDashboard";
import EvaluationQueue from "../Pages/Expert/EvaluationQueue";
import CompetitionJudging from "../Pages/Expert/CompetitionJudging";
import ExpertHistory from "../Pages/Expert/EvaluationHistory"; // ใช้ชื่อ EvaluationHistory ไปก่อน
import ExpertProfile from "../Pages/Expert/ExpertProfile";

const ExpertRoutes = [
    { path: "dashboard", element: <ExpertDashboard /> },
    { path: "evaluations", element: <EvaluationQueue /> },
    { path: "judging", element: <CompetitionJudging /> },
    { path: "history", element: <ExpertHistory /> },
    { path: "profile", element: <ExpertProfile /> },
];

export default ExpertRoutes;
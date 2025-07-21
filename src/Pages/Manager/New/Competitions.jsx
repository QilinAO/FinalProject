import React, { useState, useEffect } from "react";
import { 
  FiUsers, 
  FiCalendar, 
  FiPlay, 
  FiCheck, 
  FiX, 
  FiEye,
  FiTrophy,
  FiStar,
  FiClock,
  FiUserCheck
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Competitions = () => {
  const [contests, setContests] = useState([]);
  const [selectedContest, setSelectedContest] = useState(null);
  const [activeTab, setActiveTab] = useState("participants");
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    loadContests();
  }, []);

  useEffect(() => {
    if (selectedContest) {
      loadParticipants(selectedContest.id);
      loadScores(selectedContest.id);
    }
  }, [selectedContest]);

  const loadContests = async () => {
    try {
      setLoading(true);
      // TODO: เรียก API เพื่อดึงการแข่งขันที่ใช้งานอยู่
      // Dummy data
      const dummyContests = [
        {
          id: 1,
          title: "ประกวดปลากัดพื้นบ้านภาคกลางและเหนือ",
          contestType: "ปลากัดพื้นบ้านภาคกลางและเหนือ",
          status: "active",
          startDate: "2024-02-01",
          endDate: "2024-02-15",
          maxParticipants: 50,
          currentParticipants: 25,
          pendingParticipants: 8,
          experts: [
            { id: 1, name: "ดร.สมชาย ใจดี", status: "confirmed" },
            { id: 2, name: "อ.สมหญิง รักปลา", status: "confirmed" },
            { id: 3, name: "คุณสมศักดิ์ ปลาดี", status: "confirmed" }
          ],
          poster: "https://dummyimage.com/400x600/7c3aed/ffffff&text=Contest+1"
        },
        {
          id: 2,
          title: "ประกวดปลากัดป่ารุ่นจิ๋ว",
          contestType: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)",
          status: "upcoming",
          startDate: "2024-03-01",
          endDate: "2024-03-15",
          maxParticipants: 30,
          currentParticipants: 12,
          pendingParticipants: 3,
          experts: [
            { id: 4, name: "ดร.วิชัย เก่งปลา", status: "confirmed" },
            { id: 5, name: "อ.สุชาติ ปลาใหญ่", status: "pending" },
            { id: 6, name: "คุณปรีชา ปลาดี", status: "confirmed" }
          ],
          poster: "https://dummyimage.com/400x600/dc2626/ffffff&text=Contest+2"
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setContests(dummyContests);
      if (dummyContests.length > 0) {
        setSelectedContest(dummyContests[0]);
      }
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดการแข่งขัน");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipants = async (contestId) => {
    try {
      // TODO: เรียก API เพื่อดึงผู้เข้าร่วม
      // Dummy data
      const dummyParticipants = [
        {
          id: 1,
          name: "นายสมชาย ใจดี",
          email: "somchai@email.com",
          phone: "081-234-5678",
          fishName: "ปลากัดสีทอง",
          fishAge: "6 เดือน",
          fishSize: "7 ซม.",
          status: "approved",
          submittedAt: "2024-01-20",
          fishImage: "https://dummyimage.com/300x200/3b82f6/ffffff&text=Fish+1"
        },
        {
          id: 2,
          name: "นางสาวสมหญิง รักปลา",
          email: "somying@email.com", 
          phone: "082-345-6789",
          fishName: "ปลากัดสีเงิน",
          fishAge: "8 เดือน",
          fishSize: "6.5 ซม.",
          status: "pending",
          submittedAt: "2024-01-22",
          fishImage: "https://dummyimage.com/300x200/10b981/ffffff&text=Fish+2"
        },
        {
          id: 3,
          name: "นายวิชาญ ปลาดี",
          email: "wichan@email.com",
          phone: "083-456-7890",
          fishName: "ปลากัดสีแดง",
          fishAge: "5 เดือน",
          fishSize: "7.2 ซม.",
          status: "approved",
          submittedAt: "2024-01-25",
          fishImage: "https://dummyimage.com/300x200/ef4444/ffffff&text=Fish+3"
        }
      ];

      setParticipants(dummyParticipants);
    } catch (error) {
      console.error("Error loading participants:", error);
    }
  };

  const loadScores = async (contestId) => {
    try {
      // TODO: เรียก API เพื่อดึงคะแนน
      // Dummy data
      const dummyScores = [
        {
          participantId: 1,
          participantName: "นายสมชาย ใจดี",
          fishName: "ปลากัดสีทอง",
          scores: {
            expert1: 8.5,
            expert2: 9.0,
            expert3: 8.8
          },
          averageScore: 8.77,
          rank: 2
        },
        {
          participantId: 3,
          participantName: "นายวิชาญ ปลาดี",
          fishName: "ปลากัดสีแดง",
          scores: {
            expert1: 9.2,
            expert2: 9.5,
            expert3: 9.1
          },
          averageScore: 9.27,
          rank: 1
        }
      ];

      setScores(dummyScores);
    } catch (error) {
      console.error("Error loading scores:", error);
    }
  };

  const handleApproveParticipant = async (participantId) => {
    try {
      // TODO: เรียก API เพื่ออนุมัติผู้เข้าร่วม
      setParticipants(prev => 
        prev.map(p => 
          p.id === participantId 
            ? { ...p, status: "approved" }
            : p
        )
      );
      toast.success("อนุมัติผู้เข้าร่วมสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการอนุมัติ");
      console.error(error);
    }
  };

  const handleRejectParticipant = async (participantId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะปฏิเสธผู้เข้าร่วมคนนี้?")) {
      try {
        // TODO: เรียก API เพื่อปฏิเสธผู้เข้าร่วม
        setParticipants(prev => 
          prev.map(p => 
            p.id === participantId 
              ? { ...p, status: "rejected" }
              : p
          )
        );
        toast.success("ปฏิเสธผู้เข้าร่วมสำเร็จ");
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการปฏิเสธ");
        console.error(error);
      }
    }
  };

  const handleStartContest = async (contestId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะเริ่มการแข่งขัน?")) {
      try {
        // TODO: เรียก API เพื่อเริ่มการแข่งขัน
        setContests(prev =>
          prev.map(c =>
            c.id === contestId
              ? { ...c, status: "ongoing" }
              : c
          )
        );
        toast.success("เริ่มการแข่งขันสำเร็จ");
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการเริ่มการแข่งขัน");
        console.error(error);
      }
    }
  };

  const handleAnnounceResults = async (contestId) => {
    if (window.confirm("คุณแน่ใจหรือไม่ที่จะประกาศผลการแข่งขัน?")) {
      try {
        // TODO: เรียก API เพื่อประกาศผล
        setContests(prev =>
          prev.map(c =>
            c.id === contestId
              ? { ...c, status: "completed" }
              : c
          )
        );
        toast.success("ประกาศผลการแข่งขันสำเร็จ");
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการประกาศผล");
        console.error(error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800", text: "กำลังรับสมัคร" },
      upcoming: { color: "bg-blue-100 text-blue-800", text: "กำลังจะเริ่ม" },
      ongoing: { color: "bg-yellow-100 text-yellow-800", text: "กำลังแข่งขัน" },
      completed: { color: "bg-purple-100 text-purple-800", text: "เสร็จสิ้น" }
    };

    const config = statusConfig[status] || statusConfig.active;
    return (
      <span className={`px-3 py-1 text-sm rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getParticipantStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "รอการอนุมัติ" },
      approved: { color: "bg-green-100 text-green-800", text: "อนุมัติแล้ว" },
      rejected: { color: "bg-red-100 text-red-800", text: "ปฏิเสธ" }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const ParticipantCard = ({ participant }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-4">
        {/* รูปปลา */}
        <div className="w-20 h-16 flex-shrink-0">
          <img
            src={participant.fishImage}
            alt={participant.fishName}
            className="w-full h-full object-cover rounded-md"
          />
        </div>

        {/* ข้อมูล */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{participant.name}</h4>
              <p className="text-sm text-gray-600">{participant.fishName}</p>
            </div>
            {getParticipantStatusBadge(participant.status)}
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
            <span>อายุ: {participant.fishAge}</span>
            <span>ขนาด: {participant.fishSize}</span>
            <span>อีเมล: {participant.email}</span>
            <span>เบอร์: {participant.phone}</span>
          </div>

          {participant.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleApproveParticipant(participant.id)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
              >
                <FiCheck className="mr-1" size={14} />
                อนุมัติ
              </button>
              <button
                onClick={() => handleRejectParticipant(participant.id)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center"
              >
                <FiX className="mr-1" size={14} />
                ปฏิเสธ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ScoreCard = ({ score }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{score.participantName}</h4>
          <p className="text-sm text-gray-600">{score.fishName}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center">
            {score.rank <= 3 && (
              <FiTrophy className={`mr-1 ${
                score.rank === 1 ? 'text-yellow-500' :
                score.rank === 2 ? 'text-gray-400' :
                'text-orange-600'
              }`} size={16} />
            )}
            <span className="text-lg font-bold text-purple-600">
              {score.averageScore.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500">อันดับ {score.rank}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="text-center">
          <p className="text-gray-600">กรรมการ 1</p>
          <p className="font-semibold">{score.scores.expert1}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">กรรมการ 2</p>
          <p className="font-semibold">{score.scores.expert2}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-600">กรรมการ 3</p>
          <p className="font-semibold">{score.scores.expert3}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">การแข่งขัน</h1>
        <p className="text-gray-600">จัดการการแข่งขันและอนุมัติผู้เข้าร่วม</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* รายการการแข่งขัน */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">การแข่งขันทั้งหมด</h2>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              ) : contests.length > 0 ? (
                contests.map(contest => (
                  <div
                    key={contest.id}
                    onClick={() => setSelectedContest(contest)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedContest?.id === contest.id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <h3 className="font-medium text-gray-900 text-sm mb-2 line-clamp-2">
                      {contest.title}
                    </h3>
                    <div className="space-y-1">
                      {getStatusBadge(contest.status)}
                      <div className="flex items-center text-xs text-gray-600">
                        <FiUsers className="mr-1" size={12} />
                        <span>{contest.currentParticipants}/{contest.maxParticipants}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">ไม่มีการแข่งขัน</p>
              )}
            </div>
          </div>
        </div>

        {/* รายละเอียดการแข่งขัน */}
        <div className="lg:col-span-3">
          {selectedContest ? (
            <div className="space-y-6">
              {/* ข้อมูลการแข่งขัน */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedContest.title}
                    </h2>
                    <div className="flex items-center space-x-4 mb-3">
                      {getStatusBadge(selectedContest.status)}
                      <span className="text-sm text-gray-600">
                        {selectedContest.contestType}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2" size={16} />
                        <span>{new Date(selectedContest.startDate).toLocaleDateString('th-TH')}</span>
                      </div>
                      <div className="flex items-center">
                        <FiUsers className="mr-2" size={16} />
                        <span>{selectedContest.currentParticipants} คน</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2" size={16} />
                        <span>รอการอนุมัติ {selectedContest.pendingParticipants} คน</span>
                      </div>
                      <div className="flex items-center">
                        <FiUserCheck className="mr-2" size={16} />
                        <span>กรรมการ {selectedContest.experts.length} คน</span>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มจัดการ */}
                  <div className="flex space-x-2">
                    {selectedContest.status === "active" && (
                      <button
                        onClick={() => handleStartContest(selectedContest.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                      >
                        <FiPlay className="mr-2" size={16} />
                        เริ่มการแข่งขัน
                      </button>
                    )}
                    {selectedContest.status === "ongoing" && scores.length > 0 && (
                      <button
                        onClick={() => handleAnnounceResults(selectedContest.id)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
                      >
                        <FiTrophy className="mr-2" size={16} />
                        ประกาศผล
                      </button>
                    )}
                  </div>
                </div>

                {/* กรรมการ */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">กรรมการ</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContest.experts.map(expert => (
                      <span
                        key={expert.id}
                        className={`px-3 py-1 text-sm rounded-full ${
                          expert.status === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {expert.name}
                        {expert.status === "confirmed" && " ✓"}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <nav className="flex space-x-8 px-6">
                    <button
                      onClick={() => setActiveTab("participants")}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "participants"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      ผู้เข้าร่วม ({participants.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("scores")}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === "scores"
                          ? "border-purple-500 text-purple-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      คะแนน ({scores.length})
                    </button>
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === "participants" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          ผู้เข้าร่วมการแข่งขัน
                        </h3>
                        <div className="text-sm text-gray-600">
                          รอการอนุมัติ: {participants.filter(p => p.status === "pending").length} คน
                        </div>
                      </div>
                      
                      {participants.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {participants.map(participant => (
                            <ParticipantCard key={participant.id} participant={participant} />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">ยังไม่มีผู้เข้าร่วมการแข่งขัน</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "scores" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">
                          คะแนนจากกรรมการ
                        </h3>
                        <div className="text-sm text-gray-600">
                          ประเมินแล้ว: {scores.length} คน
                        </div>
                      </div>

                      {scores.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {scores
                            .sort((a, b) => a.rank - b.rank)
                            .map(score => (
                              <ScoreCard key={score.participantId} score={score} />
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className="text-gray-500">ยังไม่มีคะแนนจากกรรมการ</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-lg shadow-sm text-center">
              <p className="text-gray-500">เลือกการแข่งขันเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitions;
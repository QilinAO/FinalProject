import React, { useState, useEffect } from "react";
import { 
  FiTrophy, 
  FiMedal, 
  FiAward, 
  FiFilter, 
  FiDownload,
  FiEye,
  FiCalendar,
  FiUsers,
  FiStar
} from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterContest, setFilterContest] = useState("all");
  const [filterYear, setFilterYear] = useState("all");
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, filterContest, filterYear]);

  const loadResults = async () => {
    try {
      setLoading(true);
      // TODO: เรียก API เพื่อดึงผลคะแนนทั้งหมด
      // Dummy data
      const dummyResults = [
        {
          id: 1,
          contestTitle: "ประกวดปลากัดพื้นบ้านภาคกลางและเหนือ",
          contestType: "ปลากัดพื้นบ้านภาคกลางและเหนือ",
          contestDate: "2023-11-15",
          totalParticipants: 45,
          winners: [
            {
              rank: 1,
              name: "นายสมชาย ใจดี",
              fishName: "ปลากัดทองคำ",
              score: 9.2,
              prize: "ถ้วยรางวัลชนะเลิศ + เงินรางวัล 10,000 บาท",
              fishImage: "https://dummyimage.com/300x200/fbbf24/ffffff&text=1st+Place"
            },
            {
              rank: 2,
              name: "นางสาวสมหญิง รักปลา",
              fishName: "ปลากัดเงินแท้",
              score: 8.8,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 1 + เงินรางวัล 5,000 บาท",
              fishImage: "https://dummyimage.com/300x200/9ca3af/ffffff&text=2nd+Place"
            },
            {
              rank: 3,
              name: "นายวิชาญ ปลาดี",
              fishName: "ปลากัดทองแดง",
              score: 8.5,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 2 + เงินรางวัล 3,000 บาท",
              fishImage: "https://dummyimage.com/300x200/f97316/ffffff&text=3rd+Place"
            }
          ],
          experts: ["ดร.สมชาย ใจดี", "อ.สมหญิง รักปลา", "คุณสมศักดิ์ ปลาดี"],
          poster: "https://dummyimage.com/400x600/7c3aed/ffffff&text=Contest+1"
        },
        {
          id: 2,
          contestTitle: "ประกวดปลากัดป่ารุ่นจิ๋ว",
          contestType: "ปลากัดป่ารุ่นจิ๋ว(รวมทุกประเภท ความยาวไม่เกิน 1.2 นิ้ว)",
          contestDate: "2023-08-15",
          totalParticipants: 32,
          winners: [
            {
              rank: 1,
              name: "นายประยุทธ์ ปลาเก่ง",
              fishName: "ปลากัดจิ๋วสีรุ้ง",
              score: 9.0,
              prize: "ถ้วยรางวัลชนะเลิศ + เงินรางวัล 8,000 บาท",
              fishImage: "https://dummyimage.com/300x200/fbbf24/ffffff&text=1st+Mini"
            },
            {
              rank: 2,
              name: "นางวิมล สวยงาม",
              fishName: "ปลากัดจิ๋วสีฟ้า",
              score: 8.7,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 1 + เงินรางวัล 4,000 บาท",
              fishImage: "https://dummyimage.com/300x200/9ca3af/ffffff&text=2nd+Mini"
            },
            {
              rank: 3,
              name: "นายสุรชัย เก่งกาจ",
              fishName: "ปลากัดจิ๋วสีเขียว",
              score: 8.3,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 2 + เงินรางวัล 2,000 บาท",
              fishImage: "https://dummyimage.com/300x200/f97316/ffffff&text=3rd+Mini"
            }
          ],
          experts: ["ดร.วิชัย เก่งปลา", "อ.สุชาติ ปลาใหญ่", "คุณปรีชา ปลาดี"],
          poster: "https://dummyimage.com/400x600/dc2626/ffffff&text=Contest+2"
        },
        {
          id: 3,
          contestTitle: "ประกวดปลากัดพื้นบ้านภาคอีสาน",
          contestType: "ปลากัดพื้นบ้านภาคอีสาน",
          contestDate: "2022-12-15",
          totalParticipants: 38,
          winners: [
            {
              rank: 1,
              name: "นายสมปอง อีสานดี",
              fishName: "ปลากัดอีสานแท้",
              score: 8.9,
              prize: "ถ้วยรางวัลชนะเลิศ + เงินรางวัล 8,000 บาท",
              fishImage: "https://dummyimage.com/300x200/fbbf24/ffffff&text=1st+Isan"
            },
            {
              rank: 2,
              name: "นางสาวมาลี ปลาสวย",
              fishName: "ปลากัดลายไทย",
              score: 8.6,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 1 + เงินรางวัล 4,000 บาท",
              fishImage: "https://dummyimage.com/300x200/9ca3af/ffffff&text=2nd+Isan"
            },
            {
              rank: 3,
              name: "นายบุญมี ใจดี",
              fishName: "ปลากัดสีเงิน",
              score: 8.2,
              prize: "ถ้วยรางวัลรองชนะเลิศอันดับ 2 + เงินรางวัล 2,000 บาท",
              fishImage: "https://dummyimage.com/300x200/f97316/ffffff&text=3rd+Isan"
            }
          ],
          experts: ["อ.สมหญิง รักปลา", "ดร.สมชาย ใจดี", "คุณสมศักดิ์ ปลาดี"],
          poster: "https://dummyimage.com/400x600/f59e0b/ffffff&text=Contest+3"
        }
      ];

      await new Promise(resolve => setTimeout(resolve, 1000));
      setResults(dummyResults);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการโหลดผลคะแนน");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = results;

    // Filter by contest type
    if (filterContest !== "all") {
      filtered = filtered.filter(result => result.contestType === filterContest);
    }

    // Filter by year
    if (filterYear !== "all") {
      filtered = filtered.filter(result => 
        new Date(result.contestDate).getFullYear().toString() === filterYear
      );
    }

    setFilteredResults(filtered);
  };

  const getAvailableContests = () => {
    const contests = results.map(result => result.contestType);
    return [...new Set(contests)];
  };

  const getAvailableYears = () => {
    const years = results.map(result => 
      new Date(result.contestDate).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  };

  const handleViewDetail = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleExportCertificate = async (winnerId, contestId) => {
    try {
      // TODO: เรียก API เพื่อสร้างใบประกาศนียบัตร
      toast.info("กำลังสร้างใบประกาศนียบัตร...");
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("สร้างใบประกาศนียบัตรสำเร็จ");
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้างใบประกาศนียบัตร");
      console.error(error);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <FiTrophy className="text-yellow-500" size={20} />;
      case 2:
        return <FiMedal className="text-gray-400" size={20} />;
      case 3:
        return <FiAward className="text-orange-600" size={20} />;
      default:
        return <FiStar className="text-gray-400" size={20} />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500";
      case 3:
        return "bg-gradient-to-r from-orange-400 to-orange-600";
      default:
        return "bg-gray-400";
    }
  };

  const ResultCard = ({ result }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* รูปโปสเตอร์ */}
        <div className="w-32 h-40 flex-shrink-0">
          <img
            src={result.poster}
            alt={result.contestTitle}
            className="w-full h-full object-cover"
          />
        </div>

        {/* ข้อมูล */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                {result.contestTitle}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{result.contestType}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-500">
                <span className="flex items-center">
                  <FiCalendar className="mr-1" size={12} />
                  {new Date(result.contestDate).toLocaleDateString('th-TH')}
                </span>
                <span className="flex items-center">
                  <FiUsers className="mr-1" size={12} />
                  {result.totalParticipants} คน
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => handleViewDetail(result)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
                title="ดูรายละเอียด"
              >
                <FiEye size={16} />
              </button>
              <button
                onClick={() => handleExportCertificate(result.winners[0].name, result.id)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-full transition-colors"
                title="ส่งออกใบประกาศ"
              >
                <FiDownload size={16} />
              </button>
            </div>
          </div>

          {/* ผู้ชนะ 3 อันดับแรก */}
          <div className="space-y-2">
            {result.winners.map(winner => (
              <div key={winner.rank} className="flex items-center space-x-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getRankColor(winner.rank)}`}>
                  <span className="text-white text-xs font-bold">{winner.rank}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{winner.name}</p>
                  <p className="text-xs text-gray-600">{winner.fishName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-purple-600">{winner.score}</p>
                  <p className="text-xs text-gray-500">คะแนน</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const DetailModal = () => {
    if (!selectedResult || !showDetailModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">ผลการแข่งขัน</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* ข้อมูลการแข่งขัน */}
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedResult.contestTitle}
                  </h3>
                  <p className="text-gray-600">{selectedResult.contestType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">วันที่จัดการแข่งขัน</p>
                  <p className="font-medium">{new Date(selectedResult.contestDate).toLocaleDateString('th-TH')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ผู้เข้าร่วมทั้งหมด</p>
                  <p className="font-medium">{selectedResult.totalParticipants} คน</p>
                </div>
              </div>
            </div>

            {/* ผู้ชนะ */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">ผู้ชนะการแข่งขัน</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {selectedResult.winners.map(winner => (
                  <div key={winner.rank} className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="text-center mb-4">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center ${getRankColor(winner.rank)}`}>
                        {getRankIcon(winner.rank)}
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">อันดับ {winner.rank}</h4>
                    </div>

                    <div className="text-center mb-4">
                      <img
                        src={winner.fishImage}
                        alt={winner.fishName}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                      />
                      <h5 className="font-semibold text-gray-900">{winner.name}</h5>
                      <p className="text-gray-600 text-sm">{winner.fishName}</p>
                    </div>

                    <div className="text-center mb-4">
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">{winner.score}</p>
                        <p className="text-sm text-gray-600">คะแนนเฉลี่ย</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">รางวัล</p>
                      <p className="text-sm font-medium text-gray-900">{winner.prize}</p>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        onClick={() => handleExportCertificate(winner.name, selectedResult.id)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors flex items-center mx-auto"
                      >
                        <FiDownload className="mr-2" size={14} />
                        ใบประกาศ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* กรรมการ */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">กรรมการผู้ตัดสิน</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedResult.experts.map((expert, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg text-center">
                    <div className="w-12 h-12 bg-purple-600 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-white font-bold">{index + 1}</span>
                    </div>
                    <p className="font-medium text-gray-900">{expert}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                ปิด
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleExportCertificate("all", selectedResult.id);
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <FiDownload className="mr-2" size={16} />
                ส่งออกรายงานทั้งหมด
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ผลคะแนน</h1>
        <p className="text-gray-600">ดูผลคะแนนและผู้ชนะการประกวดทั้งหมด</p>
      </div>

      {/* สถิติรวม */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">การแข่งขันทั้งหมด</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <FiTrophy className="text-purple-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้ชนะเลิศ</p>
              <p className="text-2xl font-bold text-gray-900">{results.length}</p>
            </div>
            <FiMedal className="text-yellow-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">ผู้เข้าร่วมรวม</p>
              <p className="text-2xl font-bold text-gray-900">
                {results.reduce((sum, r) => sum + r.totalParticipants, 0)}
              </p>
            </div>
            <FiUsers className="text-blue-600" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">คะแนนเฉลี่ย</p>
              <p className="text-2xl font-bold text-gray-900">
                {results.length > 0 ? (
                  results.reduce((sum, r) => sum + r.winners[0].score, 0) / results.length
                ).toFixed(1) : '0'}
              </p>
            </div>
            <FiStar className="text-green-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ประเภทการประกวด
            </label>
            <select
              value={filterContest}
              onChange={(e) => setFilterContest(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทุกประเภท</option>
              {getAvailableContests().map(contest => (
                <option key={contest} value={contest}>{contest}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ปี
            </label>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">ทุกปี</option>
              {getAvailableYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilterContest("all");
                setFilterYear("all");
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              รีเซ็ตตัวกรอง
            </button>
          </div>
        </div>
      </div>

      {/* Results List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              ผลการแข่งขัน ({filteredResults.length})
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <FiFilter size={16} />
              <span>กรองแล้ว</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              <span className="ml-2 text-gray-600">กำลังโหลด...</span>
            </div>
          ) : filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map(result => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">ไม่พบผลการแข่งขันที่ตรงกับเงื่อนไข</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal />
    </div>
  );
};

export default Results;
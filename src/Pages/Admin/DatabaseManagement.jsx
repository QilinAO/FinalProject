// src/Pages/Admin/DatabaseManagement.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const DatabaseManagement = () => {
  const [folders, setFolders] = useState([
    { name: "Profile", count: 0 },
    { name: "BettaFish/Image", count: 0 },
    { name: "BettaFish/Video", count: 0 },
  ]);
  const [files, setFiles] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalImage, setModalImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 10;

  // เปิด Modal พร้อมตั้งค่า Modal Image
  const handleOpenModal = (imageUrl) => {
    setModalImage(imageUrl);
    setIsModalOpen(true);
  };

  // ปิด Modal
  const handleCloseModal = () => {
    setModalImage(null);
    setIsModalOpen(false);
  };

  // ดึงข้อมูลไฟล์ทั้งหมดจาก API `/files/all-files`
  useEffect(() => {
    const fetchAllFiles = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/files/all-files");
        const data = response.data;
        console.log("Fetched data:", data);

        setFolders([
          { name: "Profile", count: data.Profile.total },
          { name: "BettaFish/Image", count: data.BettaFishImage.total },
          { name: "BettaFish/Video", count: data.BettaFishVideo.total },
        ]);
      } catch (error) {
        console.error("Error fetching all files:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllFiles();
  }, []);

  // ฟังก์ชันสำหรับกดแสดงข้อมูลของโฟลเดอร์
  const handleFolderClick = async (folder) => {
    setSelectedFolder(folder);
    setLoading(true);
    setIsMultiSelect(false);
    setSelectedFiles([]);

    try {
      const response = await axios.get(
        `/files/${encodeURIComponent(folder)}/files`
      );
      const data = response.data;
      console.log(`Selected Folder: ${folder}`, data);
      setFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  // ฟังก์ชันสำหรับจัดการการเลือกไฟล์
  const handleSelectFile = (file) => {
    setSelectedFiles((prevSelectedFiles) =>
      prevSelectedFiles.includes(file)
        ? prevSelectedFiles.filter((f) => f !== file)
        : [...prevSelectedFiles, file]
    );
  };

  // ฟังก์ชันสำหรับลบไฟล์ที่เลือก
  const handleDeleteSelectedFiles = async () => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ที่เลือก?")) return;

    setLoading(true);
    try {
      await Promise.all(
        selectedFiles.map((file) =>
          axios.delete(`/files/${encodeURIComponent(selectedFolder)}/${file.name}`)
        )
      );
      alert("ไฟล์ถูกลบเรียบร้อย");
      setSelectedFiles([]);
      handleFolderClick(selectedFolder);
    } catch (error) {
      console.error("Error deleting files:", error);
      alert("เกิดข้อผิดพลาดในการลบไฟล์");
    } finally {
      setLoading(false);
    }
  };

  // ฟังก์ชันสำหรับดาวน์โหลดไฟล์ที่เลือก
  const handleDownloadSelectedFiles = () => {
    selectedFiles.forEach((file) => {
      console.log("Downloading:", file.downloadUrl);
      window.open(file.downloadUrl, "_blank");
    });
  };

  // ฟังก์ชันสำหรับดาวน์โหลด ZIP
  const handleDownloadZip = async () => {
    if (!selectedFolder) return;

    try {
      const response = await axios.get(
        `/files/${encodeURIComponent(selectedFolder)}/download-zip`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedFolder}.zip`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error downloading ZIP:", error);
      alert("เกิดข้อผิดพลาดในการดาวน์โหลด ZIP");
    }
  };

  // Pagination Logic
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentFiles = files.slice(indexOfFirstImage, indexOfLastImage);

  const handleNextPage = () => {
    if (currentPage < Math.ceil(files.length / imagesPerPage)) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* AdminMenu (Navbar) อยู่ใน App.jsx หรือ Layout กลางแล้ว */}
      {/* เว้นระยะด้านบนป้องกันการทับ Navbar */}
      <div className="pt-20 p-8 w-full">
        <h1 className="text-3xl font-bold mb-6">จัดการฐานข้อมูล</h1>

        {loading && <p>กำลังโหลดข้อมูล...</p>}

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">โฟลเดอร์ในระบบ</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {folders.map((folder, index) => (
              <div key={index} className="bg-gray-100 p-4 rounded shadow">
                <h3 className="text-lg font-medium">{folder.name}</h3>
                <p className="text-sm text-gray-500">
                  จำนวนไฟล์: {folder.count}
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => handleFolderClick(folder.name)}
                    className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
                  >
                    แสดงข้อมูล
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedFolder && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">
              ไฟล์ในโฟลเดอร์: {selectedFolder}
            </h2>
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setIsMultiSelect((prev) => !prev)}
                className={`py-2 px-4 rounded ${
                  isMultiSelect
                    ? "bg-gray-500 text-white"
                    : "bg-blue-500 text-white"
                }`}
              >
                {isMultiSelect ? "ยกเลิกการเลือกหลายรายการ" : "เลือกหลายรายการ"}
              </button>

              {isMultiSelect && (
                <>
                  <button
                    onClick={handleDownloadSelectedFiles}
                    className="bg-blue-500 text-white py-2 px-4 rounded"
                    disabled={selectedFiles.length === 0}
                  >
                    ดาวน์โหลดที่เลือก
                  </button>
                  <button
                    onClick={handleDeleteSelectedFiles}
                    className="bg-red-500 text-white py-2 px-4 rounded"
                    disabled={selectedFiles.length === 0}
                  >
                    ลบที่เลือก
                  </button>
                </>
              )}

              {/* ปุ่มดาวน์โหลด ZIP */}
              <button
                onClick={handleDownloadZip}
                className="bg-green-500 text-white py-2 px-4 rounded"
                disabled={!selectedFolder}
              >
                ดาวน์โหลด ZIP
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {currentFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-white p-4 rounded shadow-md"
                >
                  {file.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <>
                      <img
                        src={file.downloadUrl}
                        alt={`Image ${file.name}`}
                        className="w-full h-40 object-cover rounded mb-2 cursor-pointer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/150";
                        }}
                        onClick={() => handleOpenModal(file.downloadUrl)}
                      />
                      <button
                        onClick={() => handleOpenModal(file.downloadUrl)}
                        className="bg-blue-500 text-white py-1 px-4 rounded mb-2"
                      >
                        ดูภาพเต็ม
                      </button>
                    </>
                  ) : (
                    <video
                      src={file.downloadUrl}
                      className="w-full h-40 rounded mb-2"
                      controls
                      onError={(e) => {
                        e.target.onerror = null;
                        alert(`ไม่สามารถโหลดวิดีโอ: ${file.name}`);
                      }}
                    />
                  )}
                  {isMultiSelect && (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file)}
                        onChange={() => handleSelectFile(file)}
                        className="mr-2"
                      />
                      <span className="text-sm">{file.name}</span>
                    </label>
                  )}
                </div>
              ))}
            </div>

            {files.length > imagesPerPage && (
              <div className="pagination mt-4 flex justify-center">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded mr-2"
                >
                  ก่อนหน้า
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === Math.ceil(files.length / imagesPerPage)}
                  className="bg-gray-300 text-gray-700 py-2 px-4 rounded"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal แสดงภาพเต็ม */}
        {isModalOpen && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            onClick={handleCloseModal}
          >
            <div
              className="bg-white p-4 rounded relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center"
                onClick={handleCloseModal}
              >
                ✕
              </button>
              <img
                src={modalImage}
                alt="Full View"
                className="max-w-full max-h-[80vh] object-contain"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseManagement;

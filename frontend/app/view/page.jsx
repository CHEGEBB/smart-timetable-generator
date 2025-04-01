"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  Menu, 
  Search,
  Download,
  Filter,
  RefreshCw,
  ChevronDown
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import { getAllTimetables, exportTimetable } from "@/services/timetableService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ViewTimetable() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("view");
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timetables, setTimetables] = useState([]);
  const [selectedTimetable, setSelectedTimetable] = useState(null);
  const [viewMode, setViewMode] = useState("all"); // all, teacher, class, room
  const [searchTerm, setSearchTerm] = useState("");
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchTimetables = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTimetables();
        setTimetables(data);
        
        // Set the first timetable as selected if available
        if (data.length > 0) {
          setSelectedTimetable(data[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        toast.error(err.message || "Failed to fetch timetables");
      }
    };
    
    fetchTimetables();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleExportPDF = async (id) => {
    try {
      const blob = await exportTimetable(id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timetable-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Timetable exported successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to export timetable");
    }
  };

  const getDayName = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Dummy periods for the demo
  const periods = [1, 2, 3, 4, 5, 6];
  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  // This would be replaced with actual schedule data from your backend
  const renderTimetableSchedule = () => {
    if (!selectedTimetable) return null;
    
    // Dummy data for visualization - replace with actual data
    const dummySchedule = {};
    
    days.forEach(day => {
      dummySchedule[day] = {};
      periods.forEach(period => {
        // Create random entries for demonstration
        if (Math.random() > 0.3) {
          dummySchedule[day][period] = {
            subject: ["Mathematics", "Physics", "Chemistry", "Computer Science", "Biology"][Math.floor(Math.random() * 5)],
            teacher: ["Dr. Smith", "Ms. Johnson", "Mr. Lee", "Mrs. Garcia"][Math.floor(Math.random() * 4)],
            room: ["Room 101", "Lab 2", "Hall A", "Class 203"][Math.floor(Math.random() * 4)],
            class: ["Grade 10A", "Grade 11B", "Grade 12C"][Math.floor(Math.random() * 3)]
          };
        }
      });
    });
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 bg-slate-700 text-left rounded-tl-lg">Time/Day</th>
              {days.map(day => (
                <th key={day} className="p-3 bg-slate-700 text-center">
                  {getDayName(day)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period} className={period % 2 === 0 ? "bg-slate-800/50" : "bg-slate-800"}>
                <td className="p-3 font-medium border-r border-slate-700">
                  Period {period}
                </td>
                {days.map(day => {
                  const entry = dummySchedule[day][period];
                  
                  if (!entry) {
                    return (
                      <td key={day} className="p-2 text-center border-r border-slate-700 text-slate-500">
                        Free
                      </td>
                    );
                  }
                  
                  return (
                    <td key={day} className="p-2 border-r border-slate-700">
                      <div className="bg-slate-700 rounded p-2">
                        <div className="font-medium text-emerald-400">{entry.subject}</div>
                        <div className="text-sm text-slate-300">{entry.teacher}</div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>{entry.room}</span>
                          <span>{entry.class}</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              {/* Mobile Menu Toggle */}
              <button onClick={toggleSidebar} className="lg:hidden mr-4 text-slate-400 hover:text-white">
                <Menu size={24} />
              </button>
              
              {/* Search Bar */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                />
              </div>
            </div>
            
            {/* Right Side Nav Items */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Clock size={20} />
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Calendar size={20} />
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">View Timetables</h1>
                <p className="text-slate-400">View, filter, and export your generated timetables.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {/* View Mode */}
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="all">All</option>
                    <option value="teacher">By Teacher</option>
                    <option value="class">By Class</option>
                    <option value="room">By Room</option>
                  </select>
                </div>
                
                {/* Export Button */}
                {selectedTimetable && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportPDF(selectedTimetable._id)}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Download size={16} />
                    <span>Export as PDF</span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="bg-rose-900/20 border border-rose-800 text-rose-300 p-4 rounded-lg flex items-center gap-3 mb-6">
              <div className="bg-rose-800/50 p-2 rounded-full">
                <RefreshCw size={20} className="text-rose-200" />
              </div>
              <div>
                <h3 className="font-medium">Error Loading Timetables</h3>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* No Timetables */}
          {!isLoading && !error && timetables.length === 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No Timetables Found</h3>
              <p className="text-slate-400 mb-6">You haven't generated any timetables yet. Generate a new timetable to get started.</p>
              <button 
                onClick={() => setActiveTab("generate")}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-6 rounded-lg transition-all duration-300"
              >
                Generate New Timetable
              </button>
            </div>
          )}

          {/* Timetable Selection */}
          {!isLoading && !error && timetables.length > 0 && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg mb-6 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="font-medium text-lg">Select Timetable</h2>
                <button className="text-slate-400 hover:text-white flex items-center gap-1 text-sm">
                  <RefreshCw size={14} />
                  <span>Refresh</span>
                </button>
              </div>
              <div className="p-4 max-h-64 overflow-y-auto">
                {timetables.map(timetable => (
                  <div 
                    key={timetable._id}
                    onClick={() => setSelectedTimetable(timetable)}
                    className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors duration-200 flex justify-between items-center ${
                      selectedTimetable && selectedTimetable._id === timetable._id 
                        ? 'bg-slate-700' 
                        : 'bg-slate-800/50 hover:bg-slate-700/50'
                    }`}
                  >
                    <div>
                      <h3 className="font-medium">{timetable.name || `Timetable ${timetable._id.slice(-5)}`}</h3>
                      <p className="text-sm text-slate-400">Created on {new Date(timetable.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExportPDF(timetable._id);
                      }}
                      className="text-slate-400 hover:text-emerald-400 p-2 rounded hover:bg-slate-700"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Timetable View */}
          {selectedTimetable && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <h2 className="font-medium text-lg">
                  {selectedTimetable.name || `Timetable ${selectedTimetable._id.slice(-5)}`}
                </h2>
                
                <div className="flex gap-2">
                  <div className="relative">
                    <button className="bg-slate-700 py-1.5 px-3 rounded-lg text-sm flex items-center gap-1.5">
                      <span>{viewMode === 'all' ? 'All' : `${viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View`}</span>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {renderTimetableSchedule()}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
    
    {/* Toast Container for notifications */}
    <ToastContainer 
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  </div>
);
}
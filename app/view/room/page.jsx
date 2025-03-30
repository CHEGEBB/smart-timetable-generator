"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  ChevronDown, 
  Clock, 
  Download, 
  Menu, 
  MessageSquare, 
  Printer, 
  Search, 
  Share2, 
  Home
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../../sass/fonts.scss";

// Dummy room data
const roomsData = [
  { id: 1, name: "Room 101", capacity: 30 },
  { id: 2, name: "Room 201", capacity: 25 },
  { id: 3, name: "Lab 101", capacity: 20 },
  { id: 4, name: "Lab 201", capacity: 15 },
  { id: 5, name: "Room 301", capacity: 35 },
];

// Timetable data for rooms
const timetableData = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  periods: [1, 2, 3, 4, 5, 6, 7, 8],
  rooms: {
    "Room 101": [
      { day: "Monday", period: 1, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 10A" },
      { day: "Monday", period: 3, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 9C" },
      { day: "Tuesday", period: 2, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 11B" },
      { day: "Tuesday", period: 4, subject: "Mathematics", teacher: "Prof. Brown", class: "Grade 10B" },
      { day: "Wednesday", period: 1, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 10A" },
      { day: "Wednesday", period: 5, subject: "Advanced Mathematics", teacher: "Prof. Brown", class: "Grade 11B" },
      { day: "Thursday", period: 3, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 10A" },
      { day: "Thursday", period: 6, subject: "Mathematics", teacher: "Prof. Brown", class: "Grade 9C" },
      { day: "Friday", period: 2, subject: "Advanced Mathematics", teacher: "Prof. Brown", class: "Grade 11B" },
      { day: "Friday", period: 4, subject: "Mathematics", teacher: "Prof. Johnson", class: "Grade 10B" },
    ],
    "Room 201": [
      { day: "Monday", period: 2, subject: "English", teacher: "Ms. Parker", class: "Grade 10A" },
      { day: "Monday", period: 4, subject: "English Literature", teacher: "Ms. Parker", class: "Grade 11B" },
      { day: "Tuesday", period: 1, subject: "English", teacher: "Ms. Parker", class: "Grade 9C" },
      { day: "Tuesday", period: 5, subject: "English", teacher: "Ms. Parker", class: "Grade 10B" },
      { day: "Wednesday", period: 3, subject: "English Literature", teacher: "Ms. Parker", class: "Grade 11B" },
      { day: "Wednesday", period: 7, subject: "English", teacher: "Ms. Parker", class: "Grade 10A" },
      { day: "Thursday", period: 1, subject: "English", teacher: "Ms. Parker", class: "Grade 10A" },
      { day: "Thursday", period: 4, subject: "English Literature", teacher: "Ms. Parker", class: "Grade 11B" },
      { day: "Friday", period: 3, subject: "English", teacher: "Ms. Parker", class: "Grade 9C" },
      { day: "Friday", period: 6, subject: "English", teacher: "Ms. Parker", class: "Grade 10B" },
    ],
    "Lab 101": [
      { day: "Monday", period: 1, subject: "Computer Science", teacher: "Dr. Smith", class: "Grade 10A" },
      { day: "Monday", period: 3, subject: "Programming", teacher: "Dr. Smith", class: "Grade 11B" },
      { day: "Tuesday", period: 4, subject: "Computer Science", teacher: "Dr. Smith", class: "Grade 9C" },
      { day: "Tuesday", period: 6, subject: "Programming", teacher: "Dr. Smith", class: "Grade 10B" },
      { day: "Wednesday", period: 4, subject: "Computer Science", teacher: "Dr. Smith", class: "Grade 10A" },
      { day: "Wednesday", period: 6, subject: "Programming", teacher: "Dr. Smith", class: "Grade 11B" },
      { day: "Thursday", period: 5, subject: "Computer Science", teacher: "Dr. Smith", class: "Grade 9C" },
      { day: "Thursday", period: 8, subject: "Programming", teacher: "Dr. Smith", class: "Grade 10B" },
      { day: "Friday", period: 1, subject: "Computer Science", teacher: "Dr. Smith", class: "Grade 10A" },
      { day: "Friday", period: 7, subject: "Programming", teacher: "Dr. Smith", class: "Grade 11B" },
    ],
    "Lab 201": [
      { day: "Monday", period: 4, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 10A" },
      { day: "Monday", period: 6, subject: "Advanced Physics", teacher: "Dr. Wilson", class: "Grade 11B" },
      { day: "Tuesday", period: 1, subject: "Advanced Physics", teacher: "Dr. Wilson", class: "Grade 11B" },
      { day: "Tuesday", period: 3, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 9C" },
      { day: "Wednesday", period: 2, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 10A" },
      { day: "Wednesday", period: 7, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 10B" },
      { day: "Thursday", period: 2, subject: "Advanced Physics", teacher: "Dr. Wilson", class: "Grade 11B" },
      { day: "Thursday", period: 4, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 9C" },
      { day: "Friday", period: 2, subject: "Physics", teacher: "Dr. Wilson", class: "Grade 10A" },
      { day: "Friday", period: 5, subject: "Advanced Physics", teacher: "Dr. Wilson", class: "Grade 11B" },
    ],
    "Room 301": [
      { day: "Monday", period: 2, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 10B" },
      { day: "Monday", period: 5, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 9C" },
      { day: "Tuesday", period: 2, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 10A" },
      { day: "Tuesday", period: 5, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 11B" },
      { day: "Wednesday", period: 3, subject: "Biology", teacher: "Ms. Green", class: "Grade 10B" },
      { day: "Wednesday", period: 5, subject: "Biology", teacher: "Ms. Green", class: "Grade 9C" },
      { day: "Thursday", period: 2, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 10A" },
      { day: "Thursday", period: 7, subject: "Chemistry", teacher: "Dr. Lee", class: "Grade 11B" },
      { day: "Friday", period: 3, subject: "Biology", teacher: "Ms. Green", class: "Grade 10B" },
      { day: "Friday", period: 6, subject: "Biology", teacher: "Ms. Green", class: "Grade 9C" },
    ],
  }
};

// Using color coding for subjects for visual distinction
const subjectColors = {
  "Computer Science": "emerald",
  "Programming": "teal",
  "Advanced Programming": "cyan",
  "Mathematics": "blue",
  "Advanced Mathematics": "indigo",
  "Calculus": "indigo",
  "Advanced Calculus": "violet",
  "Physics": "amber",
  "Advanced Physics": "amber",
  "Chemistry": "rose",
  "Biology": "green",
  "English": "purple",
  "English Literature": "purple",
};

export default function RoomTimetableView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("view/room");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState("Room 101");
  const [selectedWeek, setSelectedWeek] = useState("Current Week");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [filterType, setFilterType] = useState("all");
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleExportMenu = () => {
    setIsExportMenuOpen(!isExportMenuOpen);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Handle export functions
  const exportAsPDF = () => {
    alert(`Exporting ${selectedRoom}'s timetable as PDF`);
    setIsExportMenuOpen(false);
  };

  const exportAsExcel = () => {
    alert(`Exporting ${selectedRoom}'s timetable as Excel`);
    setIsExportMenuOpen(false);
  };

  const exportAsImage = () => {
    alert(`Exporting ${selectedRoom}'s timetable as Image`);
    setIsExportMenuOpen(false);
  };

  const printTimetable = () => {
    alert(`Printing ${selectedRoom}'s timetable`);
    setIsExportMenuOpen(false);
  };

  // Get the selected room's capacity
  const selectedRoomData = roomsData.find(room => room.name === selectedRoom);
  const roomCapacity = selectedRoomData ? selectedRoomData.capacity : 0;

  // Calculate room utilization rate
  const totalPeriods = timetableData.days.length * timetableData.periods.length;
  const usedPeriods = timetableData.rooms[selectedRoom]?.length || 0;
  const utilizationRate = Math.round((usedPeriods / totalPeriods) * 100);

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
              
              {/* Room Selector */}
              <div className="relative">
                <Home size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-64 bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                >
                  {roomsData.map(room => (
                    <option key={room.id} value={room.name}>{room.name} (Capacity: {room.capacity})</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            
            {/* Right Side Nav Items */}
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Clock size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Calendar size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
              <button className="relative p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <MessageSquare size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-6 bg-slate-900 ${isFullscreen ? 'fullscreen-mode' : ''}`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Room Timetable</h1>
                <p className="text-slate-400">Viewing schedule for {selectedRoom}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {/* Week Selector */}
                <div className="relative">
                  <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                  >
                    <option value="Current Week">Current Week</option>
                    <option value="Next Week">Next Week</option>
                    <option value="Week 3">Week 3</option>
                    <option value="Week 4">Week 4</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
                
                {/* Search Input */}
                <div className="relative">
                  <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-48"
                  />
                </div>
                
                {/* Export Button */}
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleExportMenu}
                    className="bg-slate-800 border border-slate-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Download size={16} />
                    <span>Export</span>
                    <ChevronDown size={14} />
                  </motion.button>
                  
                  {/* Export Menu Dropdown */}
                  <AnimatePresence>
                    {isExportMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-20"
                      >
                        <div className="py-1">
                          <button 
                            onClick={exportAsPDF} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Download size={14} />
                            <span>Export as PDF</span>
                          </button>
                          <button 
                            onClick={exportAsExcel} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Download size={14} />
                            <span>Export as Excel</span>
                          </button>
                          <button 
                            onClick={exportAsImage} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Download size={14} />
                            <span>Export as Image</span>
                          </button>
                          <button 
                            onClick={printTimetable} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Printer size={14} />
                            <span>Print Timetable</span>
                          </button>
                          <button 
                            onClick={() => {
                              navigator.clipboard.writeText(window.location.href);
                              alert("Link copied to clipboard!");
                              setIsExportMenuOpen(false);
                            }} 
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-700 flex items-center gap-2"
                          >
                            <Share2 size={14} />
                            <span>Share Link</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Fullscreen Toggle */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleFullscreen}
                  className="bg-slate-800 border border-slate-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  {isFullscreen ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                        <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                        <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                        <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
                      </svg>
                      <span>Exit Fullscreen</span>
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 8V5a2 2 0 0 1 2-2h3"></path>
                        <path d="M16 3h3a2 2 0 0 1 2 2v3"></path>
                        <path d="M21 16v3a2 2 0 0 1-2 2h-3"></path>
                        <path d="M8 21H5a2 2 0 0 1-2-2v-3"></path>
                      </svg>
                      <span>Fullscreen</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Filter Options */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button 
                onClick={() => setFilterType("all")}
                className={`px-3 py-1 rounded-full text-sm ${filterType === "all" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                All Classes
              </button>
              <button 
                onClick={() => setFilterType("Grade 10A")}
                className={`px-3 py-1 rounded-full text-sm ${filterType === "Grade 10A" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                Grade 10A
              </button>
              <button 
                onClick={() => setFilterType("Grade 11B")}
                className={`px-3 py-1 rounded-full text-sm ${filterType === "Grade 11B" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                Grade 11B
              </button>
              <button 
                onClick={() => setFilterType("Grade 9C")}
                className={`px-3 py-1 rounded-full text-sm ${filterType === "Grade 9C" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                Grade 9C
              </button>
              <button 
                onClick={() => setFilterType("Grade 10B")}
                className={`px-3 py-1 rounded-full text-sm ${filterType === "Grade 10B" ? "bg-emerald-600 text-white" : "bg-slate-800 text-slate-300"}`}
              >
                Grade 10B
              </button>
            </div>

            {/* Timetable Grid */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-x-auto">
              <div className="min-w-[768px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-4 border-b border-slate-700 text-left bg-slate-800 sticky left-0 z-10">Time / Day</th>
                      {timetableData.days.map(day => (
                        <th key={day} className="p-4 border-b border-slate-700 text-center font-medium">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timetableData.periods.map(period => (
                      <tr key={period} className="hover:bg-slate-700/30">
                        <td className="p-4 border-b border-slate-700 bg-slate-800 sticky left-0 z-10">
                          <div className="font-medium">Period {period}</div>
                          <div className="text-xs text-slate-400">
                            {(period === 1 && "8:00 - 8:45") ||
                             (period === 2 && "8:50 - 9:35") ||
                             (period === 3 && "9:40 - 10:25") ||
                             (period === 4 && "10:30 - 11:15") ||
                             (period === 5 && "11:20 - 12:05") ||
                             (period === 6 && "12:10 - 12:55") ||
                             (period === 7 && "13:00 - 13:45") ||
                             (period === 8 && "13:50 - 14:35")}
                          </div>
                        </td>
                        {timetableData.days.map(day => {
                          const session = timetableData.rooms[selectedRoom]?.find(
                            s => s.day === day && s.period === period
                          );
                          
                          // Filter based on selected class filter and search term
                          const shouldShow = 
                            session && 
                            (filterType === "all" || session.class === filterType) &&
                            (searchTerm === "" || 
                              session.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              session.teacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              session.class.toLowerCase().includes(searchTerm.toLowerCase()));
                          
                          return (
                            <td key={day} className="p-2 border-b border-slate-700 text-center">
                              {shouldShow ? (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-3 rounded-lg bg-${subjectColors[session.subject]}-900/30 border border-${subjectColors[session.subject]}-800/50 text-${subjectColors[session.subject]}-400 text-left`}
                                >
                                  <div className="font-medium">{session.subject}</div>
                                  <div className="text-xs mt-1">Teacher: {session.teacher}</div>
                                  <div className="text-xs mt-1">Class: {session.class}</div>
                                </motion.div>
                              ) : session && !shouldShow ? (
                                <div className="p-3 rounded-lg bg-slate-700/20 border border-slate-700 text-slate-500 text-left">
                                  <div className="font-medium">Filtered</div>
                                </div>
                              ) : (
                                <div className="text-slate-500 text-sm">Available</div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Room Information Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Today's Schedule Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Today's Schedule</h3>
                <div className="space-y-3">
                  {timetableData.rooms[selectedRoom]
                    ?.filter(s => s.day === "Monday") // Assuming "Monday" is today
                    .sort((a, b) => a.period - b.period)
                    .map((session, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ x: 5 }}
                        className={`p-3 rounded-lg bg-${subjectColors[session.subject]}-900/20 border-l-4 border-${subjectColors[session.subject]}-500 flex justify-between items-center`}
                      >
                        <div>
                          <div className="font-medium">{session.subject}</div>
                          <div className="text-xs text-slate-400">Class: {session.class}</div>
                          <div className="text-xs text-slate-400">Teacher: {session.teacher}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">Period {session.period}</div>
                          <div className="text-xs text-slate-400">
                            {(session.period === 1 && "8:00 - 8:45") ||
                             (session.period === 2 && "8:50 - 9:35") ||
                             (session.period === 3 && "9:40 - 10:25") ||
                             (session.period === 4 && "10:30 - 11:15") ||
                             (session.period === 5 && "11:20 - 12:05") ||
                             (session.period === 6 && "12:10 - 12:55") ||
                             (session.period === 7 && "13:00 - 13:45") ||
                             (session.period === 8 && "13:50 - 14:35")}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>

              {/* Room Statistics Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Room Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Capacity</div>
                    <div className="text-2xl font-bold mt-1">{roomCapacity} seats</div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-sm text-slate-400">Utilization</div>
                    <div className="text-2xl font-bold mt-1">{utilizationRate}%</div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Classes per Day</div>
                    <div className="text-2xl font-bold mt-1">
                      {Math.round(usedPeriods / timetableData.days.length)}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Free Periods</div>
                    <div className="text-2xl font-bold mt-1">
                      {totalPeriods - usedPeriods}
                    </div>
                  </div>
                </div>
                
                {/* Utilization Chart */}
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Utilization by Day</h4>
                  <div className="bg-slate-700/30 p-3 rounded-lg">
                    {timetableData.days.map(day => {
                      const dayClasses = timetableData.rooms[selectedRoom]?.filter(s => s.day === day).length || 0;
                      const dayUtilization = Math.round((dayClasses / timetableData.periods.length) * 100);
                      
                      return (
                        <div key={day} className="mb-2 last:mb-0">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{day}</span>
                            <span>{dayUtilization}%</span>
                          </div>
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${dayUtilization}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
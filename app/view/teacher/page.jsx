"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  ChevronDown, 
  Clock, 
  Download, 
  Filter, 
  Menu, 
  MessageSquare, 
  Printer, 
  Search, 
  Share2, 
  User
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../../sass/fonts.scss";

// Dummy timetable data for teachers
const teachersData = [
  { id: 1, name: "Dr. Smith" },
  { id: 2, name: "Prof. Johnson" },
  { id: 3, name: "Dr. Wilson" },
  { id: 4, name: "Ms. Davis" },
  { id: 5, name: "Prof. Brown" },
];

const timetableData = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  periods: [1, 2, 3, 4, 5, 6, 7, 8],
  classes: {
    "Dr. Smith": [
      { day: "Monday", period: 1, class: "Grade 10A", subject: "Computer Science", room: "Lab 101" },
      { day: "Monday", period: 3, class: "Grade 11B", subject: "Programming", room: "Lab 102" },
      { day: "Tuesday", period: 2, class: "Grade 9C", subject: "Computer Science", room: "Lab 101" },
      { day: "Tuesday", period: 5, class: "Grade 12A", subject: "Advanced Programming", room: "Lab 103" },
      { day: "Wednesday", period: 4, class: "Grade 10A", subject: "Computer Science", room: "Lab 101" },
      { day: "Thursday", period: 2, class: "Grade 9C", subject: "Computer Science", room: "Lab 101" },
      { day: "Thursday", period: 6, class: "Grade 11B", subject: "Programming", room: "Lab 102" },
      { day: "Friday", period: 1, class: "Grade 12A", subject: "Advanced Programming", room: "Lab 103" },
    ],
    "Prof. Johnson": [
      { day: "Monday", period: 2, class: "Grade 10B", subject: "Mathematics", room: "Room 201" },
      { day: "Monday", period: 4, class: "Grade 11A", subject: "Calculus", room: "Room 202" },
      { day: "Tuesday", period: 1, class: "Grade 9A", subject: "Mathematics", room: "Room 201" },
      { day: "Wednesday", period: 3, class: "Grade 12B", subject: "Advanced Calculus", room: "Room 203" },
      { day: "Wednesday", period: 5, class: "Grade 10B", subject: "Mathematics", room: "Room 201" },
      { day: "Thursday", period: 4, class: "Grade 11A", subject: "Calculus", room: "Room 202" },
      { day: "Friday", period: 2, class: "Grade 9A", subject: "Mathematics", room: "Room 201" },
      { day: "Friday", period: 6, class: "Grade 12B", subject: "Advanced Calculus", room: "Room 203" },
    ],
    // Additional teachers' data could be added here
  }
};

// Subject colors for visual distinction
const subjectColors = {
  "Computer Science": "emerald",
  "Programming": "teal",
  "Advanced Programming": "cyan",
  "Mathematics": "blue",
  "Calculus": "indigo",
  "Advanced Calculus": "violet",
  "Physics": "amber",
  "Chemistry": "rose",
  "Biology": "green",
  "English": "purple",
};

export default function TeacherTimetableView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("view/teacher");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState("Dr. Smith");
  const [selectedWeek, setSelectedWeek] = useState("Current Week");
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
    alert(`Exporting ${selectedTeacher}'s timetable as PDF`);
    setIsExportMenuOpen(false);
  };

  const exportAsExcel = () => {
    alert(`Exporting ${selectedTeacher}'s timetable as Excel`);
    setIsExportMenuOpen(false);
  };

  const exportAsImage = () => {
    alert(`Exporting ${selectedTeacher}'s timetable as Image`);
    setIsExportMenuOpen(false);
  };

  const printTimetable = () => {
    alert(`Printing ${selectedTeacher}'s timetable`);
    setIsExportMenuOpen(false);
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
              
              {/* Teacher Selector */}
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedTeacher}
                  onChange={(e) => setSelectedTeacher(e.target.value)}
                  className="w-64 bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                >
                  {teachersData.map(teacher => (
                    <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
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
                <h1 className="text-2xl font-bold">Teacher Timetable</h1>
                <p className="text-slate-400">Viewing schedule for {selectedTeacher}</p>
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
                          const session = timetableData.classes[selectedTeacher]?.find(
                            s => s.day === day && s.period === period
                          );
                          
                          return (
                            <td key={day} className="p-2 border-b border-slate-700 text-center">
                              {session ? (
                                <motion.div
                                  whileHover={{ scale: 1.02 }}
                                  className={`p-3 rounded-lg bg-${subjectColors[session.subject]}-900/30 border border-${subjectColors[session.subject]}-800/50 text-${subjectColors[session.subject]}-400 text-left`}
                                >
                                  <div className="font-medium">{session.subject}</div>
                                  <div className="text-xs mt-1">{session.class}</div>
                                  <div className="text-xs mt-1">Room: {session.room}</div>
                                </motion.div>
                              ) : (
                                <div className="text-slate-500 text-sm">Free</div>
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

            {/* Teacher Information Card */}
            <div className="mt-6 bg-slate-800 border border-slate-700 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-3">Teacher Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-sm text-slate-400">Total Classes</div>
                  <div className="text-2xl font-bold mt-1">{timetableData.classes[selectedTeacher]?.length || 0}</div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-sm text-slate-400">Assigned Rooms</div>
                  <div className="text-2xl font-bold mt-1">
                    {new Set(timetableData.classes[selectedTeacher]?.map(s => s.room)).size || 0}
                  </div>
                </div>
                <div className="p-4 bg-slate-700/30 rounded-lg">
                  <div className="text-sm text-slate-400">Classes Today</div>
                  <div className="text-2xl font-bold mt-1">
                    {timetableData.classes[selectedTeacher]?.filter(s => s.day === "Monday").length || 0}
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
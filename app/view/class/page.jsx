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
  Users
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../../sass/fonts.scss";


// Dummy timetable data for classes
const classesData = [
  { id: 1, name: "Grade 10A" },
  { id: 2, name: "Grade 11B" },
  { id: 3, name: "Grade 9C" },
  { id: 4, name: "Grade 12A" },
  { id: 5, name: "Grade 10B" },
];

const timetableData = {
  days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  periods: [1, 2, 3, 4, 5, 6, 7, 8],
  classes: {
    "Grade 10A": [
      { day: "Monday", period: 1, subject: "Computer Science", teacher: "Dr. Smith", room: "Lab 101" },
      { day: "Monday", period: 2, subject: "English", teacher: "Ms. Parker", room: "Room 301" },
      { day: "Monday", period: 4, subject: "Physics", teacher: "Dr. Wilson", room: "Lab 201" },
      { day: "Tuesday", period: 3, subject: "Mathematics", teacher: "Prof. Johnson", room: "Room 201" },
      { day: "Tuesday", period: 5, subject: "Chemistry", teacher: "Dr. Lee", room: "Lab 202" },
      { day: "Wednesday", period: 4, subject: "Computer Science", teacher: "Dr. Smith", room: "Lab 101" },
      { day: "Wednesday", period: 6, subject: "Biology", teacher: "Ms. Green", room: "Lab 203" },
      { day: "Thursday", period: 1, subject: "English", teacher: "Ms. Parker", room: "Room 301" },
      { day: "Thursday", period: 3, subject: "Mathematics", teacher: "Prof. Johnson", room: "Room 201" },
      { day: "Friday", period: 2, subject: "Physics", teacher: "Dr. Wilson", room: "Lab 201" },
      { day: "Friday", period: 5, subject: "Biology", teacher: "Ms. Green", room: "Lab 203" },
    ],
    "Grade 11B": [
      { day: "Monday", period: 3, subject: "Programming", teacher: "Dr. Smith", room: "Lab 102" },
      { day: "Monday", period: 5, subject: "Advanced Mathematics", teacher: "Prof. Brown", room: "Room 202" },
      { day: "Tuesday", period: 1, subject: "Advanced Physics", teacher: "Dr. Wilson", room: "Lab 201" },
      { day: "Tuesday", period: 4, subject: "English Literature", teacher: "Ms. Parker", room: "Room 302" },
      { day: "Wednesday", period: 2, subject: "Chemistry", teacher: "Dr. Lee", room: "Lab 202" },
      { day: "Wednesday", period: 5, subject: "Advanced Mathematics", teacher: "Prof. Brown", room: "Room 202" },
      { day: "Thursday", period: 6, subject: "Programming", teacher: "Dr. Smith", room: "Lab 102" },
      { day: "Thursday", period: 7, subject: "English Literature", teacher: "Ms. Parker", room: "Room 302" },
      { day: "Friday", period: 3, subject: "Advanced Physics", teacher: "Dr. Wilson", room: "Lab 201" },
      { day: "Friday", period: 4, subject: "Chemistry", teacher: "Dr. Lee", room: "Lab 202" },
    ],
    // Additional classes' data could be added here
  }
};

// Using same subject colors as teacher view for consistency
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

export default function ClassTimetableView() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("view/class");
  const [isMobile, setIsMobile] = useState(false);
  const [selectedClass, setSelectedClass] = useState("Grade 10A");
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
    alert(`Exporting ${selectedClass}'s timetable as PDF`);
    setIsExportMenuOpen(false);
  };

  const exportAsExcel = () => {
    alert(`Exporting ${selectedClass}'s timetable as Excel`);
    setIsExportMenuOpen(false);
  };

  const exportAsImage = () => {
    alert(`Exporting ${selectedClass}'s timetable as Image`);
    setIsExportMenuOpen(false);
  };

  const printTimetable = () => {
    alert(`Printing ${selectedClass}'s timetable`);
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
              
              {/* Class Selector */}
              <div className="relative">
                <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-64 bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 appearance-none"
                >
                  {classesData.map(classItem => (
                    <option key={classItem.id} value={classItem.name}>{classItem.name}</option>
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
                <h1 className="text-2xl font-bold">Class Timetable</h1>
                <p className="text-slate-400">Viewing schedule for {selectedClass}</p>
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
                          const session = timetableData.classes[selectedClass]?.find(
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
                                  <div className="text-xs mt-1">Teacher: {session.teacher}</div>
                                  <div className="text-xs mt-1">Room: {session.room}</div>
                                </motion.div>
                              ) : (
                                <div className="text-slate-500 text-sm">Break</div>
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

            {/* Class Information Cards */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Today's Classes Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Today's Classes</h3>
                <div className="space-y-3">
                  {timetableData.classes[selectedClass]
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
                          <div className="text-xs text-slate-400">Room: {session.room}</div>
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

              {/* Class Statistics Card */}
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                <h3 className="text-lg font-medium mb-3">Class Statistics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Total Subjects</div>
                    <div className="text-2xl font-bold mt-1">
                      {new Set(timetableData.classes[selectedClass]?.map(s => s.subject)).size || 0}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Weekly Classes</div>
                    <div className="text-2xl font-bold mt-1">{timetableData.classes[selectedClass]?.length || 0}</div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Rooms Used</div>
                    <div className="text-2xl font-bold mt-1">
                      {new Set(timetableData.classes[selectedClass]?.map(s => s.room)).size || 0}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <div className="text-sm text-slate-400">Teachers</div>
                    <div className="text-2xl font-bold mt-1">
                      {new Set(timetableData.classes[selectedClass]?.map(s => s.teacher)).size || 0}
                    </div>
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
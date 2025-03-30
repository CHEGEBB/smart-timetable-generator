"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Loader2,
  Menu,
  MessageSquare,
  RefreshCw,
  Save,
  Search,
  Settings,
  ShieldAlert,
  Sliders,
  X 
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../sass/fonts.scss";

// Sample data (would be fetched from API)
const classesData = [
  { id: 1, name: "Grade 10A" },
  { id: 2, name: "Grade 10B" },
  { id: 3, name: "Grade 11A" },
  { id: 4, name: "Grade 11B" },
  { id: 5, name: "Grade 12A" },
];

const teachersData = [
  { id: 1, name: "Dr. Smith", subjects: ["Computer Science", "Mathematics"] },
  { id: 2, name: "Prof. Johnson", subjects: ["Mathematics", "Physics"] },
  { id: 3, name: "Dr. Wilson", subjects: ["Physics", "Chemistry"] },
  { id: 4, name: "Ms. Davis", subjects: ["English", "History"] },
  { id: 5, name: "Prof. Brown", subjects: ["Chemistry", "Biology"] },
];

const roomsData = [
  { id: 1, name: "Room 101", capacity: 40 },
  { id: 2, name: "Room 102", capacity: 35 },
  { id: 3, name: "Lab 201", capacity: 30 },
  { id: 4, name: "Room 301", capacity: 45 },
  { id: 5, name: "Auditorium", capacity: 100 },
];

const coursesData = [
  { id: 1, code: "CS101", name: "Introduction to Computer Science", department: "Computer Science", credit: 3 },
  { id: 2, code: "MATH201", name: "Calculus II", department: "Mathematics", credit: 4 },
  { id: 3, code: "PHYS101", name: "Physics for Engineers", department: "Physics", credit: 4 },
  { id: 4, code: "ENG110", name: "Academic Writing", department: "English", credit: 3 },
  { id: 5, code: "CHEM142", name: "General Chemistry", department: "Chemistry", credit: 4 },
];

export default function Generate() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("generate");
  const [isMobile, setIsMobile] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(true);
  const [timetable, setTimetable] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [conflictDetails, setConflictDetails] = useState([]);
  const [showConflicts, setShowConflicts] = useState(false);
  
  // Form state
  const [config, setConfig] = useState({
    name: "Spring 2025 Timetable",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    periodsPerDay: 6,
    breakAfter: 3,
    allowConflictResolution: true,
    prioritizeTeacherAvailability: true,
    minimizeRoomChanges: true,
    classes: [],
    // Additional preferences
    preferConsecutivePeriods: true,
    balanceSubjectDistribution: true,
    avoidLastPeriodForHeavySubjects: true
  });

  // Check screen size and set mobile state
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

  const toggleConfig = () => {
    setIsConfigOpen(!isConfigOpen);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig({
      ...config,
      [name]: type === "checkbox" ? checked : value
    });
  };

  // Handle day selection
  const handleDayToggle = (day) => {
    const currentDays = [...config.days];
    if (currentDays.includes(day)) {
      // Remove day if already selected
      setConfig({
        ...config,
        days: currentDays.filter(d => d !== day)
      });
    } else {
      // Add day if not selected
      setConfig({
        ...config,
        days: [...currentDays, day].sort((a, b) => {
          const order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
          return order.indexOf(a) - order.indexOf(b);
        })
      });
    }
  };

  // Handle class selection
  const handleClassToggle = (classId) => {
    const selectedClasses = [...config.classes];
    if (selectedClasses.includes(classId)) {
      setConfig({
        ...config,
        classes: selectedClasses.filter(id => id !== classId)
      });
    } else {
      setConfig({
        ...config,
        classes: [...selectedClasses, classId]
      });
    }
  };

  // Generate timetable function
  const generateTimetable = async () => {
    // Reset states
    setIsGenerating(true);
    setTimetable(null);
    setGenerationError(null);
    setConflictDetails([]);
    setShowConflicts(false);
    
    // In a real application, you would make an API call here
    // For now, we'll simulate the API call with a delay
    try {
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Simulate timetable generation or error based on selection
      if (config.classes.length === 0) {
        throw new Error("Please select at least one class for timetable generation.");
      }
      
      // 20% chance of conflicts to demonstrate conflict resolution interface
      const hasConflicts = Math.random() < 0.2;
      
      if (hasConflicts) {
        // Generate mock conflicts
        const mockConflicts = [
          {
            type: "teacher",
            description: "Dr. Smith is scheduled for CS101 and MATH201 at the same time (Monday, Period 2)",
            severity: "high",
            entities: ["Dr. Smith", "CS101", "MATH201"],
            suggestion: "Move MATH201 to Period 3 or assign Prof. Johnson to teach MATH201"
          },
          {
            type: "room",
            description: "Room 101 is double-booked for PHYS101 and CHEM142 (Tuesday, Period 4)",
            severity: "medium",
            entities: ["Room 101", "PHYS101", "CHEM142"],
            suggestion: "Move CHEM142 to Lab 201 which has necessary equipment"
          },
          {
            type: "class",
            description: "Grade 10A has two subjects scheduled at the same time (Wednesday, Period 1)",
            severity: "high",
            entities: ["Grade 10A", "CS101", "ENG110"],
            suggestion: "Move ENG110 to Period 5 which is currently empty"
          }
        ];
        
        setConflictDetails(mockConflicts);
        setShowConflicts(true);
      } else {
        // Generate a mock timetable
        const mockTimetable = generateMockTimetable();
        setTimetable(mockTimetable);
      }
    } catch (error) {
      console.error(error);
      setGenerationError(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to generate mock timetable data
  const generateMockTimetable = () => {
    const days = config.days;
    const periods = Array.from({ length: config.periodsPerDay }, (_, i) => i + 1);
    
    // Get selected classes
    const selectedClasses = classesData.filter(c => config.classes.includes(c.id));
    
    // Generate timetable for each class
    const classTimetables = {};
    
    selectedClasses.forEach(classItem => {
      const timetable = {};
      
      days.forEach(day => {
        timetable[day] = {};
        
        periods.forEach(period => {
          // Skip if it's break time
          if (period === config.breakAfter + 1) {
            timetable[day][period] = { type: "break", name: "Break" };
            return;
          }
          
          // 10% chance of free period
          if (Math.random() < 0.1) {
            timetable[day][period] = { type: "free", name: "Free Period" };
            return;
          }
          
          // Otherwise, assign a random course
          const randomCourse = coursesData[Math.floor(Math.random() * coursesData.length)];
          const randomTeacher = teachersData.filter(t => 
            t.subjects.includes(randomCourse.department)
          )[0] || teachersData[0];
          const randomRoom = roomsData[Math.floor(Math.random() * roomsData.length)];
          
          timetable[day][period] = {
            type: "class",
            courseId: randomCourse.id,
            courseName: randomCourse.name,
            courseCode: randomCourse.code,
            teacherId: randomTeacher.id,
            teacherName: randomTeacher.name,
            roomId: randomRoom.id,
            roomName: randomRoom.name
          };
        });
      });
      
      classTimetables[classItem.id] = {
        className: classItem.name,
        schedule: timetable
      };
    });
    
    return {
      name: config.name,
      generatedAt: new Date().toISOString(),
      classes: classTimetables
    };
  };

  const resolveConflicts = () => {
    setIsGenerating(true);
    setShowConflicts(false);
    
    // Simulate resolving conflicts
    setTimeout(() => {
      setTimetable(generateMockTimetable());
      setIsGenerating(false);
    }, 2000);
  };

  const exportTimetable = (format) => {
    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 2000);
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
              
              {/* Page Title */}
              <h1 className="text-xl font-semibold text-white">Generate Timetable</h1>
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
                <span className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-slate-900">
          <div className="max-w-7xl mx-auto p-6">
            
            {/* Introduction */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Generate Timetable</h1>
              <p className="text-slate-400">Configure parameters and generate conflict-free timetables for your school.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration Panel */}
              <div className="lg:col-span-1">
                <motion.div 
                  className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={toggleConfig}
                  >
                    <div className="flex items-center">
                      <Settings className="text-emerald-400 mr-2" size={18} />
                      <h2 className="font-semibold">Configuration</h2>
                    </div>
                    <motion.div
                      animate={{ rotate: isConfigOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={18} className="text-slate-400" />
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {isConfigOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-slate-700 p-4"
                      >
                        <form className="space-y-4">
                          {/* Timetable Name */}
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1">Timetable Name</label>
                            <input
                              type="text"
                              name="name"
                              value={config.name}
                              onChange={handleInputChange}
                              className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            />
                          </div>
                          
                          {/* Working Days */}
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Working Days</label>
                            <div className="flex flex-wrap gap-2">
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => handleDayToggle(day)}
                                  className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                                    config.days.includes(day)
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-slate-700/50 text-slate-400 border border-slate-600 hover:border-slate-500"
                                  }`}
                                >
                                  {day.substring(0, 3)}
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Periods Configuration */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Periods Per Day</label>
                              <select
                                name="periodsPerDay"
                                value={config.periodsPerDay}
                                onChange={handleInputChange}
                                className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {[4, 5, 6, 7, 8, 9].map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-slate-300 mb-1">Break After Period</label>
                              <select
                                name="breakAfter"
                                value={config.breakAfter}
                                onChange={handleInputChange}
                                className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                              >
                                {Array.from({ length: config.periodsPerDay - 1 }, (_, i) => i + 1).map(num => (
                                  <option key={num} value={num}>{num}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          
                          {/* Classes Selection */}
                          <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Classes</label>
                            <div className="max-h-40 overflow-y-auto space-y-2 pr-2">
                              {classesData.map(classItem => (
                                <div key={classItem.id} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`class-${classItem.id}`}
                                    checked={config.classes.includes(classItem.id)}
                                    onChange={() => handleClassToggle(classItem.id)}
                                    className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                  />
                                  <label htmlFor={`class-${classItem.id}`} className="ml-2 text-sm font-medium text-slate-300">
                                    {classItem.name}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Advanced Options */}
                          <div className="pt-2 border-t border-slate-700">
                            <h3 className="text-sm font-medium text-slate-300 mb-3">Advanced Options</h3>
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="allowConflictResolution"
                                  name="allowConflictResolution"
                                  checked={config.allowConflictResolution}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="allowConflictResolution" className="ml-2 text-sm text-slate-300">
                                  Allow automatic conflict resolution
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="prioritizeTeacherAvailability"
                                  name="prioritizeTeacherAvailability"
                                  checked={config.prioritizeTeacherAvailability}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="prioritizeTeacherAvailability" className="ml-2 text-sm text-slate-300">
                                  Prioritize teacher availability
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="minimizeRoomChanges"
                                  name="minimizeRoomChanges"
                                  checked={config.minimizeRoomChanges}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="minimizeRoomChanges" className="ml-2 text-sm text-slate-300">
                                  Minimize classroom changes
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="preferConsecutivePeriods"
                                  name="preferConsecutivePeriods"
                                  checked={config.preferConsecutivePeriods}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="preferConsecutivePeriods" className="ml-2 text-sm text-slate-300">
                                  Prefer consecutive periods for subjects
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="balanceSubjectDistribution"
                                  name="balanceSubjectDistribution"
                                  checked={config.balanceSubjectDistribution}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="balanceSubjectDistribution" className="ml-2 text-sm text-slate-300">
                                  Balance subject distribution across week
                                </label>
                              </div>
                              
                              <div className="flex items-center">
                                <input
                                  type="checkbox"
                                  id="avoidLastPeriodForHeavySubjects"
                                  name="avoidLastPeriodForHeavySubjects"
                                  checked={config.avoidLastPeriodForHeavySubjects}
                                  onChange={handleInputChange}
                                  className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                                />
                                <label htmlFor="avoidLastPeriodForHeavySubjects" className="ml-2 text-sm text-slate-300">
                                  Avoid last period for heavy subjects
                                </label>
                              </div>
                            </div>
                          </div>
                        </form>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Generate Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isGenerating}
                  onClick={generateTimetable}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mb-4 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={20} />
                      <span>Generate Timetable</span>
                    </>
                  )}
                </motion.button>
                
                {/* Informational Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                >
                  <h3 className="text-sm font-medium text-emerald-400 mb-2">How it works</h3>
                  <p className="text-sm text-slate-400 mb-3">
                    Our algorithm will generate a conflict-free timetable based on your configuration. 
                    It ensures no teacher, room, or class has scheduling conflicts.
                  </p>
                  <div className="text-xs text-slate-500">
                    💡 Tip: Select more working days and periods for more flexibility in scheduling.
                  </div>
                </motion.div>
              </div>
              
              {/* Result Display Area */}
              <div className="lg:col-span-2">
                {/* Show loading animation */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center min-h-96"
                  >
                    <div className="w-24 h-24 mb-6 relative">
                      <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                    <h3 className="text-xl font-medium mb-2">Generating Your Timetable</h3>
                    <p className="text-slate-400 text-center max-w-md mb-4">
                      Our algorithm is working to create an optimal schedule based on your constraints.
                    </p>
                    <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
                      <div className="flex items-center">
                        <span className="block w-2 h-2 rounded-full bg-amber-500 mr-1"></span>
                        <span>Checking conflicts</span>
                      </div>
                      <div className="flex items-center">
                        <span className="block w-2 h-2 rounded-full bg-emerald-500 mr-1"></span>
                        <span>Optimizing</span>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Show conflicts if any */}
                {!isGenerating && showConflicts && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-6"
                  >
                    <div className="bg-amber-900/20 border-b border-amber-800/30 p-4 flex items-start gap-3">
                      <div className="bg-amber-900/30 p-2 rounded-full">
                        <ShieldAlert size={22} className="text-amber-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-amber-400">Scheduling Conflicts Detected</h3>
                        <p className="text-slate-300 text-sm mt-1">
                          We found {conflictDetails.length} conflicts that need to be resolved before generating the timetable.
                        </p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="space-y-4 mb-5">
                        {conflictDetails.map((conflict, idx) => (
                          <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
                            <div className="flex items-center mb-2">
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                conflict.severity === "high" ? "bg-rose-500" : "bg-amber-500"
                              }`}></div>
                              <h4 className="font-medium">{conflict.description}</h4>
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              {conflict.entities.map((entity, i) => (
                                <span key={i} className="px-2 py-1 bg-slate-700 text-xs rounded">
                                  {entity}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-slate-400">
                              <span className="font-medium text-emerald-400">Suggestion:</span> {conflict.suggestion}
                            </p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                      <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resolveConflicts}
                          className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2"
                        >
                          <Check size={18} />
                          <span>Auto-Resolve Conflicts</span>
                        </motion.button>
                        
                        <button
                          className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                        >
                          <Sliders size={18} />
                          <span>Adjust Manually</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Show generation error if any */}
                {!isGenerating && generationError && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-4 flex items-start gap-3 mb-6"
                  >
                    <div className="bg-rose-500/20 p-2 rounded-full">
                      <X size={18} className="text-rose-500" />
                    </div>
                    <div>
                      <h3 className="font-medium text-rose-500">Generation Failed</h3>
                      <p className="text-slate-300 text-sm mt-1">{generationError}</p>
                    </div>
                  </motion.div>
                )}
                
                {/* Show timetable if generated */}
                {!isGenerating && timetable && (
                  <div>
                    {/* Action buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 flex items-center justify-between"
                    >
                      <div>
                        <h3 className="font-medium">{timetable.name}</h3>
                        <p className="text-sm text-slate-400">
                          Generated on {new Date(timetable.generatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-slate-700 hover:bg-slate-600 text-white py-2 px-3 rounded-lg flex items-center gap-2 text-sm transition-all duration-200"
                        >
                          <Save size={16} />
                          <span>Save</span>
                        </motion.button>
                        
                        <div className="relative">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isExporting}
                            onClick={() => exportTimetable('pdf')}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-3 rounded-lg flex items-center gap-2 text-sm transition-all duration-200 disabled:opacity-70"
                          >
                            {isExporting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Exporting...</span>
                              </>
                            ) : (
                              <>
                                <Download size={16} />
                                <span>Export</span>
                              </>
                            )}
                          </motion.button>
                          
                          {/* Success notification */}
                          <AnimatePresence>
                            {showSuccess && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute right-0 top-full mt-2 bg-emerald-500 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-10"
                              >
                                Successfully exported!
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </motion.div>
                    
                    {/* Timetable content tabs */}
                    <div className="mb-4">
                      <div className="flex overflow-x-auto space-x-2 pb-2">
                        {Object.keys(timetable.classes).map((classId) => (
                          <button
                            key={classId}
                            className="bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg text-sm flex-shrink-0 transition-all duration-200"
                          >
                            {timetable.classes[classId].className}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Display first class timetable */}
                    {Object.keys(timetable.classes).length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden"
                      >
                        <div className="border-b border-slate-700 p-4">
                          <h3 className="font-medium">{timetable.classes[Object.keys(timetable.classes)[0]].className} Schedule</h3>
                        </div>
                        
                        <div className="p-4 overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr>
                                <th className="text-left font-medium text-slate-400 p-2">Period</th>
                                {config.days.map(day => (
                                  <th key={day} className="text-left font-medium text-slate-400 p-2">{day}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from({ length: config.periodsPerDay }, (_, idx) => idx + 1).map(period => (
                                <tr key={period} className="border-t border-slate-700">
                                  <td className="p-2 text-slate-300 font-medium">
                                    {period}
                                  </td>
                                  
                                  {config.days.map(day => {
                                    const firstClassId = Object.keys(timetable.classes)[0];
                                    const slot = timetable.classes[firstClassId].schedule[day][period];
                                    
                                    return (
                                      <td key={day} className="p-2">
                                        {slot.type === 'break' ? (
                                          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 p-2 rounded">
                                            <div className="font-medium">Break</div>
                                          </div>
                                        ) : slot.type === 'free' ? (
                                          <div className="bg-slate-700/30 border border-slate-600 text-slate-400 p-2 rounded">
                                            <div className="font-medium">Free Period</div>
                                          </div>
                                        ) : (
                                          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded">
                                            <div className="font-medium text-emerald-400">{slot.courseCode}</div>
                                            <div className="text-sm text-slate-300">{slot.courseName}</div>
                                            <div className="mt-1 flex items-center justify-between">
                                              <span className="text-xs text-slate-400">{slot.teacherName}</span>
                                              <span className="text-xs bg-slate-700 py-0.5 px-2 rounded">{slot.roomName}</span>
                                            </div>
                                          </div>
                                        )}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
                
                {/* No content placeholder */}
                {!isGenerating && !timetable && !generationError && !showConflicts && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-slate-800 border border-dashed border-slate-700 rounded-lg p-8 flex flex-col items-center justify-center min-h-96"
                  >
                    <Calendar size={48} className="text-slate-600 mb-4" />
                    <h3 className="text-xl font-medium mb-2">No Timetable Generated Yet</h3>
                    <p className="text-slate-400 text-center max-w-md mb-6">
                      Configure your settings and click "Generate Timetable" to create a new schedule.
                    </p>
                    <button
                      onClick={generateTimetable}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200"
                    >
                      <RefreshCw size={18} />
                      <span>Generate Now</span>
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
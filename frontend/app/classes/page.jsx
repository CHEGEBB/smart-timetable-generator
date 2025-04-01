"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Calendar,
  Clock,
  Edit,
  Filter,
  Menu,
  MessageSquare,
  Plus,
  Search,
  Trash,
  Users,
  X,
  Info,
  BookOpen,
  Clock3,
  UserCheck,
  Clipboard,
  Check,
  Building,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getClasses, createClass, updateClass, deleteClass } from "@/services/classService";
import "../../sass/fonts.scss";


// Common available subjects
const availableSubjects = [
  "Mathematics", "Advanced Mathematics", "Calculus",
  "Physics", "Chemistry", "Biology",
  "Computer Science", "English", "English Literature", "Literature",
  "History", "Geography", "Economics", "Psychology"
];

// Teacher data for dropdown
const teachersData = [
  { id: 1, name: "Mr. Johnson", subjects: ["Mathematics", "Physics"] },
  { id: 2, name: "Ms. Thompson", subjects: ["Biology", "Chemistry"] },
  { id: 3, name: "Dr. Martinez", subjects: ["Computer Science", "Advanced Mathematics"] },
  { id: 4, name: "Mrs. Wilson", subjects: ["English Literature", "Psychology"] },
  { id: 5, name: "Mr. Peterson", subjects: ["History", "Calculus"] },
  { id: 6, name: "Ms. Rodriguez", subjects: ["Economics", "Biology"] },
];

// Room data for dropdown
const roomsData = [
  { id: 1, name: "Smart Classroom 101", capacity: 35 },
  { id: 2, name: "Collaborative Space 102", capacity: 25 },
  { id: 3, name: "Science Lab 201", capacity: 30 },
  { id: 4, name: "Lecture Hall A", capacity: 120 },
  { id: 5, name: "Conference Room 305", capacity: 40 },
  { id: 6, name: "Computer Lab", capacity: 25 },
];

export default function Classes() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("classes");
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClassDetails, setShowClassDetails] = useState(null);
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [activeView, setActiveView] = useState("grid"); // grid or list
  const [selectedDay, setSelectedDay] = useState("monday");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editClassId, setEditClassId] = useState(null);

  const [newClass, setNewClass] = useState({
    name: "",
    students: "",
    subjects: [],
    classTeacher: "",
    roomAssigned: "",
    schedule: {
      monday: Array(5).fill(""),
      tuesday: Array(5).fill(""),
      wednesday: Array(5).fill(""),
      thursday: Array(5).fill(""),
      friday: Array(5).fill("")
    },
    image: "/assets/class1.jpeg"
  });

  // Fetch classes from API on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        const response = await getClasses();
        setClasses(response.data);
        setFilteredClasses(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.error || "Failed to fetch classes");
        setIsLoading(false);
        toast.error(err.error || "Failed to fetch classes");
      }
    };

    fetchClasses();
  }, []);

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

  // Filter classes based on search term
  useEffect(() => {
    let filtered = classes;

    if (searchTerm) {
      filtered = filtered.filter(cls =>
        cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.classTeacher.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setNewClass({
        name: "",
        students: "",
        subjects: [],
        classTeacher: "",
        roomAssigned: "",
        schedule: {
          monday: Array(5).fill(""),
          tuesday: Array(5).fill(""),
          wednesday: Array(5).fill(""),
          thursday: Array(5).fill(""),
          friday: Array(5).fill("")
        },
        image: "/assets/class1.jpeg"
      });
    }
  };

  const toggleEditModal = (classId = null) => {
    if (classId) {
      const classToEdit = classes.find(c => c._id === classId);
      if (classToEdit) {
        // Make a deep copy of the class object to prevent unexpected mutations
        setNewClass({
          ...classToEdit,
          // Ensure the schedule has the expected structure
          schedule: {
            monday: classToEdit.schedule?.monday || Array(5).fill(""),
            tuesday: classToEdit.schedule?.tuesday || Array(5).fill(""),
            wednesday: classToEdit.schedule?.wednesday || Array(5).fill(""),
            thursday: classToEdit.schedule?.thursday || Array(5).fill(""),
            friday: classToEdit.schedule?.friday || Array(5).fill("")
          }
        });
        setEditClassId(classId);
        setIsEditModalOpen(true);
      }
    } else {
      setIsEditModalOpen(false);
      setEditClassId(null);
    }
  };

  const toggleClassDetails = (classId) => {
    if (showClassDetails === classId) {
      setShowClassDetails(null);
    } else {
      setShowClassDetails(classId);
    }
  };

  const handleSubjectToggle = (subject) => {
    setNewClass(prev => {
      // Check if subject is already selected
      if (prev.subjects.includes(subject)) {
        // Remove subject
        return {
          ...prev,
          subjects: prev.subjects.filter(s => s !== subject)
        };
      } else {
        // Add subject
        return {
          ...prev,
          subjects: [...prev.subjects, subject]
        };
      }
    });
  };

  const handleScheduleChange = (day, periodIndex, subject) => {
    setNewClass(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: prev.schedule[day].map((s, i) => i === periodIndex ? subject : s)
      }
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClass(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddClass = async (e) => {
    e.preventDefault();

    try {
      // Create class data object from form
      const classData = {
        ...newClass,
        students: parseInt(newClass.students),
        lastUpdated: new Date().toISOString()
      };

      // Submit to API
      const response = await createClass(classData);

      // Add new class to state
      setClasses(prev => [...prev, response.data]);

      // Show success message
      toast.success("Class created successfully!");

      // Close modal and reset form
      toggleModal();
    } catch (err) {
      toast.error(err.error || "Failed to create class");
    }
  };

  const handleUpdateClass = async (e) => {
    e.preventDefault();

    try {
      // Update data object
      const classData = {
        ...newClass,
        students: parseInt(newClass.students),
        lastUpdated: new Date().toISOString()
      };

      // Submit to API
      const response = await updateClass(editClassId, classData);

      // Update existing class in state
      setClasses(classes.map(cls => 
        cls._id === editClassId ? response.data : cls
      ));

      // Show success message
      toast.success("Class updated successfully!");

      // Close modal
      toggleEditModal();
    } catch (err) {
      toast.error(err.error || "Failed to update class");
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      // Confirm before delete
      if (window.confirm("Are you sure you want to delete this class?")) {
        await deleteClass(id);
        setClasses(classes.filter(cls => cls._id !== id));
        toast.success("Class deleted successfully!");
      }
    } catch (err) {
      toast.error(err.error || "Failed to delete class");
    }
  };

  // Function to generate a random image for the class
  const randomizeClassImage = () => {
    const imageNumber = Math.floor(Math.random() * 6) + 1;
    setNewClass(prev => ({
      ...prev,
      image: `/assets/class${imageNumber}.jpeg`
    }));
  };

  // Helper function to get class schedule for the selected day
  const getScheduleForDay = (classObj, day) => {
    return classObj.schedule?.[day] || Array(5).fill("");
  };

  // Days of the week for tabs
  const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

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
                  placeholder="Search classes..."
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
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-pink-500 to-violet-500 flex items-center justify-center text-white font-medium">
                JS
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Classes Management</h1>
                <p className="text-slate-400">Create and manage classes with subject assignments and schedules.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                {/* View Toggle */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setActiveView("grid")}
                    className={`p-2 text-sm ${activeView === "grid" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7"/>
                      <rect x="14" y="3" width="7" height="7"/>
                      <rect x="3" y="14" width="7" height="7"/>
                      <rect x="14" y="14" width="7" height="7"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setActiveView("list")}
                    className={`p-2 text-sm ${activeView === "list" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="8" y1="6" x2="21" y2="6"/>
                      <line x1="8" y1="12" x2="21" y2="12"/>
                      <line x1="8" y1="18" x2="21" y2="18"/>
                      <line x1="3" y1="6" x2="3.01" y2="6"/>
                      <line x1="3" y1="12" x2="3.01" y2="12"/>
                      <line x1="3" y1="18" x2="3.01" y2="18"/>
                    </svg>
                  </button>
                </div>

                {/* Day Filter for Schedule View */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  {daysOfWeek.map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`px-3 py-2 text-xs uppercase ${selectedDay === day ? "bg-slate-700 text-white" : "text-slate-400"}`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Add Class Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add Class</span>
                </motion.button>
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
              <div className="bg-rose-900/30 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg flex items-center">
                <AlertCircle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            )}

            {/* Classes Display - Grid View */}
            {activeView === "grid" && !isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredClasses.map((classObj, index) => (
                  <motion.div
                    key={classObj._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
                  >
                    {/* Class Image */}
                    <div className="relative h-40 overflow-hidden">
                      <Image
                        src={classObj.image}
                        alt={classObj.name}
                        fill
                        style={{objectFit: "cover"}}
                        className="transition-transform duration-300 hover:scale-105"
                      />

                      {/* Class Teacher Badge */}
                      <div className="absolute top-3 left-3 bg-indigo-900/80 text-indigo-300 border border-indigo-600/50 px-2 py-1 rounded text-xs font-medium flex items-center">
                        <UserCheck size={12} className="mr-1" />
                        <span>{classObj.classTeacher}</span>
                      </div>

                      {/* Students Count Badge */}
                      <div className="absolute bottom-3 left-3 bg-violet-900/80 text-violet-300 border border-violet-600/50 px-2 py-1 rounded text-xs font-medium flex items-center">
                        <Users size={12} className="mr-1" />
                        <span>{classObj.students} Students</span>
                      </div>
                    </div>

                    {/* Class Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg mb-1 line-clamp-1">{classObj.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => toggleEditModal(classObj._id)}
                            title="Edit Class"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => toggleClassDetails(classObj._id)}
                            title="View Schedule"
                          >
                            <Info size={14} />
                          </button>
                          <button
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => handleDeleteClass(classObj._id)}
                            title="Delete Class"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="text-slate-400 text-sm mb-3">
                        <div className="flex items-center">
                          <Building size={14} className="mr-1" />
                          <span>{classObj.roomAssigned}</span>
                        </div>
                      </div>

                      {/* Subjects */}
                      <div className="mb-3">
                        <div className="text-xs uppercase font-semibold text-slate-500 mb-2">Subjects</div>
                        <div className="flex flex-wrap gap-2">
                          {classObj.subjects.slice(0, 4).map((subject, i) => (
                            <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded-full flex items-center">
                              <BookOpen size={10} className="mr-1" />
                              {subject}
                            </span>
                          ))}
                          {classObj.subjects.length > 4 && (
                            <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                              +{classObj.subjects.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Last Updated */}
                      <div className="text-xs text-slate-500">
                        <span>Last updated: {classObj.lastUpdated ? new Date(classObj.lastUpdated).toLocaleString() : "Just now"}</span>
                      </div>

                      {/* Conditional Schedule Display */}
                      <AnimatePresence>
                        {showClassDetails === classObj._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-700 pt-3 mt-3"
                          >
                            <div className="mb-2 flex justify-between items-center">
                              <div className="text-xs uppercase font-semibold text-slate-500">
                                {selectedDay.charAt(0).toUpperCase() + selectedDay.slice(1)} Schedule
                              </div>
                              <div className="flex space-x-1">
                                {daysOfWeek.map((day) => (
                                  <button
                                    key={day}
                                    onClick={() => setSelectedDay(day)}
                                    className={`w-6 h-6 flex items-center justify-center text-xs rounded-full ${
                                      selectedDay === day
                                        ? 'bg-emerald-500/20 text-emerald-400'
                                        : 'text-slate-500 hover:bg-slate-700'
                                    }`}
                                  >
                                    {day.charAt(0).toUpperCase()}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="bg-slate-700/30 rounded-lg p-2">
                              {getScheduleForDay(classObj, selectedDay).map((subject, i) => (
                                <div key={i} className="flex items-center justify-between py-1 border-b border-slate-700/50 last:border-0">
                                  <div className="flex items-center">
                                    <span className="w-6 h-6 flex items-center justify-center bg-slate-700 rounded-full text-xs mr-2">
                                      {i+1}
                                    </span>
                                    <span className="text-sm">{subject || "Free Period"}</span>
                                  </div>
                                  <div className="text-xs text-slate-400">
                                    {8 + i}:00 - {9 + i}:00
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Classes Display - List View */}
            {activeView === "list" && !isLoading && !error && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700/50">
                        <th className="text-left p-4 font-medium text-sm">Class</th>
                        <th className="text-left p-4 font-medium text-sm">Teacher</th>
                        <th className="text-left p-4 font-medium text-sm">Students</th>
                        <th className="text-left p-4 font-medium text-sm">Room</th>
                        <th className="text-left p-4 font-medium text-sm">Subjects</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClasses.map((classObj, index) => (
                        <motion.tr
                          key={classObj._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className={`border-b border-slate-700 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3 relative flex-shrink-0">
                                <Image
                                  src={classObj.image}
                                  alt={classObj.name}
                                  fill
                                  style={{objectFit: "cover"}}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{classObj.name}</div>
                                <div className="text-xs text-slate-400">
                                  Updated: {classObj.lastUpdated ? new Date(classObj.lastUpdated).toLocaleString() : "Just now"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-indigo-900/30 text-indigo-400 border border-indigo-800/50">
                              <UserCheck size={12} className="mr-1" />
                              {classObj.classTeacher}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-slate-300">
                              <Users size={14} className="mr-2 text-slate-400" />
                              {classObj.students}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-slate-300">
                              <Building size={14} className="mr-2 text-slate-400" />
                              {classObj.roomAssigned}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {classObj.subjects.slice(0, 3).map((subject, i) => (
                                <span key={i} className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                                  {subject}
                                </span>
                              ))}
                              {classObj.subjects.length > 3 && (
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                                  +{classObj.subjects.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => toggleEditModal(classObj._id)}
                                title="Edit Class"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => toggleClassDetails(classObj._id)}
                                title="View Schedule"
                              >
                                <Info size={16} />
                              </button>
                              <button
                                className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => handleDeleteClass(classObj._id)}
                                title="Delete Class"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!isLoading && !error && filteredClasses.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Book size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No classes found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or create a new class</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Class</span>
                </motion.button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />

      {/* Add Class Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={toggleModal}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">Add New Class</h2>
                  <button
                    onClick={toggleModal}
                    className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddClass}>
                  <div className="space-y-4">
                    {/* Class Image Preview */}
                    <div className="relative rounded-lg overflow-hidden h-32 bg-slate-700">
                      <Image
                        src={newClass.image}
                        alt="Class Preview"
                        fill
                        style={{objectFit: "cover"}}
                      />
                      <button
                        type="button"
                        onClick={randomizeClassImage}
                        className="absolute bottom-2 right-2 bg-slate-800/70 text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 2v6h6"></path>
                          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                          <path d="M21 22v-6h-6"></path>
                          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Name */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Book size={16} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={newClass.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Class Name"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Students Count */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Users size={16} />
                        </div>
                        <input
                          type="number"
                          name="students"
                          value={newClass.students}
                          onChange={handleInputChange}
                          required
                          placeholder="Number of Students"
                          min="1"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Teacher */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <UserCheck size={16} />
                        </div>
                        <select
                          name="classTeacher"
                          value={newClass.classTeacher}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        >
                          <option value="">Select Class Teacher</option>
                          {teachersData.map(teacher => (
                            <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Room Assigned */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Building size={16} />
                        </div>
                        <select
                          name="roomAssigned"
                          value={newClass.roomAssigned}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        >
                          <option value="">Select Room</option>
                          {roomsData.map(room => (
                            <option key={room.id} value={room.name}>{room.name} (Capacity: {room.capacity})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Subjects</label>
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600 max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {availableSubjects.map(subject => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => handleSubjectToggle(subject)}
                              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                newClass.subjects.includes(subject)
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                              }`}
                            >
                              {newClass.subjects.includes(subject) && (
                                <Check size={10} className="inline mr-1" />
                              )}
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Creation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Class Schedule</label>

                      {/* Day Tabs */}
                      <div className="flex border-b border-slate-700 mb-3">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 text-sm capitalize ${
                              selectedDay === day
                                ? 'text-emerald-400 border-b-2 border-emerald-500 -mb-px'
                                : 'text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      {/* Period Selection for Each Day */}
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                        {[0, 1, 2, 3, 4].map((periodIndex) => (
                          <div key={periodIndex} className="flex items-center mb-2 last:mb-0">
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-sm mr-3">
                              {periodIndex + 1}
                            </span>
                            <div className="text-xs text-slate-400 w-24">
                              {8 + periodIndex}:00 - {9 + periodIndex}:00
                            </div>
                            <select
                              value={newClass.schedule[selectedDay][periodIndex]}
                              onChange={(e) => handleScheduleChange(selectedDay, periodIndex, e.target.value)}
                              className="flex-1 ml-2 bg-slate-700 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">Select Subject</option>
                              {newClass.subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-6"
                    >
                      <Plus size={16} />
                      <span>Add Class</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Class Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            {/* Modal Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40"
              onClick={() => toggleEditModal()}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", damping: 20 }}
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">Edit Class</h2>
                  <button
                    onClick={() => toggleEditModal()}
                    className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleUpdateClass}>
                  <div className="space-y-4">
                    {/* Class Image Preview */}
                    <div className="relative rounded-lg overflow-hidden h-32 bg-slate-700">
                      <Image
                        src={newClass.image}
                        alt="Class Preview"
                        fill
                        style={{objectFit: "cover"}}
                      />
                      <button
                        type="button"
                        onClick={randomizeClassImage}
                        className="absolute bottom-2 right-2 bg-slate-800/70 text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 2v6h6"></path>
                          <path d="M21 12A9 9 0 0 0 6 5.3L3 8"></path>
                          <path d="M21 22v-6h-6"></path>
                          <path d="M3 12a9 9 0 0 0 15 6.7l3-2.7"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Name */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Book size={16} />
                        </div>
                        <input
                          type="text"
                          name="name"
                          value={newClass.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Class Name"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Students Count */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Users size={16} />
                        </div>
                        <input
                          type="number"
                          name="students"
                          value={newClass.students}
                          onChange={handleInputChange}
                          required
                          placeholder="Number of Students"
                          min="1"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Class Teacher */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <UserCheck size={16} />
                        </div>
                        <select
                          name="classTeacher"
                          value={newClass.classTeacher}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        >
                          <option value="">Select Class Teacher</option>
                          {teachersData.map(teacher => (
                            <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Room Assigned */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Building size={16} />
                        </div>
                        <select
                          name="roomAssigned"
                          value={newClass.roomAssigned}
                          onChange={handleInputChange}
                          required
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        >
                          <option value="">Select Room</option>
                          {roomsData.map(room => (
                            <option key={room.id} value={room.name}>{room.name} (Capacity: {room.capacity})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Select Subjects</label>
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600 max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {availableSubjects.map(subject => (
                            <button
                              key={subject}
                              type="button"
                              onClick={() => handleSubjectToggle(subject)}
                              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                newClass.subjects.includes(subject)
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                  : 'bg-slate-700 text-slate-300 border border-slate-600 hover:bg-slate-600'
                              }`}
                            >
                              {newClass.subjects.includes(subject) && (
                                <Check size={10} className="inline mr-1" />
                              )}
                              {subject}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Schedule Creation */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Class Schedule</label>

                      {/* Day Tabs */}
                      <div className="flex border-b border-slate-700 mb-3">
                        {daysOfWeek.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 text-sm capitalize ${
                              selectedDay === day
                                ? 'text-emerald-400 border-b-2 border-emerald-500 -mb-px'
                                : 'text-slate-400 hover:text-slate-300'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>

                      {/* Period Selection for Each Day */}
                      <div className="bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                        {[0, 1, 2, 3, 4].map((periodIndex) => (
                          <div key={periodIndex} className="flex items-center mb-2 last:mb-0">
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-full text-sm mr-3">
                              {periodIndex + 1}
                            </span>
                            <div className="text-xs text-slate-400 w-24">
                              {8 + periodIndex}:00 - {9 + periodIndex}:00
                            </div>
                            <select
                              value={newClass.schedule[selectedDay][periodIndex]}
                              onChange={(e) => handleScheduleChange(selectedDay, periodIndex, e.target.value)}
                              className="flex-1 ml-2 bg-slate-700 border border-slate-600 text-sm rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="">Select Subject</option>
                              {newClass.subjects.map(subject => (
                                <option key={subject} value={subject}>{subject}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-6"
                    >
                      <Check size={16} />
                      <span>Update Class</span>
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
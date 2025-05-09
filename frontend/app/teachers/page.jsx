"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Book, 
  Calendar, 
  Clock, 
  Download, 
  Edit, 
  Filter, 
  Menu, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash, 
  UserPlus,
  Users,
  Briefcase,
  CheckSquare,
  X,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import "../../sass/fonts.scss";
import { getTeachers, createTeacher, deleteTeacher, updateTeacher } from "@/services/teacherService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Department colors for visual distinction
const departmentColors = {
  "Computer Science": "emerald",
  "Mathematics": "blue",
  "Physics": "amber",
  "English": "purple",
  "Chemistry": "rose",
  "Biology": "teal",
};

// Days of the week
const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday"];

export default function Teachers() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("teachers");
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [newTeacher, setNewTeacher] = useState({
    name: "",
    subjects: [],
    availability: {
      monday: [true, true, true, true, true],
      tuesday: [true, true, true, true, true],
      wednesday: [true, true, true, true, true],
      thursday: [true, true, true, true, true],
      friday: [true, true, true, true, true]
    },
    contact: "",
    department: ""
  });
  const [tempSubject, setTempSubject] = useState("");
  const [activeScheduleDay, setActiveScheduleDay] = useState("monday");
  const [showAvailability, setShowAvailability] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTeacherId, setEditTeacherId] = useState(null);
  
  // Fetch teachers on component mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true);
        const response = await getTeachers();
        setTeachers(response.data);
        setFilteredTeachers(response.data);
        setIsLoading(false);
      } catch (err) {
        setError(err.error || "Failed to fetch teachers");
        setIsLoading(false);
        toast.error(err.error || "Failed to fetch teachers");
      }
    };
    
    fetchTeachers();
  }, []);
  
  // Get unique departments for filter
  const departments = ["All", ...new Set(teachers.map(teacher => teacher.department))];

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

  // Initialize showAvailability state for all teachers
  useEffect(() => {
    const initialShowAvailability = {};
    teachers.forEach(teacher => {
      initialShowAvailability[teacher._id || teacher.id] = false;
    });
    setShowAvailability(initialShowAvailability);
  }, [teachers]);

  // Filter teachers based on search term and selected department
  useEffect(() => {
    let filtered = teachers;
    
    if (searchTerm) {
      filtered = filtered.filter(teacher => 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (selectedDepartment !== "All") {
      filtered = filtered.filter(teacher => teacher.department === selectedDepartment);
    }
    
    setFilteredTeachers(filtered);
  }, [searchTerm, teachers, selectedDepartment]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleModal = (teacherToEdit = null) => {
    if (isModalOpen) {
      // Closing modal - reset state
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditTeacherId(null);
      setNewTeacher({
        name: "",
        subjects: [],
        availability: {
          monday: [true, true, true, true, true],
          tuesday: [true, true, true, true, true],
          wednesday: [true, true, true, true, true],
          thursday: [true, true, true, true, true],
          friday: [true, true, true, true, true]
        },
        contact: "",
        department: ""
      });
      setTempSubject("");
      setActiveScheduleDay("monday");
    } else {
      // Opening modal
      setIsModalOpen(true);
      
      if (teacherToEdit) {
        // Edit mode
        setIsEditMode(true);
        setEditTeacherId(teacherToEdit._id || teacherToEdit.id);
        setNewTeacher({
          name: teacherToEdit.name || "",
          subjects: teacherToEdit.subjects || [],
          availability: teacherToEdit.availability || {
            monday: [true, true, true, true, true],
            tuesday: [true, true, true, true, true],
            wednesday: [true, true, true, true, true],
            thursday: [true, true, true, true, true],
            friday: [true, true, true, true, true]
          },
          contact: teacherToEdit.contact || "",
          department: teacherToEdit.department || ""
        });
      } else {
        // Create mode
        setIsEditMode(false);
        setNewTeacher({
          name: "",
          subjects: [],
          availability: {
            monday: [true, true, true, true, true],
            tuesday: [true, true, true, true, true],
            wednesday: [true, true, true, true, true],
            thursday: [true, true, true, true, true],
            friday: [true, true, true, true, true]
          },
          contact: "",
          department: ""
        });
      }
    }
  };

  const toggleTeacherAvailability = (teacherId) => {
    setShowAvailability(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeacher(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSubject = () => {
    if (tempSubject.trim() && !newTeacher.subjects.includes(tempSubject.trim())) {
      setNewTeacher(prev => ({
        ...prev,
        subjects: [...prev.subjects, tempSubject.trim()]
      }));
      setTempSubject("");
    }
  };

  const handleRemoveSubject = (subjectToRemove) => {
    setNewTeacher(prev => ({
      ...prev,
      subjects: prev.subjects.filter(subject => subject !== subjectToRemove)
    }));
  };

  const handleAvailabilityChange = (day, periodIndex) => {
    setNewTeacher(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: prev.availability[day].map((period, index) => 
          index === periodIndex ? !period : period
        )
      }
    }));
  };

  const handleSubmitTeacher = async (e) => {
    e.preventDefault();
    
    try {
      if (isEditMode) {
        // Update existing teacher
        const response = await updateTeacher(editTeacherId, newTeacher);
        
        // Update teachers list with the edited teacher
        setTeachers(prevTeachers => 
          prevTeachers.map(teacher => 
            (teacher._id || teacher.id) === editTeacherId ? response.data : teacher
          )
        );
        
        toast.success("Teacher updated successfully!");
      } else {
        // Create new teacher
        const response = await createTeacher(newTeacher);
        
        // Add new teacher to teachers list
        setTeachers(prev => [...prev, response.data]);
        
        toast.success("Teacher created successfully!");
      }
      
      // Close modal and reset form
      toggleModal();
    } catch (err) {
      toast.error(err.error || `Failed to ${isEditMode ? 'update' : 'create'} teacher`);
    }
  };

  const handleDeleteTeacher = async (id) => {
    try {
      // Confirm before delete
      if (window.confirm("Are you sure you want to delete this teacher?")) {
        await deleteTeacher(id);
        setTeachers(teachers.filter(teacher => (teacher._id || teacher.id) !== id));
        toast.success("Teacher deleted successfully!");
      }
    } catch (err) {
      toast.error(err.error || "Failed to delete teacher");
    }
  };

  const handleEditTeacher = (teacher) => {
    toggleModal(teacher);
  };

  // Helper function to calculate availability percentage
  const calculateAvailability = (availability) => {
    let total = 0;
    let available = 0;
    
    Object.values(availability).forEach(day => {
      day.forEach(period => {
        total++;
        if (period) available++;
      });
    });
    
    return Math.round((available / total) * 100);
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
                  placeholder="Search teachers..." 
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold">Teachers</h1>
                <p className="text-slate-400">Manage your teachers, their subjects, and availability schedules.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleModal()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Teacher</span>
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

            {/* Teachers Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredTeachers.map((teacher, index) => (
                  <motion.div
                    key={teacher._id || teacher.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className={`px-2 py-1 rounded text-xs font-medium bg-${departmentColors[teacher.department] || 'slate'}-900/30 text-${departmentColors[teacher.department] || 'slate'}-400 border border-${departmentColors[teacher.department] || 'slate'}-800/50`}>
                        {teacher.department}
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                          onClick={() => handleEditTeacher(teacher)}
                        >
                          <Edit size={14} />
                        </button>
                        <button 
                          className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                          onClick={() => handleDeleteTeacher(teacher._id || teacher.id)}
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                        <span className="text-sm">{teacher.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-lg">{teacher.name}</h3>
                        <p className="text-slate-400 text-sm">{teacher.contact}</p>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center text-slate-400 text-sm mb-1">
                        <Book size={14} className="mr-1" />
                        <span>Subjects</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((subject, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs px-2 py-1 bg-slate-700 rounded-full text-slate-300"
                            >
                              {subject}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500">No subjects assigned</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-slate-400 text-sm mb-1">
                        <div className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          <span>Availability</span>
                        </div>
                        <button 
                          onClick={() => toggleTeacherAvailability(teacher._id || teacher.id)}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          {showAvailability[teacher._id || teacher.id] ? "Hide" : "Show"}
                        </button>
                      </div>
                      
                      {!showAvailability[teacher._id || teacher.id] && (
                        <div className="flex items-center justify-between">
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div 
                              className="bg-emerald-500 h-2.5 rounded-full" 
                              style={{ width: `${calculateAvailability(teacher.availability)}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-slate-400">{calculateAvailability(teacher.availability)}%</span>
                        </div>
                      )}
                      
                      {showAvailability[teacher._id || teacher.id] && (
                        <div className="mt-2 border border-slate-700 rounded-lg p-2 bg-slate-800/50">
                          <div className="grid grid-cols-5 gap-1 text-xs text-center mb-1">
                            {daysOfWeek.map(day => (
                              <div key={day} className="capitalize text-slate-400">{day.substring(0, 3)}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-5 gap-1">
                            {daysOfWeek.map(day => (
                              <div key={day} className="flex flex-col gap-1">
                                {teacher.availability && teacher.availability[day] ? (
                                  teacher.availability[day].map((available, periodIdx) => (
                                    <div 
                                      key={periodIdx}
                                      className={`w-full h-3 rounded ${available ? "bg-emerald-500" : "bg-slate-700"}`}
                                    ></div>
                                  ))
                                ) : (
                                  <div className="text-xs text-slate-500 text-center">N/A</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {!isLoading && !error && filteredTeachers.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No teachers found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleModal()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Teacher</span>
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

      {/* Add/Edit Teacher Modal */}
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
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xl font-bold">{isEditMode ? 'Edit Teacher' : 'Add New Teacher'}</h2>
                  <button
                    onClick={toggleModal}
                    className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmitTeacher}>
                  <div className="space-y-4">
                    {/* Teacher Name */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Users size={16} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={newTeacher.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Teacher Name"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Department */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Briefcase size={16} />
                      </div>
                      <input
                        type="text"
                        name="department"
                        value={newTeacher.department}
                        onChange={handleInputChange}
                        required
                        placeholder="Department"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Contact */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <MessageSquare size={16} />
                      </div>
                      <input
                        type="email"
                        name="contact"
                        value={newTeacher.contact}
                        onChange={handleInputChange}
                        required
                        placeholder="Email Contact"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Subjects */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Subjects</label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {newTeacher.subjects.length > 0 ? (
                          newTeacher.subjects.map((subject, idx) => (
                            <div
                              key={idx}
                              className="flex items-center bg-slate-700 rounded-full px-2 py-1 text-xs"
                            >
                              <span>{subject}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveSubject(subject)}
                                className="ml-1 text-slate-400 hover:text-rose-400"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <span className="text-sm text-slate-500">No subjects added yet</span>
                        )}
                      </div>
                      <div className="flex">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                            <Book size={16} />
                          </div>
                          <input
                            type="text"
                            value={tempSubject}
                            onChange={(e) => setTempSubject(e.target.value)}
                            placeholder="Add a subject"
                            className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-l-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleAddSubject}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-r-lg px-3 transition-colors"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Availability Schedule */}
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Availability Schedule</label>
                      <div className="bg-slate-700/50 border border-slate-600 rounded-lg overflow-hidden">
                        <div className="flex border-b border-slate-600">
                          {daysOfWeek.map(day => (
                            <button
                              key={day}
                              type="button"
                              onClick={() => setActiveScheduleDay(day)}
                              className={`flex-1 text-xs py-2 px-1 capitalize transition ${activeScheduleDay === day ? 'bg-emerald-500 text-white' : 'hover:bg-slate-700 text-slate-300'}`}
                            >
                              {day.substring(0, 3)}
                            </button>
                          ))}
                        </div>

                        <div className="p-3">
                          <h4 className="text-sm mb-2 capitalize">{activeScheduleDay}</h4>
                          <div className="grid grid-cols-5 gap-2">
                            {newTeacher.availability && newTeacher.availability[activeScheduleDay] && 
                              newTeacher.availability[activeScheduleDay].map((available, periodIdx) => (
                                <div key={periodIdx} className="text-center">
                                  <p className="text-xs text-slate-400 mb-1">Period {periodIdx + 1}</p>
                                  <button
                                    type="button"
                                    onClick={() => handleAvailabilityChange(activeScheduleDay, periodIdx)}
                                    className={`w-full h-8 rounded transition ${available ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 hover:bg-slate-600'}`}
                                  >
                                    {available ? (
                                      <CheckSquare size={16} className="mx-auto text-white" />
                                    ) : (
                                      <X size={16} className="mx-auto text-slate-400" />
                                    )}
                                  </button>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 mt-6"
                    >
                      {isEditMode ? <Edit size={16} /> : <Plus size={16} />}
                      <span>{isEditMode ? 'Update Teacher' : 'Add Teacher'}</span>
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
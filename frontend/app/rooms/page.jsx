"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building,
  Calendar, 
  Clock, 
  Edit, 
  Filter, 
  Home,
  Menu, 
  MessageSquare, 
  Plus, 
  Search, 
  Trash, 
  Users,
  X,
  Info,
  Coffee,
  Wifi,
  Award,
  Check,
  Laptop,
  AlertCircle
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import Image from "next/image";
import { getRooms, createRoom, deleteRoom, toggleRoomAvailability } from "@/services/roomService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Custom Projector icon since it's not in lucide-react
const ProjectorIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={props.size || 24}
    height={props.size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <path d="M12 16v4" />
    <path d="M8 8v-2a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M17 12h.01" />
  </svg>
);

// Building colors for visual distinction
const buildingColors = {
  "Main Building": "blue",
  "Science Wing": "emerald",
  "Arts Building": "purple",
  "Technology Center": "amber",
  "Library": "indigo"
};

export default function Rooms() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("rooms");
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [activeView, setActiveView] = useState("grid"); // grid or list
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // all, available, unavailable
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: "",
    capacity: "",
    building: "",
    floor: "",
    available: true,
    hasProjector: false,
    hasComputers: false,
    hasWifi: true,
    hasCoffee: false,
    isCertified: false,
    image: "/assets/class1.jpeg"
  });
  import "../../sass/fonts.scss";

  
  // Fetch rooms from API
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const response = await getRooms();
        if (response.success) {
          setRooms(response.data);
          setFilteredRooms(response.data);
        } else {
          setError(response.error);
          toast.error(response.error);
        }
        setIsLoading(false);
      } catch (err) {
        setError("Failed to fetch rooms");
        toast.error("Failed to fetch rooms");
        setIsLoading(false);
      }
    };
    
    fetchRooms();
  }, []);
  
  // Get unique buildings for filter
  const buildings = ["All", ...new Set(rooms.map(room => room.building))];

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

  // Filter rooms based on search term, selected building, and availability
  useEffect(() => {
    let filtered = rooms;
    
    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.building.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedBuilding !== "All") {
      filtered = filtered.filter(room => room.building === selectedBuilding);
    }
    
    if (availabilityFilter !== "all") {
      const isAvailable = availabilityFilter === "available";
      filtered = filtered.filter(room => room.available === isAvailable);
    }
    
    setFilteredRooms(filtered);
  }, [searchTerm, rooms, selectedBuilding, availabilityFilter]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    if (!isModalOpen) {
      setNewRoom({
        name: "",
        capacity: "",
        building: "",
        floor: "",
        available: true,
        hasProjector: false,
        hasComputers: false,
        hasWifi: true,
        hasCoffee: false,
        isCertified: false,
        image: "/assets/class1.jpg"
      });
    }
  };

  const toggleRoomDetails = (roomId) => {
    if (showRoomDetails === roomId) {
      setShowRoomDetails(null);
    } else {
      setShowRoomDetails(roomId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewRoom(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    
    try {
      // Create room data object from form
      const roomData = {
        ...newRoom,
        capacity: parseInt(newRoom.capacity),
        floor: parseInt(newRoom.floor)
      };
      
      // Submit to API
      const response = await createRoom(roomData);
      
      if (response.success) {
        // Add new room to state
        setRooms(prev => [...prev, response.data]);
        
        // Show success message
        toast.success("Room created successfully!");
        
        // Close modal and reset form
        toggleModal();
      } else {
        toast.error(response.error);
      }
    } catch (err) {
      toast.error("Failed to create room");
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      // Confirm before delete
      if (window.confirm("Are you sure you want to delete this room?")) {
        const response = await deleteRoom(id);
        
        if (response.success) {
          setRooms(rooms.filter(room => room._id !== id));
          toast.success("Room deleted successfully!");
        } else {
          toast.error(response.error);
        }
      }
    } catch (err) {
      toast.error("Failed to delete room");
    }
  };

  const handleToggleRoomAvailability = async (id) => {
    try {
      const response = await toggleRoomAvailability(id);
      
      if (response.success) {
        setRooms(rooms.map(room => 
          room._id === id ? response.data : room
        ));
        toast.success(`Room is now ${response.data.available ? 'available' : 'unavailable'}`);
      } else {
        toast.error(response.error);
      }
    } catch (err) {
      toast.error("Failed to update room availability");
    }
  };

  // Function to generate a random image for the gallery selection
  const randomizeRoomImage = () => {
    const images = [
      "/assets/class1.jpg",
      "/assets/colab.jpeg",
      "/assets/lab.jpg",
      "/assets/lec.jpg",
      "/assets/hall.jpeg",
      "/assets/computer.jpg",
      "/assets/study.jpg",
      "/assets/tech.jpg"
    ];
    const randomImage = images[Math.floor(Math.random() * images.length)];
    setNewRoom(prev => ({
      ...prev,
      image: randomImage
    }));
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
                  placeholder="Search rooms..." 
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
                <h1 className="text-2xl font-bold">Rooms Management</h1>
                <p className="text-slate-400">Manage your classrooms and learning spaces across all buildings.</p>
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

                {/* Availability Filter */}
                <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                  <button 
                    onClick={() => setAvailabilityFilter("all")}
                    className={`px-3 py-2 text-sm ${availabilityFilter === "all" ? "bg-slate-700 text-white" : "text-slate-400"}`}
                  >
                    All
                  </button>
                  <button 
                    onClick={() => setAvailabilityFilter("available")}
                    className={`px-3 py-2 text-sm ${availabilityFilter === "available" ? "bg-emerald-800/70 text-emerald-300" : "text-slate-400"}`}
                  >
                    Available
                  </button>
                  <button 
                    onClick={() => setAvailabilityFilter("unavailable")}
                    className={`px-3 py-2 text-sm ${availabilityFilter === "unavailable" ? "bg-rose-800/70 text-rose-300" : "text-slate-400"}`}
                  >
                    Booked
                  </button>
                </div>

                {/* Building Filter */}
                <div className="relative">
                  <Filter size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {buildings.map(building => (
                      <option key={building} value={building}>{building}</option>
                    ))}
                  </select>
                </div>

                {/* Add Room Button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add Room</span>
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
              <div className="bg-rose-900/30 border border-rose-800 text-rose-200 px-4 py-3 rounded-lg flex items-center mb-6">
                <AlertCircle size={20} className="mr-2" />
                <span>{error}</span>
              </div>
            )}

            {/* Rooms Display - Grid View */}
            {!isLoading && !error && activeView === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredRooms.map((room, index) => (
                  <motion.div
                    key={room._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`bg-slate-800 border ${room.available ? 'border-emerald-700/70' : 'border-rose-700/70'} rounded-lg overflow-hidden hover:shadow-lg hover:shadow-emerald-900/10 transition-all duration-300`}
                  >
                    {/* Room Image */}
                    <div className="relative h-40 overflow-hidden">
                      <Image 
                        src={room.image}
                        alt={room.name}
                        fill
                        style={{objectFit: "cover"}}
                        className="transition-transform duration-300 hover:scale-105"
                      />
                      
                      {/* Availability Badge */}
                      <div 
                        className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium ${
                          room.available 
                            ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-600/50' 
                            : 'bg-rose-900/80 text-rose-300 border border-rose-600/50'
                        }`}
                      >
                        {room.available ? 'Available' : 'Booked'}
                      </div>
                      
                      {/* Certified Badge */}
                      {room.isCertified && (
                        <div className="absolute top-3 right-3 bg-amber-900/80 text-amber-300 border border-amber-600/50 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                          <Award size={12} className="mr-1" />
                          <span>Certified</span>
                        </div>
                      )}
                      
                      {/* Building Badge */}
                      <div className={`absolute bottom-3 left-3 bg-${buildingColors[room.building] || 'slate'}-900/80 text-${buildingColors[room.building] || 'slate'}-300 border border-${buildingColors[room.building] || 'slate'}-600/50 px-2 py-1 rounded text-xs font-medium`}>
                        {room.building}
                      </div>
                    </div>
                    
                    {/* Room Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-lg mb-1 line-clamp-1">{room.name}</h3>
                        <div className="flex space-x-1">
                          <button 
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => handleToggleRoomAvailability(room._id)}
                          >
                            {room.available ? (
                              <X size={14} />
                            ) : (
                              <Check size={14} />
                            )}
                          </button>
                          <button 
                            className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => toggleRoomDetails(room._id)}
                          >
                            <Info size={14} />
                          </button>
                          <button 
                            className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                            onClick={() => handleDeleteRoom(room._id)}
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-slate-400 text-sm mb-3">
                        <div className="flex items-center">
                          <span>Floor {room.floor}</span>
                          <span className="mx-2">•</span>
                          <div className="flex items-center">
                            <Users size={14} className="mr-1" />
                            <span>{room.capacity}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Room Features */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {room.hasProjector && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full flex items-center">
                            <ProjectorIcon size={10} className="mr-1" />
                            Projector
                          </span>
                        )}
                        {room.hasComputers && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full flex items-center">
                            <Laptop size={10} className="mr-1" />
                            Computers
                          </span>
                        )}
                        {room.hasWifi && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full flex items-center">
                            <Wifi size={10} className="mr-1" />
                            WiFi
                          </span>
                        )}
                        {room.hasCoffee && (
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded-full flex items-center">
                            <Coffee size={10} className="mr-1" />
                            Coffee
                          </span>
                        )}
                      </div>
                      
                      {/* Session Info (conditionally rendered details) */}
                      <AnimatePresence>
                        {showRoomDetails === room._id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-700 pt-3 mt-2"
                          >
                            <div className="text-xs text-slate-400">
                              <div className="flex justify-between mb-1">
                                <span>Last booked:</span>
                                <span className="text-slate-300">{room.lastBooked}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Next session:</span>
                                <span className={room.available ? "text-emerald-400" : "text-rose-400"}>
                                  {room.nextSession}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            
            {/* Rooms Display - List View */}
            {!isLoading && !error && activeView === "list" && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-700/50">
                        <th className="text-left p-4 font-medium text-sm">Room</th>
                        <th className="text-left p-4 font-medium text-sm">Building</th>
                        <th className="text-left p-4 font-medium text-sm">Capacity</th>
                        <th className="text-left p-4 font-medium text-sm">Features</th>
                        <th className="text-left p-4 font-medium text-sm">Status</th>
                        <th className="text-left p-4 font-medium text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRooms.map((room, index) => (
                        <motion.tr 
                          key={room._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.03 }}
                          className={`border-b border-slate-700 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
                        >
                          <td className="p-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-md overflow-hidden mr-3 relative flex-shrink-0">
                                <Image 
                                  src={room.image}
                                  alt={room.name}
                                  fill
                                  style={{objectFit: "cover"}}
                                />
                              </div>
                              <div>
                                <div className="font-medium">{room.name}</div>
                                <div className="text-xs text-slate-400">Floor {room.floor}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-${buildingColors[room.building] || 'slate'}-900/30 text-${buildingColors[room.building] || 'slate'}-400 border border-${buildingColors[room.building] || 'slate'}-800/50`}>
                              <Building size={12} className="mr-1" />
                              {room.building}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center text-slate-300">
                              <Users size={14} className="mr-2 text-slate-400" />
                              {room.capacity}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-2">
                              {room.hasProjector && (
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">Projector</span>
                              )}
                              {room.hasComputers && (
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">Computers</span>
                              )}
                              {room.hasWifi && (
                                <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">WiFi</span>
                              )}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className={`px-2 py-1 rounded text-xs font-medium inline-flex items-center ${
                              room.available 
                                ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50' 
                                : 'bg-rose-900/30 text-rose-400 border border-rose-800/50'}`
                            }>
                              <span className={`w-2 h-2 rounded-full mr-2 ${room.available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                              {room.available ? 'Available' : 'Booked'}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <button 
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => handleToggleRoomAvailability(room._id)}
                                title={room.available ? "Mark as Unavailable" : "Mark as Available"}
                              >
                                {room.available ? <X size={16} /> : <Check size={16} />}
                              </button>
                              <button 
                                className="p-1 text-slate-400 hover:text-emerald-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => toggleRoomDetails(room._id)}
                                title="Show Details"
                              >
                                <Info size={16} />
                              </button>
                              <button 
                                className="p-1 text-slate-400 hover:text-rose-400 rounded-full hover:bg-slate-700/50 transition-colors"
                                onClick={() => handleDeleteRoom(room._id)}
                                title="Delete Room"
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
            
            {!isLoading && !error && filteredRooms.length === 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                  <Home size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No rooms found</h3>
                <p className="text-slate-400 mb-4">Try adjusting your search or filter criteria</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={toggleModal}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg inline-flex items-center gap-2 transition-all duration-300"
                >
                  <Plus size={16} />
                  <span>Add New Room</span>
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

      {/* Add Room Modal */}
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
                  <h2 className="text-xl font-bold">Add New Room</h2>
                  <button
                    onClick={toggleModal}
                    className="p-1 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddRoom}>
                  <div className="space-y-4">
                    {/* Room Image Preview */}
                    <div className="relative rounded-lg overflow-hidden h-32 bg-slate-700">
                      <Image 
                        src={newRoom.image}
                        alt="Room Preview"
                        fill
                        style={{objectFit: "cover"}}
                      />
                      <button
                        type="button"
                        onClick={randomizeRoomImage}
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

                    {/* Room Name */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Home size={16} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={newRoom.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Room Name"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    {/* Building */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                        <Building size={16} />
                      </div>
                      <input
                        type="text"
                        name="building"
                        value={newRoom.building}
                        onChange={handleInputChange}
                        required
                        placeholder="Building"
                        className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Capacity */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Users size={16} />
                        </div>
                        <input
                          type="number"
                          name="capacity"
                          value={newRoom.capacity}
                          onChange={handleInputChange}
                          required
                          placeholder="Capacity"
                          min="1"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>

                      {/* Floor */}
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                          <Building size={16} />
                        </div>
                        <input
                          type="number"
                          name="floor"
                          value={newRoom.floor}
                          onChange={handleInputChange}
                          required
                          placeholder="Floor"
                          min="0"
                          className="w-full bg-slate-700/50 border border-slate-600 text-sm rounded-lg py-3 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="available"
                          name="available"
                          checked={newRoom.available}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="available" className="ml-2 text-sm">Available for scheduling</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasProjector"
                          name="hasProjector"
                          checked={newRoom.hasProjector}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="hasProjector" className="ml-2 text-sm">Has projector</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasComputers"
                          name="hasComputers"
                          checked={newRoom.hasComputers}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="hasComputers" className="ml-2 text-sm">Has computers</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasWifi"
                          name="hasWifi"
                          checked={newRoom.hasWifi}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="hasWifi" className="ml-2 text-sm">Has WiFi</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="hasCoffee"
                          name="hasCoffee"
                          checked={newRoom.hasCoffee}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="hasCoffee" className="ml-2 text-sm">Has coffee service</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="isCertified"
                          name="isCertified"
                          checked={newRoom.isCertified}
                          onChange={handleInputChange}
                          className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                        />
                        <label htmlFor="isCertified" className="ml-2 text-sm">Certified for special events</label>
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
                      <span>Add Room</span>
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
import React, { useState, useEffect } from 'react';
import "@/sass/fonts.scss";


/**
 * TimetableGrid Component
 * Displays a timetable in a grid layout with days as rows and periods as columns
 * 
 * @param {Object} props
 * @param {Array} props.schedule - The timetable schedule data
 * @param {number} props.periodsPerDay - Number of periods per day (default: 7)
 * @param {Array} props.days - List of days to display (default: monday-friday)
 * @param {string} props.viewType - The type of view ('class', 'teacher', 'room')
 * @param {Object} props.colorMap - Optional mapping for subject colors
 */
const TimetableGrid = ({
  schedule = [],
  periodsPerDay = 7,
  days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
  viewType = 'general',
  colorMap = {}
}) => {
  // State for organized schedule data
  const [grid, setGrid] = useState({});
  
  // Format day name for display
  const formatDay = (day) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };
  
  // Format period number for display
  const formatPeriod = (period) => {
    return `Period ${period}`;
  };
  
  // Generate a color based on subject name (if no color map is provided)
  const getSubjectColor = (subject) => {
    if (colorMap[subject]) {
      return colorMap[subject];
    }
    
    // Simple hash function for consistent colors
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to HSL color with fixed saturation and lightness for readability
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };
  
  // Organize schedule data into a grid format on component mount or data change
  useEffect(() => {
    const newGrid = {};
    
    // Initialize grid with empty cells
    days.forEach(day => {
      newGrid[day] = {};
      for (let period = 1; period <= periodsPerDay; period++) {
        newGrid[day][period] = null;
      }
    });
    
    // Fill grid with schedule data
    schedule.forEach(slot => {
      if (days.includes(slot.day) && slot.period <= periodsPerDay) {
        newGrid[slot.day][slot.period] = slot;
      }
    });
    
    setGrid(newGrid);
  }, [schedule, days, periodsPerDay]);
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Day / Period</th>
            {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map(period => (
              <th key={period} className="border p-2 text-center">
                {formatPeriod(period)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map(day => (
            <tr key={day}>
              <td className="border p-2 font-medium bg-gray-50">
                {formatDay(day)}
              </td>
              
              {Array.from({ length: periodsPerDay }, (_, i) => i + 1).map(period => {
                const slot = grid[day]?.[period];
                
                return (
                  <td key={`${day}-${period}`} className="border p-2 text-sm">
                    {slot ? (
                      <div 
                        className="p-2 rounded"
                        style={{ backgroundColor: getSubjectColor(slot.subject) }}
                      >
                        <div className="font-bold">{slot.subject}</div>
                        
                        {/* Show different details based on view type */}
                        {viewType !== 'class' && (
                          <div>Class: {slot.class}</div>
                        )}
                        
                        {viewType !== 'teacher' && (
                          <div>Teacher: {slot.teacher}</div>
                        )}
                        
                        {viewType !== 'room' && (
                          <div>Room: {slot.room}</div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center text-gray-400">—</div>
                    )}
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

export default TimetableGrid;
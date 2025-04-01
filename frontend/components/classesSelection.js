import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClassesSelectionForm = () => {
  // Main state
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [responseDebug, setResponseDebug] = useState(null);
  const [config, setConfig] = useState({
    classes: [],
    name: '',
    description: '',
    isActive: true
  });
  
  // Timetable state
  const [generatingTimetable, setGeneratingTimetable] = useState(false);
  const [timetable, setTimetable] = useState(null);
  const [timetableError, setTimetableError] = useState(null);

  // Fetch classes on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:5000/api/classes');
        
        // Store the entire response for debugging
        setResponseDebug(response.data);
        console.log('Raw API response:', response.data);
        
        // More flexible parsing logic
        let classesData = null;
        
        // Case 1: response.data is an array of classes directly
        if (Array.isArray(response.data)) {
          classesData = response.data;
          console.log('Response is a direct array');
        }
        // Case 2: Classes are in a property named "classes"
        else if (response.data && Array.isArray(response.data.classes)) {
          classesData = response.data.classes;
          console.log('Classes found in response.data.classes');
        }
        // Case 3: Classes are in a property named "data"
        else if (response.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
          console.log('Classes found in response.data.data');
        }
        // Case 4: Classes are in response.data.results
        else if (response.data && Array.isArray(response.data.results)) {
          classesData = response.data.results;
          console.log('Classes found in response.data.results');
        }
        // Case 5: Some other object structure
        else if (response.data && typeof response.data === 'object') {
          // Look for the first array property in the object
          for (const key in response.data) {
            if (Array.isArray(response.data[key])) {
              classesData = response.data[key];
              console.log(`Classes found in response.data.${key}`);
              break;
            }
          }
        }
        
        if (classesData && Array.isArray(classesData)) {
          // Verify the array contains objects with expected properties
          if (classesData.length === 0 || (classesData[0] && (classesData[0]._id || classesData[0].id))) {
            console.log('Classes loaded successfully:', classesData);
            // Normalize the data to ensure it has _id property
            const normalizedClasses = classesData.map(item => ({
              ...item,
              _id: item._id || item.id, // Use existing _id or fallback to id
              name: item.name || item.title || item.className || 'Unnamed Class' // Handle different property names
            }));
            setClasses(normalizedClasses);
          } else {
            console.error('Array items don\'t have expected structure:', classesData);
            setError('Classes data has unexpected format');
          }
        } else {
          console.error('Could not locate classes array in response:', response.data);
          setError('Could not find classes in the API response');
        }
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError(`Failed to load classes: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Handle class selection
  const handleClassToggle = (classId) => {
    setConfig(prevConfig => {
      if (prevConfig.classes.includes(classId)) {
        return {
          ...prevConfig,
          classes: prevConfig.classes.filter(id => id !== classId)
        };
      } else {
        return {
          ...prevConfig,
          classes: [...prevConfig.classes, classId]
        };
      }
    });
    
    // Clear any previous timetable when selection changes
    setTimetable(null);
    setTimetableError(null);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Submitting config:', config);
      // await axios.post('/api/saveConfig', config);
      alert('Configuration saved successfully!');
    } catch (err) {
      console.error('Error saving configuration:', err);
      alert(`Failed to save configuration: ${err.message || 'Unknown error'}`);
    }
  };

  // Generate timetable function
  const handleGenerateTimetable = async () => {
    // Check if classes are selected
    if (config.classes.length === 0) {
      setTimetableError("Please select at least one class to generate a timetable.");
      return;
    }
    
    setGeneratingTimetable(true);
    setTimetableError(null);
    
    try {
      console.log('Generating timetable for classes:', config.classes);
      
      // Get the selected class objects (not just IDs)
      const selectedClasses = classes.filter(cls => config.classes.includes(cls._id));
      console.log('Selected class details:', selectedClasses);
      
      // API call to generate timetable
      const response = await axios.post('http://localhost:5000/api/timetable/generate', {
        classes: config.classes,
        configName: config.name,
        configDescription: config.description
      });
      
      console.log('Timetable generation response:', response.data);
      
      if (response.data && (response.data.timetable || response.data.data)) {
        // Handle different response structures
        const timetableData = response.data.timetable || response.data.data || response.data;
        setTimetable(timetableData);
      } else {
        setTimetableError('Invalid timetable data received from server');
      }
    } catch (err) {
      console.error('Error generating timetable:', err);
      setTimetableError(`Generation Failed. ${err.response?.data?.message || err.message || 'Unknown error'}`);
    } finally {
      setGeneratingTimetable(false);
    }
  };

  // Handle other form inputs
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      ...prevConfig,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Helper function to format timetable display
  const formatTimetable = (timetableData) => {
    if (!timetableData) return null;
    
    // Common timetable formats:
    // 1. By day of week
    if (timetableData.days || timetableData.byDay) {
      const daysData = timetableData.days || timetableData.byDay;
      return (
        <div className="grid grid-cols-5 gap-2">
          {Object.entries(daysData).map(([day, slots]) => (
            <div key={day} className="bg-slate-700 p-3 rounded">
              <h3 className="font-medium text-white mb-2">{day}</h3>
              <div className="space-y-2">
                {Array.isArray(slots) ? slots.map((slot, idx) => (
                  <div key={idx} className="bg-slate-600 p-2 rounded text-sm">
                    <div className="text-emerald-300">{slot.time || `${slot.startTime}-${slot.endTime}`}</div>
                    <div className="font-medium">{slot.className || slot.subject || slot.title}</div>
                    {slot.teacher && <div className="text-xs text-slate-300">Teacher: {slot.teacher}</div>}
                    {slot.room && <div className="text-xs text-slate-300">Room: {slot.room}</div>}
                  </div>
                )) : (
                  <div className="text-slate-400 text-sm">No classes scheduled</div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // 2. If it's just a flat array of schedule items
    if (Array.isArray(timetableData)) {
      return (
        <div className="space-y-2">
          {timetableData.map((item, idx) => (
            <div key={idx} className="bg-slate-700 p-3 rounded flex justify-between">
              <div>
                <span className="font-medium">{item.className || item.subject}</span>
                {item.teacher && <span className="ml-2 text-sm text-slate-300">({item.teacher})</span>}
              </div>
              <div className="text-emerald-300">
                {item.day && <span className="mr-2">{item.day}</span>}
                {item.time || `${item.startTime}-${item.endTime}`}
                {item.room && <span className="ml-2 text-xs">Room {item.room}</span>}
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // 3. Fall back to raw JSON display if structure is unknown
    return (
      <pre className="bg-slate-700 p-3 rounded text-xs overflow-auto max-h-96">
        {JSON.stringify(timetableData, null, 2)}
      </pre>
    );
  };

  return (
    <div className="space-y-6 bg-slate-800 rounded-lg">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white">Configuration Form</h2>
        
        {/* Basic Configuration */}
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={config.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={config.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={config.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
            />
            <label htmlFor="isActive" className="ml-2 text-sm font-medium text-slate-300">
              Active
            </label>
          </div>
        </div>
        
        {/* Classes Selection */}
        <div className="border-t border-slate-700 pt-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Select Classes
          </label>
          
          {loading ? (
            <div className="flex items-center text-slate-400">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-sm italic">Loading classes...</p>
            </div>
          ) : error ? (
            <div className="text-red-400 space-y-2">
              <p className="text-sm italic">{error}</p>
              <button 
                type="button" 
                onClick={() => window.location.reload()}
                className="px-3 py-1 bg-slate-700 text-xs rounded text-slate-300 hover:bg-slate-600"
              >
                Retry
              </button>
            </div>
          ) : !Array.isArray(classes) || classes.length === 0 ? (
            <p className="text-sm text-slate-400 italic">
              No classes available. Please add classes first.
            </p>
          ) : (
            <div className="max-h-40 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {classes.map((classItem) => (
                <div
                  key={classItem._id}
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`class-${classItem._id}`}
                    checked={config.classes.includes(classItem._id)}
                    onChange={() => handleClassToggle(classItem._id)}
                    className="h-4 w-4 rounded border-slate-600 text-emerald-500 focus:ring-emerald-500 bg-slate-700"
                  />
                  <label
                    htmlFor={`class-${classItem._id}`}
                    className="ml-2 text-sm font-medium text-slate-300"
                  >
                    {classItem.name}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Selected Classes Summary */}
        {config.classes.length > 0 && (
          <div className="mt-4 p-3 bg-slate-700 rounded-md">
            <h3 className="text-sm font-medium text-slate-300 mb-1">Selected Classes ({config.classes.length})</h3>
            <div className="flex flex-wrap gap-2">
              {config.classes.map(classId => {
                const classItem = classes.find(c => c._id === classId);
                return classItem ? (
                  <span 
                    key={classId}
                    className="px-2 py-1 bg-emerald-900 text-emerald-200 text-xs rounded-full flex items-center"
                  >
                    {classItem.name}
                    <button
                      type="button"
                      onClick={() => handleClassToggle(classId)}
                      className="ml-1 text-emerald-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}
        
        {/* Submit and Timetable Generation Buttons */}
        <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-2 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-600 text-white font-medium rounded-md transition-colors"
          >
            Save Configuration
          </button>
          
          <button
            type="button"
            onClick={handleGenerateTimetable}
            disabled={loading || generatingTimetable || config.classes.length === 0}
            className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-medium rounded-md transition-colors"
          >
            {generatingTimetable ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
            ) : (
              'Generate Timetable'
            )}
          </button>
        </div>
      </form>
      
      {/* Timetable Results Section */}
      {(timetable || timetableError) && (
        <div className="border-t border-slate-700 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Timetable</h2>
          
          {timetableError ? (
            <div className="bg-red-900/50 border border-red-800 text-red-200 p-4 rounded-md">
              <p className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {timetableError}
              </p>
            </div>
          ) : (
            <div className="bg-slate-700 p-4 rounded-md">
              <h3 className="text-lg font-medium text-white mb-4">Generated Schedule</h3>
              {formatTimetable(timetable)}
              
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded"
                  onClick={() => {
                    const dataStr = JSON.stringify(timetable, null, 2);
                    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                    const fileName = `timetable-${config.name || 'export'}.json`;
                    
                    const linkElement = document.createElement('a');
                    linkElement.setAttribute('href', dataUri);
                    linkElement.setAttribute('download', fileName);
                    linkElement.click();
                  }}
                >
                  Export Timetable
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Enhanced Debug Info */}
      <div className="pt-4 border-t border-slate-700 text-xs text-slate-500 p-6">
        <details>
          <summary className="cursor-pointer">Debug Info</summary>
          <div className="mt-2 space-y-2">
            <div>
              <h4 className="font-semibold">Current State:</h4>
              <pre className="mt-1 p-2 bg-slate-900 rounded overflow-auto max-h-40">
                {JSON.stringify({ classes, config, timetable }, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold">API Response:</h4>
              <pre className="mt-1 p-2 bg-slate-900 rounded overflow-auto max-h-40">
                {JSON.stringify(responseDebug, null, 2)}
              </pre>
            </div>
            <div className="p-2 bg-yellow-900 text-yellow-100 rounded">
              <p>If you're seeing the "Unexpected data format" error, check the API Response above to understand the structure.</p>
              <p className="mt-1">Try modifying the API URL or examine your backend response format.</p>
            </div>
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600"
                onClick={() => console.log('Full API response:', responseDebug)}
              >
                Log API Response to Console
              </button>
              <button
                type="button"
                className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
};

export default ClassesSelectionForm;
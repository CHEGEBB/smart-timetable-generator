# Smart Timetable Generator

A straightforward web application to create timetables for schools and colleges.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **Backend**: Express.js, MongoDB
- **Export**: PDF generation, docx etc

## Project Structure

### Frontend Structure

```
timetable-app/
├── app/
│   ├── page.jsx                   # Auth screen (first screen users see)
│   ├── dashboard/
│   │   └── page.jsx               # Dashboard home with statistics
│   ├── courses/
│   │   └── page.jsx               # Manage courses
│   ├── teachers/
│   │   └── page.jsx               # Manage teachers
│   ├── rooms/
│   │   └── page.jsx               # Manage rooms
│   ├── classes/
│   │   └── page.jsx               # Manage classes
│   ├── generate/
│   │   └── page.jsx               # Generate timetable
│   ├── view/
│   │   ├── page.jsx               # Main timetable view with filters
│   │   ├── teacher/
│   │   │   └── page.jsx           # Teacher timetable view
│   │   ├── class/
│   │   │   └── page.jsx           # Class timetable view
│   │   └── room/
│   │       └── page.jsx           # Room timetable view
│   └── layout.jsx                 # Root layout with navigation sidebar
├── components/
│   ├── Sidebar.jsx                # Navigation sidebar
│   ├── Forms/                     # Reusable form components
│   └── TimetableGrid.jsx          # Timetable display component
├── services/
│   ├── authService.js             # Authentication API calls
│   ├── courseService.js           # Course data API calls
│   ├── teacherService.js          # Teacher data API calls
│   ├── roomService.js             # Room data API calls
│   ├── classService.js            # Class data API calls
│   └── timetableService.js        # Timetable generation & retrieval API calls
└── public/                        # Static assets
```

#### Frontend Components Explained

- **page.jsx** - Main authentication screen with login/signup functionality
- **dashboard/page.jsx** - Overview dashboard showing system statistics
- **courses/page.jsx** - Interface to add, edit, and delete courses
- **teachers/page.jsx** - Interface to manage teacher information and availability
- **rooms/page.jsx** - Interface to add and manage classroom information
- **classes/page.jsx** - Interface to create class groups and assign subjects
- **generate/page.jsx** - Page with timetable generation algorithm and options
- **view/page.jsx** - Main timetable viewing interface with filtering options
- **view/teacher/page.jsx** - Teacher-specific timetable view
- **view/class/page.jsx** - Class-specific timetable view
- **view/room/page.jsx** - Room utilization timetable view
- **layout.jsx** - Root layout with navigation sidebar
- **components/Sidebar.jsx** - Navigation component for the application
- **components/Forms/** - Reusable form components for data entry
- **components/TimetableGrid.jsx** - Visual timetable display component

#### Frontend Services Explained

- **services/authService.js** - Handles user authentication API calls (login, register, logout)
- **services/courseService.js** - Manages course data CRUD operations through API
- **services/teacherService.js** - Manages teacher data CRUD operations through API
- **services/roomService.js** - Manages room data CRUD operations through API
- **services/classService.js** - Manages class data CRUD operations through API
- **services/timetableService.js** - Handles timetable generation and retrieval operations

### Backend Structure

```
backend/
├── models/
│   ├── User.js                   # User accounts
│   ├── Course.js                 # Course info
│   ├── Teacher.js                # Teacher info
│   ├── Room.js                   # Room info
│   ├── Class.js                  # Class info
│   └── Timetable.js              # Generated timetables
├── controllers/
│   ├── authController.js         # Authentication logic
│   ├── courseController.js       # Course CRUD operations
│   ├── teacherController.js      # Teacher CRUD operations
│   ├── roomController.js         # Room CRUD operations
│   ├── classController.js        # Class CRUD operations
│   └── timetableController.js    # Timetable generation & retrieval
├── routes/
│   ├── auth.js                   # Auth endpoints
│   ├── courses.js                # Course operations
│   ├── teachers.js               # Teacher operations
│   ├── rooms.js                  # Room operations
│   ├── classes.js                # Class operations
│   └── timetable.js              # Timetable generation
├── middleware/
│   ├── authMiddleware.js         # Authentication middleware
│   └── validationMiddleware.js   # Input validation
├── utils/
│   └── timetableAlgorithm.js     # Simple scheduling algorithm
└── server.js                     # Express setup
```

## Database Structure

### Users
```javascript
{
  username: String,
  password: String,   // Hashed
  role: String        // "admin" or "teacher"
}
```

### Courses
```javascript
{
  name: String,        // e.g., "Mathematics", "Physics"
  hoursPerWeek: Number // e.g., 5
}
```

### Teachers
```javascript
{
  name: String,
  subjects: [String],  // Subjects they can teach
  availability: {
    monday: [Boolean], // Array of available periods
    tuesday: [Boolean],
    wednesday: [Boolean],
    thursday: [Boolean],
    friday: [Boolean]
  }
}
```

### Rooms
```javascript
{
  name: String,        // e.g., "Room 101" 
  capacity: Number     // e.g., 40
}
```

### Classes
```javascript
{
  name: String,        // e.g., "Grade 10A"
  subjects: [String]   // Required subjects
}
```

### Timetables
```javascript
{
  name: String,
  createdAt: Date,
  schedule: [
    {
      day: String,     // e.g., "monday"
      period: Number,  // e.g., 1, 2, 3
      class: String,   // Class name
      subject: String, // Subject name
      teacher: String, // Teacher name
      room: String     // Room name
    }
  ]
}
```

## System Workflow

### 1. Authentication
- Users log in through the main authentication screen
- Admin users have full access to all features
- Teachers can only view timetables relevant to them

### 2. Data Input
- **Courses**: Add subject details including weekly hour requirements
- **Teachers**: Add teacher information with subjects they can teach and availability
- **Rooms**: Add available classrooms with capacity information
- **Classes**: Create student groups/batches and assign required subjects

### 3. Timetable Generation
- Navigate to the Generate page
- Set basic constraints (working days, periods per day)
- Click "Generate Timetable" button
- System applies a simple scheduling algorithm to create conflict-free timetables

### 4. View & Export
- Access timetables in different views:
  - Overall view with filtering options (/view)
  - Teacher-specific schedules (/view/teacher)
  - Class-specific schedules (/view/class)
  - Room utilization schedules (/view/room)
- Export timetables as PDF for distribution

## Timetable Algorithm

The timetable generation follows these simple steps:

1. For each class:
   - For each subject needed by the class:
     - Find available teacher who can teach this subject
     - Find available room with sufficient capacity
     - Find available time slot that doesn't conflict
     - Assign the class-teacher-room to that time slot
     - Mark teacher, room, and time slot as used

2. The algorithm checks for conflicts:
   - No teacher can be in two places at once
   - No room can be double-booked
   - No class can have multiple subjects at the same time

3. If conflicts are detected, the system attempts to reassign to resolve them

## Key Features

✅ **Simple Authentication** - Basic login for admin and teachers  
✅ **Data Management** - Easy forms for adding and editing all required information  
✅ **Automated Scheduling** - One-click timetable generation  
✅ **Conflict-Free** - Algorithm ensures no scheduling conflicts  
✅ **Multiple Views** - See schedules by teacher, class, or room  
✅ **PDF Export** - Share timetables with stakeholders  
✅ **User-Friendly Interface** - Clean, intuitive design with Tailwind CSS

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Implementation Steps

1. **Setup Project**
   - Create Next.js project with Tailwind
   - Set up Express backend

2. **Create Basic Pages**
   - Authentication screen
   - Root layout with sidebar navigation
   - Data entry forms

3. **Implement Data Management**
   - Connect to MongoDB
   - Create CRUD operations

4. **Build Timetable Generator**
   - Implement basic scheduling algorithm
   - Add conflict detection

5. **Create Viewing Options**
   - Build timetable display component
   - Implement different view routes:
     - /view - Main view with filtering
     - /view/teacher - Teacher-specific views
     - /view/class - Class-specific views
     - /view/room - Room utilization views

6. **Add Export Feature**
   - Implement PDF export functionality

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new user (admin only)

### Courses
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course
- `PUT /api/courses/:id` - Update course
- `DELETE /api/courses/:id` - Delete course

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher

### Rooms
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Classes
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create new class
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### Timetable
- `POST /api/timetable/generate` - Generate new timetable
- `GET /api/timetable` - Get all timetables
- `GET /api/timetable/:id` - Get specific timetable
- `GET /api/timetable/teacher/:id` - Get teacher's timetable
- `GET /api/timetable/class/:id` - Get class timetable
- `GET /api/timetable/room/:id` - Get room timetable
- `POST /api/timetable/export/:id` - Export timetable as PDF

## Frontend Services Implementation

The services folder contains modules that handle all API communication between the frontend and backend:

### authService.js
```javascript
// Handles all authentication-related API calls
import axios from 'axios';

const API_URL = '/api/auth';

export const login = async (username, password) => {
  const response = await axios.post(`${API_URL}/login`, { username, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

export const register = async (username, password, role) => {
  return await axios.post(`${API_URL}/register`, { username, password, role });
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};
```

### courseService.js, teacherService.js, roomService.js, classService.js
These services follow a similar pattern for their respective entities:

```javascript
// Example: courseService.js
import axios from 'axios';
import { authHeader } from './authHeader';

const API_URL = '/api/courses';

export const getAllCourses = async () => {
  return await axios.get(API_URL, { headers: authHeader() });
};

export const getCourseById = async (id) => {
  return await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
};

export const createCourse = async (courseData) => {
  return await axios.post(API_URL, courseData, { headers: authHeader() });
};

export const updateCourse = async (id, courseData) => {
  return await axios.put(`${API_URL}/${id}`, courseData, { headers: authHeader() });
};

export const deleteCourse = async (id) => {
  return await axios.delete(`${API_URL}/${id}`, { headers: authHeader() });
};
```

### timetableService.js
```javascript
import axios from 'axios';
import { authHeader } from './authHeader';

const API_URL = '/api/timetable';

export const generateTimetable = async (constraints) => {
  return await axios.post(`${API_URL}/generate`, constraints, { headers: authHeader() });
};

export const getAllTimetables = async () => {
  return await axios.get(API_URL, { headers: authHeader() });
};

export const getTimetableById = async (id) => {
  return await axios.get(`${API_URL}/${id}`, { headers: authHeader() });
};

export const getTeacherTimetable = async (teacherId) => {
  return await axios.get(`${API_URL}/teacher/${teacherId}`, { headers: authHeader() });
};

export const getClassTimetable = async (classId) => {
  return await axios.get(`${API_URL}/class/${classId}`, { headers: authHeader() });
};

export const getRoomTimetable = async (roomId) => {
  return await axios.get(`${API_URL}/room/${roomId}`, { headers: authHeader() });
};

export const exportTimetable = async (id) => {
  return await axios.post(`${API_URL}/export/${id}`, {}, { 
    headers: authHeader(),
    responseType: 'blob'
  });
};
```

### authHeader.js
```javascript
// Helper function to create authorization headers
export const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  } else {
    return {};
  }
};
```
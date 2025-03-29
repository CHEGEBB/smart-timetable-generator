
# Smart Timetable Generator

A straightforward web application to create timetables for schools and colleges.

## Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS
- **Backend**: Express.js, MongoDB
- **Export**: PDF generation

## Project Structure

### Frontend Structure

```
timetable-app/
├── app/
│   ├── page.tsx                   # Auth screen (first screen users see)
│   ├── dashboard/
│   │   ├── layout.jsx             # Dashboard with sidebar
│   │   ├── page.jsx               # Dashboard home
│   │   ├── courses/
│   │   │   └── page.jsx           # Manage courses
│   │   ├── teachers/
│   │   │   └── page.jsx           # Manage teachers
│   │   ├── rooms/
│   │   │   └── page.jsx           # Manage rooms
│   │   ├── classes/
│   │   │   └── page.jsx           # Manage classes
│   │   ├── generate/
│   │   │   └── page.jsx           # Generate timetable
│   │   └── view/
│   │       ├── page.jsx           # View timetables
│   │       ├── teacher/
│   │       │   └── page.jsx       # Teacher view
│   │       ├── class/
│   │       │   └── page.jsx       # Class view
│   │       └── room/
│   │           └── page.jsx       # Room view
│   └── layout.jsx                 # Root layout
├── components/
│   ├── Sidebar.jsx                # Navigation sidebar
│   ├── Forms/                     # Basic form components
│   │   ├── CourseForm.jsx
│   │   ├── TeacherForm.jsx
│   │   ├── RoomForm.jsx
│   │   └── ClassForm.jsx
│   └── TimetableGrid.jsx          # Timetable display component
└── public/                        # Static assets
```

#### Frontend Components Explained

- **page.tsx** - Main authentication screen with login/signup functionality
- **dashboard/page.jsx** - Overview dashboard showing system statistics
- **dashboard/courses/page.jsx** - Interface to add, edit, and delete courses
- **dashboard/teachers/page.jsx** - Interface to manage teacher information and availability
- **dashboard/rooms/page.jsx** - Interface to add and manage classroom information
- **dashboard/classes/page.jsx** - Interface to create class groups and assign subjects
- **dashboard/generate/page.jsx** - Page with timetable generation algorithm and options
- **dashboard/view/page.jsx** - Main timetable viewing interface with filtering options
- **dashboard/view/teacher/page.jsx** - Teacher-specific timetable view
- **dashboard/view/class/page.jsx** - Class-specific timetable view
- **dashboard/view/room/page.jsx** - Room utilization timetable view
- **components/Sidebar.jsx** - Navigation component for the dashboard
- **components/Forms/** - Reusable form components for data entry
- **components/TimetableGrid.jsx** - Visual timetable display component

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
├── routes/
│   ├── auth.js                   # Auth endpoints
│   ├── data.js                   # CRUD operations
│   └── timetable.js              # Timetable generation
├── timetableAlgorithm.js         # Simple scheduling algorithm
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
  - Overall view with filtering options
  - Teacher-specific schedules
  - Class-specific schedules
  - Room utilization schedules
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
   - Dashboard layout
   - Data entry forms

3. **Implement Data Management**
   - Connect to MongoDB
   - Create CRUD operations

4. **Build Timetable Generator**
   - Implement basic scheduling algorithm
   - Add conflict detection

5. **Create Viewing Options**
   - Build timetable display component
   - Add different view filters

6. **Add Export Feature**
   - Implement PDF export# smart-timetable-generator

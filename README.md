Evallo HRMS - Human Resource Management System
📋 Project Overview
Evallo HRMS is a comprehensive Human Resource Management System built with Next.js, MongoDB, and modern web technologies. It provides organizations with tools to manage employees, teams, and assignments efficiently with secure authentication and comprehensive audit logging.

🚀 Live Demo & Setup
Prerequisites
Node.js 18+

MongoDB (Cloud )

Modern web browser

Environment Setup
Clone the repository

bash
git clone <repository-url>
cd Evallo-hrms-assessment
Install dependencies

bash
npm install --legacy-peer-deps
Environment Configuration
Create .env.local file:

env
MONGODB_URI=mongodb+srv://zeru:prithivi@cluster0.ag5jdmk.mongodb.net/evallo-hrms?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=f96d7a7724ee238ebdd913e4d51ecb9996f93826541abfbbc4b953ca05850828058b57e1e4c6d439bd45fcbe94b70efca90bb9f12c0300e61ed89ec41f481f52
Run the application

bash
npm run dev
Access the application
Open http://localhost:3000

🏗️ Project Architecture
Folder Structure
text
Evallo-hrms-assessment/
app
├── api
│  ├── assignments
│  │  └── route.js
│  ├── auth
│  │  ├── login
│  │  │  └── route.js
│  │  ├── logout
│  │  │  └── route.js
│  │  └── register
│  │     └── route.js
│  ├── employees
│  │  ├── [id]
│  │  │  └── route.js
│  │  └── route.js
│  ├── logs
│  │  └── route.js
│  └── teams
│     ├── [id]
│     │  └── route.js
│     └── route.js
├── globals.css
├── layout.jsx
└── page.jsx
components
├── modals
│  ├── confirmation-modal.jsx
│  ├── employee-modal.jsx
│  └── team-modal.jsx
├── pages
│  ├── assignments.jsx
│  ├── dashboard.jsx
│  ├── employee-list.jsx
│  ├── login.jsx
│  ├── signup.jsx
│  └── team-list.jsx
├── ui
│  ├── accordion.tsx
│  ├── alert-dialog.tsx
│  ├── alert.tsx
│  ├── aspect-ratio.tsx
│  ├── avatar.tsx
│  ├── badge.tsx
│  ├── breadcrumb.tsx
│  ├── button-group.tsx
│  ├── button.tsx
│  ├── calendar.tsx
│  ├── card.tsx
│  ├── carousel.tsx
│  ├── chart.tsx
│  ├── checkbox.tsx
│  ├── collapsible.tsx
│  ├── command.tsx
│  ├── context-menu.tsx
│  ├── dialog.tsx
│  ├── drawer.tsx
│  ├── dropdown-menu.tsx
│  ├── empty.tsx
│  ├── field.tsx
│  ├── form.tsx
│  ├── hover-card.tsx
│  ├── input-group.tsx
│  ├── input-otp.tsx
│  ├── input.tsx
│  ├── item.tsx
│  ├── kbd.tsx
│  ├── label.tsx
│  ├── menubar.tsx
│  ├── navigation-menu.tsx
│  ├── pagination.tsx
│  ├── popover.tsx
│  ├── progress.tsx
│  ├── radio-group.tsx
│  ├── resizable.tsx
│  ├── scroll-area.tsx
│  ├── select.tsx
│  ├── separator.tsx
│  ├── sheet.tsx
│  ├── sidebar.tsx
│  ├── skeleton.tsx
│  ├── slider.tsx
│  ├── sonner.tsx
│  ├── spinner.tsx
│  ├── switch.tsx
│  ├── table.tsx
│  ├── tabs.tsx
│  ├── textarea.tsx
│  ├── toast.tsx
│  ├── toaster.tsx
│  ├── toggle-group.tsx
│  ├── toggle.tsx
│  ├── tooltip.tsx
│  ├── use-mobile.tsx
│  └── use-toast.ts
├── navigation.jsx
└── theme-provider.tsx
hooks
├── use-mobile.ts
└── use-toast.ts
lib
├── models
│  ├── AuditLog.js
│  ├── Employee.js
│  ├── index.js
│  ├── Organization.js
│  ├── Team.js
│  └── User.js
├── util
│  └── utils.js
├── auth.js
├── dbConnect.js
├── mock-data.js
└── utils.ts
public
├── placeholder-logo.png
├── placeholder-logo.svg
├── placeholder-user.jpg
├── placeholder.jpg
└── placeholder.svg

🗄️ Database Schema Design
MongoDB Collections & Relationships
1. Organization Collection
javascript
{
  _id: ObjectId,
  name: String,           // Organization name
  email: String,          // Unique organization email
  phone: String,          // Contact phone
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  createdAt: Date,
  updatedAt: Date
}
2. User Collection
javascript
{
  _id: ObjectId,
  name: String,           // User's full name
  email: String,          // Unique email
  password: String,       // Hashed password
  role: String,           // 'admin', 'manager', 'user'
  organization: ObjectId, // Reference to Organization
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
3. Employee Collection
javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String,          // Unique within organization
  phone: String,
  department: String,
  position: String,
  salary: Number,
  hireDate: Date,
  organization: ObjectId, // Reference to Organization
  isActive: Boolean,
  teams: [ObjectId],      // Array of Team references
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  createdAt: Date,
  updatedAt: Date
}
4. Team Collection
javascript
{
  _id: ObjectId,
  name: String,           // Unique within organization
  description: String,
  department: String,
  teamLead: ObjectId,     // Reference to Employee
  members: [ObjectId],    // Array of Employee references
  organization: ObjectId, // Reference to Organization
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
5. AuditLog Collection
javascript
{
  _id: ObjectId,
  timestamp: Date,
  userId: ObjectId,       // Reference to User
  organization: ObjectId, // Reference to Organization
  action: String,         // 'login', 'logout', 'employee_create', etc.
  resourceType: String,   // 'user', 'employee', 'team', 'assignment'
  resourceId: ObjectId,   // ID of affected resource
  meta: Object,           // Additional context data
  // No timestamps (using custom timestamp field)
}
Database Relationships
text
Organization (1) ←→ (Many) Users
Organization (1) ←→ (Many) Employees  
Organization (1) ←→ (Many) Teams
Organization (1) ←→ (Many) AuditLogs

Employee (Many) ←→ (Many) Teams
Team (1) ←→ (1) Employee (as teamLead)
User (1) ←→ (Many) AuditLogs
🔐 Authentication & Security
JWT Token Structure
javascript
{
  userId: "user_id_string",
  organizationId: "org_id_string", 
  role: "admin|manager|user",
  iat: timestamp,
  exp: timestamp
}
Security Features
Password Hashing: bcrypt with salt rounds 12

JWT Tokens: 7-day expiry with secure secret

Organization Isolation: Users can only access their organization's data

Input Validation: Mongoose validation on all models

CORS Protection: Built-in Next.js CORS handling

📊 API Endpoints
Authentication Routes
Method	Endpoint	Description	Auth Required
POST	/api/auth/register	Create organization & admin user	No
POST	/api/auth/login	User login	No
POST	/api/auth/logout	User logout	Yes
Employee Management
Method	Endpoint	Description	Auth Required
GET	/api/employees	Get employees list	Yes
POST	/api/employees	Create new employee	Yes
GET	/api/employees/[id]	Get single employee	Yes
PUT	/api/employees/[id]	Update employee	Yes
DELETE	/api/employees/[id]	Delete employee	Yes
Team Management
Method	Endpoint	Description	Auth Required
GET	/api/teams	Get teams list	Yes
POST	/api/teams	Create new team	Yes
GET	/api/teams/[id]	Get single team	Yes
PUT	/api/teams/[id]	Update team	Yes
DELETE	/api/teams/[id]	Delete team	Yes
Assignment Management
Method	Endpoint	Description	Auth Required
GET	/api/assignments	Get employee-team assignments	Yes
POST	/api/assignments	Assign/remove employee from team	Yes
Audit Logs
Method	Endpoint	Description	Auth Required
GET	/api/logs	Get activity logs	Yes
🎨 Frontend Features
Theme System
Light/Dark Mode: Toggle with system preference detection

CSS Variables: Consistent design tokens

Responsive Design: Mobile-first approach

Key Components
Navigation: Responsive with mobile bottom nav

Dashboard: Overview with stats and recent activity

Employee Management: CRUD operations with search/filter

Team Management: Team creation with member assignment

Assignments: Visual team-employee relationship management

Modals: Reusable for forms and confirmations

UI/UX Features
Toast Notifications: Success/error feedback

Loading States: Skeleton screens and spinners

Form Validation: Client and server-side validation

Search & Filter: Real-time data filtering

Pagination: Efficient data loading

🔍 Audit Logging System
Logged Actions
User Actions: Login, logout

Employee Operations: Create, update, delete

Team Operations: Create, update, delete

Assignment Operations: Add to team, remove from team

Log Entry Format
javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  userId: "user_123",
  organization: "org_456", 
  action: "employee_create",
  resourceType: "employee",
  resourceId: "emp_789",
  meta: {
    employee: "John Doe",
    department: "Engineering"
  }
}
🛠️ Technical Implementation
Backend Technologies
Next.js 16: App Router with API Routes

MongoDB: Document database with Mongoose ODM

JWT: Stateless authentication

bcryptjs: Password hashing

React Hot Toast: Notification system

Frontend Technologies
React 18: Functional components with hooks

Tailwind CSS: Utility-first styling

Lucide React: Icon library

next-themes: Theme management

Performance Optimizations
Database Indexing: Optimized query performance

API Caching: Efficient data fetching

Code Splitting: Lazy-loaded components

Image Optimization: Next.js Image component

📱 How to Use Evallo HRMS
Step 1: Account Creation
Navigate to the signup page

Enter organization details and admin user information

System automatically creates organization and admin account

Step 2: Login
Use registered email and password

System redirects to dashboard upon successful authentication

Step 3: Manage Employees
Add Employees: Click "Add Employee" from dashboard or employee list

Edit Employees: Click edit icon on employee card

Delete Employees: Click delete icon (requires confirmation)

Search/Filter: Use search bar and department filter

Step 4: Manage Teams
Create Teams: Click "Create Team" from dashboard or team list

Assign Members: Add employees to teams during creation or editing

Set Team Leads: Designate team leads from existing members

Manage Teams: Edit or delete teams as needed

Step 5: Assign Employees to Teams
Navigate to Assignments page

Expand employee card to see current teams

Click "+" to assign to available teams

Click "×" to remove from existing teams

Step 6: Monitor Activity
View recent activity on dashboard

Check audit logs for complete activity history

Monitor team assignments and organizational structure

🔄 Data Flow
Authentication Flow
text
Signup → Create Organization & User → JWT Token → Protected Routes
Login → Verify Credentials → JWT Token → Access Application
CRUD Operations Flow
text
Frontend Request → API Route → Authentication Check → Database Operation → Audit Log → Response
Real-time Updates
Form submissions trigger immediate UI updates

Toast notifications provide user feedback

Automatic data refresh after mutations

🛡️ Security Measures
Data Protection
Organization Isolation: Users cannot access other organizations' data

Input Sanitization: Mongoose validation prevents injection attacks

Password Security: Strong hashing prevents password theft

Token Security: JWT tokens with expiration prevent replay attacks

Access Control
Role-based Access: Different permission levels (future enhancement)

Route Protection: Authentication required for all data operations

Ownership Verification: Users can only modify their organization's data

📈 Scalability Features
Database Design
Indexed Fields: Fast query performance on common searches

Document References: Efficient relationships without joins

Atomic Operations: Safe concurrent data modifications

API Design
RESTful Principles: Consistent endpoint structure

Error Handling: Comprehensive error responses

Pagination: Efficient data loading for large datasets

Frontend Architecture
Component Reusability: Modular, reusable UI components

State Management: Efficient React state patterns

Performance: Optimized rendering and data fetching

🎯 Future Enhancements
Planned Features
Advanced Reporting: Analytics and insights

Role Management: Granular permission system

Bulk Operations: Import/export capabilities

Email Notifications: Automated alerts and reminders

Mobile App: React Native application

Technical Improvements
API Rate Limiting: Prevent abuse

Data Export: CSV/PDF reports

Real-time Updates: WebSocket integration

Advanced Search: Full-text search capabilities

🐛 Troubleshooting
Common Issues
Authentication Errors: Check JWT secret and token expiration

Database Connection: Verify MongoDB URI and network connectivity

CORS Issues: Ensure proper origin configuration

Validation Errors: Check input data formats and requirements

Development Tips
Use browser dev tools for debugging

Check server logs for API errors

Validate environment variables

Test with different user roles and scenarios

📞 Support
For technical support or questions about Evallo HRMS:

Check the application logs for error details

Verify environment configuration

Review API documentation for endpoint specifications

Test with sample data to isolate issues


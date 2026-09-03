Farm Time Management System — Backend

Backend REST API for the Farm Time Management System developed using Node.js and Express.js.

Requirements
Node.js
npm
Installation

Open a terminal in the backend folder and run:

npm install
Running the Server

Start the backend with:

npm start

The server will run at:

http://localhost:3000

API Endpoints
Staff
Method	Endpoint	Purpose
GET	/api/staff	Get all staff
GET	/api/staff/:id	Get a staff member
POST	/api/staff	Create a staff member
PUT	/api/staff/:id	Update a staff member
DELETE	/api/staff/:id	Delete a staff member
Rosters
Method	Endpoint	Purpose
GET	/api/rosters	Get all rosters
GET	/api/rosters/:id	Get a roster
GET	/api/rosters/staff/:staffId	Get rosters for a staff member
POST	/api/rosters	Create a roster
PUT	/api/rosters/:id	Update a roster
DELETE	/api/rosters/:id	Delete a roster
POST	/api/rosters/validate	Validate staff roster and clock-in time
Attendance
Method	Endpoint	Purpose
GET	/api/attendance	Get attendance records
POST	/api/attendance/clock-in	Clock a staff member in
POST	/api/attendance/clock-out	Clock a staff member out
POST	/api/attendance/:attendanceId/breaks	Record a break
Payroll
Method	Endpoint	Purpose
GET	/api/payroll/:staffId	Calculate payroll for a staff member
Testing

The API can be tested using tools such as:

Postman
PowerShell
Browser for GET requests

Example:

GET http://localhost:3000/api/staff
Data Storage

The current backend uses in-memory mock data for development and testing.

Data will be replaced/integrated with the project's database implementation when the database component is connected.

Development

The backend uses:

Node.js
Express.js
RESTful API architecture
JSON request/response format
CommonJS modules
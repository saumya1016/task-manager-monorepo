# 🚀 TaskFlow: Real-Time Collaborative Task Management

TaskFlow is a high-performance, full-stack monorepo designed for team collaboration. It combines JWT-based security, AWS S3 cloud storage, and Socket.io for real-time presence tracking.

Live Demo: [task-manager-monorepo-alpha.vercel.app](https://task-manager-monorepo-alpha.vercel.app/)

---


## 🌟 Key Features

### Real-Time Collaboration
* **Presence Tracking:** Powered by Socket.io; see active users per board in real-time with live status pulses.
* **Kanban Engine:** Smooth drag-and-drop task management via `@hello-pangea/dnd` with optimistic UI updates.
* **Confetti Celebrations:** Visual rewards using `canvas-confetti` when moving tasks to the "Done" column.

### Enterprise-Grade Security
* **RBAC (Role-Based Access Control):** Granular permissions for Owners, Admins, Members, and Viewers.
* **Smart Authentication:** Supports standard login/signup, Google OAuth (Firebase), and 6-digit OTP password recovery.
* **Tab-Isolated Sessions:** Innovative session management that allows different accounts to be open in different browser tabs simultaneously.

### Cloud & Productivity
* **AWS S3 Integration:** High-speed profile picture uploads stored securely in the cloud.
* **Productivity Analytics:** Visual efficiency gauges and task statistics on a personalized Profile Hub.
* **Notification System:** Real-time alerts for board joins and task updates.
  

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Lucide Icons, Axios, Sonner |
| **Backend** | Node.js, Express.js, Socket.io, MongoDB, Mongoose |
| **Services** | AWS S3, Firebase Auth, EmailJS, Nodemailer |



---

## 📂 Monorepo Structure
```text

task-manager-monorepo/
├── Backend/        # Express.js Server, Socket.io logic, Mongoose Models
└── Frontend/       # React App, Tailwind Styling, Custom Interceptors


```

## 🚦 API Documentation
### 👤 Auth & Profile (`/api/auth`)
* `POST /signup` — Create a new account. (Public)
* `POST /login` — Authenticate and receive a JWT token. (Public)
* `POST /forgot-password` — Send a 6-digit OTP to user email. (Public)
* `PUT /update-profile` — Update the user's display name. (Auth)
* `PUT /update-dp` — Sync a profile picture to AWS S3. (Auth)
* `GET /notifications` — Fetch user-specific alerts. (Auth)
  

---


### 📋 Workspaces (`/api/boards`)
* `GET /` — Fetch all boards (Owner or Member). (Auth)
* `POST /` — Create a new workspace board. (Auth)
* `GET /:id` — Get detailed data for a specific board. (Auth)
* `PUT /:id/join` — Join a board using an invite link. (Auth)
* `DELETE /:id` — Delete a workspace (Owner only). (Auth)
  

---


### 📝 Tasks (`/api/tasks`)
* `GET /my-tasks` — Retrieve all tasks assigned to the logged-in user. (Auth Required)
* `GET /stats` — Get productivity metrics and efficiency scores. (Auth Required)
* `POST /` — Create a new task within a board (Owner/Admin only). (Auth Required)
* `PUT /:id` — Update task content, status, or priority. (Auth Required)
* `DELETE /:id` — Remove a task from the board (Owner/Admin only). (Auth Required)

---


## ⚙️ Environment Variables
### 🖥️ Backend (`/Backend/.env`)
```env
PORT=5000
CLIENT_URL=task-manager-monorepo-alpha.vercel.app
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
AWS_REGION=us-east-1
AWS_ACCESS_KEY=your_aws_access_key
AWS_SECRET_KEY=your_aws_secret_key
AWS_BUCKET_NAME=taskflow-profile-photos
```

### 🌐 Frontend (/Frontend/.env)
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
VITE_API_URL=http://localhost:5000/api

# EmailJS Configuration (For Invites & Feedback)
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```


---



🚀 Installation & Setup
1. Clone the Repository:
   git clone [https://github.com/saumya1016/task-manager-monorepo.git](https://github.com/saumya1016/task-manager-monorepo.git)
   cd task-manager-monorepo

2. Setup Backend:
   cd Backend
   npm install
   npm start

4. Setup Frontend:
   cd ../Frontend
   npm install
   npm run dev


### 🤝 How to Contribute
We love contributions! To keep the project organized and maintain high code quality, please follow these steps:

1. Fork the Repo: Click the Fork button at the top right of this page to create your own copy.
   

2. Clone your Fork: Download the code to your local machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/task-manager-monorepo.git
   ```

3. Create a Branch: Always work on a new branch for your features or fixes:
      ```bash
     git checkout -b feature/YourFeatureName 
      ```
   
4. Setup Environment: Copy the .env.example files in both folders. Fill them with your own local keys to ensure the app runs correctly.
   

5. Commit & Push: Commit your changes with descriptive messages and push them to your fork:
    ```bash
   git commit -m "Add: Descriptive message about your change"
   git push origin feature/YourFeatureName    
      ```

6. Open a Pull Request: Go to the original repository and click New Pull Request to submit your changes for review.

   

   ---
   
   
Developed by **[saumya1016](https://github.com/saumya1016)**

    

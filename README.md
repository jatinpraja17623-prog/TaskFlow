# ⚡ TaskFlow — Team Task Manager

A full-stack web app to create projects, assign tasks, and track progress with role-based access.

## 🛠 Tech Stack
- **Frontend:** React.js, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcrypt
- **Deployment:** Railway + Vercel

## ✨ Features
- 🔐 Auth (Register/Login) with JWT
- 👑 Role-based access (Admin / Member)
- 📁 Project management
- ✅ Kanban task board (Todo / In Progress / Done)
- 📊 Dashboard with stats & progress bar
- ⚠️ Overdue task detection
- 👥 Team member management

## 🚀 Local Setup

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env — add your MongoDB URI
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

## 🌐 Deploy on Railway
1. Push to GitHub
2. Go to railway.app → New Project → Deploy from GitHub
3. Add MongoDB plugin
4. Set environment variables
5. Deploy frontend on Vercel

## 📡 API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| GET | /api/projects | Get projects |
| POST | /api/projects | Create project |
| POST | /api/projects/:id/members | Add member |
| GET | /api/tasks/project/:id | Get tasks |
| POST | /api/tasks/project/:id | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/tasks/dashboard/stats | Dashboard stats |

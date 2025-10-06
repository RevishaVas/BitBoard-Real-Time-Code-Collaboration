#  BitBoard – Real-Time Agile Collaboration Platform

**BitBoard** is a real-time, collaborative Agile project management platform that integrates **task boards, live coding, chat, comments, and visual analytics** into a unified interface.  
It was developed as part of the **Advanced Databases** course at **SRH University Heidelberg** under the guidance of **Prof. Frank Hefter**.

---

##  Overview

BitBoard enhances team productivity through seamless collaboration in a modern, browser-based environment.  
It combines multiple real-time systems:
- **Kanban Task Management**
- **Real-Time Code Collaboration**
- **Threaded Comments & In-App Chat**
- **Graph-Based Project Visualization**

All components are powered by an integrated **MERN stack** with **Redis** and **Neo4j**, ensuring live updates and interactive dashboards.

---

##  Key Features

-  **Kanban Board & Task Management** – Create, assign, and move tasks between columns with drag-and-drop functionality.  
-  **Real-Time Code Collaboration** – Edit and execute code live in a shared workspace using WebSockets and Redis.  
-  **Chat & Comments System** – Threaded comments and real-time chat powered by MongoDB Change Streams and Redis Pub/Sub.  
-  **Graph-Based Visualization** – Explore task relationships, dependencies, and user workloads through an interactive Neo4j graph.  
-  **KPI Dashboard** – Displays project insights such as overdue tasks, workload per user, and critical task paths.

---

##  Tech Stack

| Layer | Technologies |
|-------|---------------|
| **Frontend** | React, Tailwind CSS, Recharts, react-force-graph |
| **Backend** | Node.js, Express.js |
| **Databases** | MongoDB (tasks, chat, comments), Redis (real-time Pub/Sub), Neo4j (task relationships) |
| **Deployment** | Docker Compose |
| **Testing** | Postman |
| **Version Control** | GitHub |

---

##  System Architecture

**Databases:**
- **MongoDB** – Persistent storage for tasks, users, comments, and chat messages.  
- **Redis** – Real-time event streaming (Pub/Sub) for task updates, chat, and notifications.  
- **Neo4j** – Graph-based visualization for dependencies and analytics.

**Architecture Pattern:** Event-driven, Microservices-style communication between modules.

---

##  Core Modules

| Module | Developer | Description |
|---------|------------|-------------|
| **Board & Task Management** | Ayesha Dhool | Dynamic task board with subtasks, file attachments, and live updates. |
| **Real-Time Code Collaboration** | Bilal Hussain | Shared live coding rooms with execution support and Redis-based synchronization. |
| **Graph-Based Project View** | Revisha Vas | Neo4j visualization of user-task relationships and project KPIs. |
| **Comments System** | Nayana Suresh | Threaded, real-time comments with @mentions, reactions, and attachments. |
| **Chat System** | Praharsha Sarraju | Real-time private and group messaging via WebSocket and Redis. |

---

##  Example API Endpoints

| Feature | Endpoint | Description |
|----------|-----------|-------------|
| Tasks | `/api/tasks` | Create or update tasks |
| Code Collaboration | `/api/code/execute` | Run code from shared sessions |
| Chat | `/api/chat/history/:user1/:user2` | Fetch message history |
| Graph View | `/api/status/graph` | Return Neo4j node and relationship data |
| KPIs | `/api/status/overdueTasks` | Count overdue tasks dynamically |

---

##  Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/BitBoard.git
cd BitBoard
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start backend and frontend
```bash
docker-compose up
```

### 4. Access the app
Open your browser and go to:
 http://localhost:3000


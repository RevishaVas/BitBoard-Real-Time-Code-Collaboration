import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import LoginPage from './pages/LoginPage';

import CodeCollaborationPage from "./pages/CodeCollaborationPage";
import KanbanPage from "./pages/KanbanPage";
import ChatPage from "./pages/ChatPage";
import Layout from "./pages/Layout";

const App = () => {
  const currentUser = useSelector((state) => state.auth.user);

  return (
    <div className="flex flex-col h-screen">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route element={<Layout />}>
            <Route
              path="code/:roomId"
              element={
                currentUser ? <CodeCollaborationPage /> : <Navigate to="/" />
              }
            />
            <Route
              path="code-collaboration"
              element={
                currentUser ? <CodeCollaborationPage /> : <Navigate to="/" />
              }
            />
            <Route
              path="kanban"
              element={
                currentUser ? <KanbanPage /> : <Navigate to="/" />
              }
            />
            <Route
              path="chat"
              element={
                currentUser ? <ChatPage /> : <Navigate to="/" />
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;

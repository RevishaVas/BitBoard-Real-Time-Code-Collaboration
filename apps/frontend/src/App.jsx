import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

import CodeCollaborationPage from "./pages/CodeCollaborationPage";
import KanbanPage from "./pages/KanbanPage";
import ChatPage from "./pages/ChatPage";
import Layout from "./pages/Layout";
import DummyUserLogin from "./components/DummyUserLogin";

const App = () => {
  const currentUser = useSelector((state) => state.auth.user);

  return (
  <div className="flex flex-col h-screen">
      <BrowserRouter>
        {currentUser ? (
          <DummyUserLogin />
        ) : (
          <Routes>
            <Route path="/" element={<Navigate to="/kanban" />} />
            <Route path="/code/:roomId" element={<CodeCollaborationPage />} />
            <Route element={<Layout />}>
              <Route index element={<CodeCollaborationPage />} />
              <Route path="code-collaboration" element={<CodeCollaborationPage />} />
              <Route path="kanban" element={<KanbanPage />} />
              <Route path="chat" element={<ChatPage />} />
            </Route>
          </Routes>
        )}
      </BrowserRouter>
    </div>
  );
};

export default App;

import { createContext, useContext, useRef } from "react";

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const socketRef = useRef(null);

  const connect = (token) => {
    if (socketRef.current) return socketRef.current;

    const ws = new WebSocket(`ws://localhost:5002?token=${token}`);

    socketRef.current = ws;
    return ws;
  };

  return (
    <WebSocketContext.Provider value={{ socketRef, connect }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);

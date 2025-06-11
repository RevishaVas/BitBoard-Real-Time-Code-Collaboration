import { io } from 'socket.io-client';

const commentSocket = io("http://localhost:5002"); // or use env var

export default commentSocket;

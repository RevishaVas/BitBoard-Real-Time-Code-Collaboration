import { io } from 'socket.io-client';
const chatSocket = io('http://localhost:5006');
export default chatSocket;
import { io } from 'socket.io-client';
const kanbanSocket = io("http://localhost:5000");
export default kanbanSocket;

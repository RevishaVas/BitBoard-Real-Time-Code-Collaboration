import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { userAtom } from './atoms/userAtom';
import { useNavigate, useParams } from 'react-router-dom';
import { socketAtom } from './atoms/socketAtom';
import { IP_ADDRESS } from '../../Globle.js';
import { FaArrowLeft } from 'react-icons/fa';
import PropTypes from 'prop-types';

const CreateRoom = ({ onRoomCreated }) => {
  const [name, setName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [mode, setMode] = useState(null); 
  
  const [nameError, setNameError] = useState("");
  const [roomIdError, setRoomIdError] = useState("");

  const params = useParams();
  const [user, setUser] = useRecoilState(userAtom);
  const [socket, setSocket] = useRecoilState(socketAtom);

  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const generateId = () => {
    const id = Math.floor(Math.random() * 100000);
    return id.toString();
  }
  CreateRoom.propTypes = {
    onRoomCreated: PropTypes.func.isRequired
  };
  const initializeSocket = () => {
    setIsProcessing(true);
    let GeneratedId = "";
    if (user.id === "") {
      GeneratedId = generateId();
      setUser({
        id: GeneratedId,
        name: name,
        roomId: ""
      });
    }

    if (!socket || socket.readyState === WebSocket.CLOSED) {
      const u = {
        id: user.id === "" ? GeneratedId : user.id,
        name: name
      }
      const ws = new WebSocket(`ws://${IP_ADDRESS}:5002?roomId=${mode === 'join' ? roomId : ''}&id=${u.id}&name=${u.name}`);

      setSocket(ws);

      ws.onopen = () => {
        console.log("Connected to WebSocket");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "roomId") {
          setRoomId(data.roomId);
          console.log("Room ID : ", data.roomId);
          setUser({
            id: user.id === "" ? GeneratedId : user.id,
            name: name,
            roomId: data.roomId
          });

          setIsProcessing(false);
          alert(data.message);
          if (onRoomCreated) {
            onRoomCreated(data.roomId);
          }
          // navigate("/code/" + data.roomId);
        }
      };
      
      ws.onclose = () => {
        console.log("WebSocket connection closed from register page");
        setIsProcessing(false);
      };
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsProcessing(false);
      };
    }
    else {
      setIsProcessing(false);
    }
  }

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    setNameError("");
    
    if (!name.trim()) {
      setNameError("Please enter your name to continue");
      return;
    }
    
    if (isProcessing) return;
    
    
    if (onRoomCreated) {
      onRoomCreated("");
    }
  }

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    setNameError("");
    setRoomIdError("");

    if (!name.trim()) {
      setNameError("Please enter your name to continue");
      return;
    }

    if (!roomId.trim()) {
      setRoomIdError("Please enter workspace ID to continue");
      return;
    }

    if (roomId.length !== 6) {
      setRoomIdError("Workspace ID must be 6 digits");
      return;
    }

    if (isProcessing) return;

  
    if (onRoomCreated) {
      onRoomCreated("");
    }
  }

  const handleBack = () => {
    setMode(null);
    setName("");
    setRoomId("");
    setNameError("");
    setRoomIdError("");
  }

  useEffect(() => {
    setRoomId(params.roomId || "");
  }, [params.roomId]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#2e2e2e] dark:bg-[#1f1f1f] p-6 z-10 sm:ml-64 sm:pt-16">
      <div className="bg-[#3d3d3d] dark:bg-[#3d3d3d] rounded-lg shadow-lg p-8 w-full max-w-md relative">
        {mode && (
          <button 
            onClick={handleBack}
            className="absolute top-4 left-4 text-gray-300 hover:text-white transition"
          >
            <FaArrowLeft size={20} />
          </button>
        )}
        
        <h1 className="text-3xl font-bold text-center text-green-500 mb-8">Workspace</h1>

        {!mode ? (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Create New Workspace
            </button>
            
            <button
              onClick={() => setMode('join')}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Join Workspace
            </button>
          </div>
        ) : mode === 'create' ? (
          <form onSubmit={handleCreateSubmit}>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                className={`w-full p-3 rounded-lg text-white bg-[#525252] focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  nameError ? "border border-red-500" : "border border-transparent"
                }`}
                required
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !name.trim()}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              Create New Workspace
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinSubmit}>
            <div className="mb-6">
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameError("");
                }}
                className={`w-full p-3 rounded-lg text-white bg-[#525252] focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  nameError ? "border border-red-500" : "border border-transparent"
                }`}
                required
              />
              {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Workspace ID (6 digits)"
                value={roomId}
                onChange={(e) => {
                  setRoomId(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setRoomIdError("");
                }}
                className={`w-full p-3 rounded-lg text-white bg-[#525252] focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                  roomIdError ? "border border-red-500" : "border border-transparent"
                }`}
                required
              />
              {roomIdError && <p className="text-red-500 text-sm mt-1">{roomIdError}</p>}
            </div>

            <button
              type="submit"
              disabled={isProcessing || !name.trim() || roomId.length !== 6}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing && (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              )}
              Join Workspace
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateRoom;


























// import { useEffect, useState } from 'react';
// import { useRecoilState } from 'recoil';
// import { userAtom } from './atoms/userAtom';
// import { useNavigate, useParams } from 'react-router-dom';
// import { socketAtom } from './atoms/socketAtom';
// import { IP_ADDRESS } from '../../Globle.js';

// const CreateRoom = () => {
//   const [name, setName] = useState("");
//   const [roomId, setRoomId] = useState("");
//   const [showWorkspaceIdInput, setShowWorkspaceIdInput] = useState(false);

//   const [nameError, setNameError] = useState("");
//   const [roomIdError, setRoomIdError] = useState("");

//   const params = useParams();
//   const [user, setUser] = useRecoilState(userAtom);
//   const [socket, setSocket] = useRecoilState(socketAtom);

//   const [isProcessing, setIsProcessing] = useState(false);
//   const [activeButton, setActiveButton] = useState(null); // 'create' or 'join'

//   const navigate = useNavigate();

//   const generateId = () => {
//     const id = Math.floor(Math.random() * 100000);
//     return id.toString();
//   }

//   const initializeSocket = () => {
//     setIsProcessing(true);
//     let GeneratedId = "";
//     if (user.id === "") {
//       GeneratedId = generateId();
//       setUser({
//         id: GeneratedId,
//         name: name,
//         roomId: ""
//       });
//     }

//     if (!socket || socket.readyState === WebSocket.CLOSED) {
//       const u = {
//         id: user.id === "" ? GeneratedId : user.id,
//         name: name
//       }
//       const ws = new WebSocket(`ws://${IP_ADDRESS}:5000?roomId=${roomId}&id=${u.id}&name=${u.name}`);

//       setSocket(ws);

//       ws.onopen = () => {
//         console.log("Connected to WebSocket");
//       };

//       ws.onmessage = (event) => {
//         const data = JSON.parse(event.data);
//         if (data.type === "roomId") {
//           setRoomId(data.roomId);
//           console.log("Room ID : ", data.roomId);
//           setUser({
//             id: user.id === "" ? GeneratedId : user.id,
//             name: name,
//             roomId: data.roomId
//           });

//           setIsProcessing(false);
//           setActiveButton(null);
//           alert(data.message);
//           navigate("/code/" + data.roomId);
//         }
//       };
      
//       ws.onclose = () => {
//         console.log("WebSocket connection closed from register page");
//         setIsProcessing(false);
//         setActiveButton(null);
//       };
      
//       ws.onerror = (error) => {
//         console.error("WebSocket error:", error);
//         setIsProcessing(false);
//         setActiveButton(null);
//       };
//     }
//     else {
//       setIsProcessing(false);
//       setActiveButton(null);
//     }
//   }

//   const handleNewRoom = (e) => {
//     e.preventDefault();
//     setNameError("");
//     setRoomIdError("");

//     if (!name.trim()) {
//       setNameError("Please enter your name to continue");
//       return;
//     }
    
//     if (isProcessing) return;
    
//     setActiveButton('create');
//     initializeSocket();
//   }

//   const handleJoinClick = (e) => {
//     e.preventDefault();
//     setNameError("");
//     setRoomIdError("");

//     if (!name.trim()) {
//       setNameError("Please enter your name to continue");
//       return;
//     }

//     if (isProcessing) return;

//     if (!showWorkspaceIdInput) {
//       setShowWorkspaceIdInput(true);
//       return;
//     }

//     if (roomId.length !== 6) {
//       setRoomIdError("Please enter a valid Workspace ID (6 digits)");
//       return;
//     }

//     setActiveButton('join');
//     initializeSocket();
//   }

//   useEffect(() => {
//     setRoomId(params.roomId || "");
//   }, [params.roomId]);

//   return (
//     <div className="absolute inset-0 flex items-center justify-center bg-[#2e2e2e] dark:bg-[#1f1f1f]">
//       <div className="bg-[#3d3d3d] dark:bg-[#3d3d3d] rounded-lg shadow-lg p-8 w-full max-w-md">
//         <h1 className="text-3xl font-bold text-center text-green-500 mb-8">Workspace</h1>

//         <form onSubmit={handleNewRoom}>
//           <div className="mb-6">
//             <input
//               type="text"
//               placeholder="Name"
//               value={name}
//               onChange={(e) => {
//                 setName(e.target.value);
//                 setNameError("");
//               }}
//               className={`w-full p-3 rounded-lg text-white bg-[#525252] focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
//                 nameError ? "border border-red-500" : "border border-transparent"
//               }`}
//               required
//             />
//             {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
//           </div>

//           {showWorkspaceIdInput && (
//             <div className="mb-6">
//               <input
//                 type="text"
//                 placeholder="Workspace ID (6 digits)"
//                 value={roomId}
//                 onChange={(e) => {
//                   setRoomId(e.target.value.replace(/\D/g, '').slice(0, 6));
//                   setRoomIdError("");
//                 }}
//                 className={`w-full p-3 rounded-lg text-white bg-[#525252] focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
//                   roomIdError ? "border border-red-500" : "border border-transparent"
//                 }`}
//                 required={showWorkspaceIdInput}
//               />
//               {roomIdError && <p className="text-red-500 text-sm mt-1">{roomIdError}</p>}
//             </div>
//           )}

//           <div className="space-y-4">
//             <button
//               type="button"
//               disabled={isProcessing || !name.trim()}
//               onClick={handleNewRoom}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {activeButton === 'create' && isProcessing && (
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//               )}
//               Create New Workspace
//             </button>

//             <button
//               type="button"
//               disabled={isProcessing || !name.trim() || (showWorkspaceIdInput && roomId.length !== 6)}
//               onClick={handleJoinClick}
//               className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {activeButton === 'join' && isProcessing && (
//                 <svg
//                   className="animate-spin h-5 w-5 text-white"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   ></circle>
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                   ></path>
//                 </svg>
//               )}
//               {showWorkspaceIdInput ? "Join Workspace" : "Enter Workspace ID"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CreateRoom;

























// import { useEffect, useState } from 'react';
// import { useRecoilState } from 'recoil';
// import { userAtom } from './atoms/userAtom';
// import { useNavigate, useParams } from 'react-router-dom';
// import { socketAtom } from './atoms/socketAtom';
// import { IP_ADDRESS } from '../../Globle.js';

// const CreateRoom = () => {
//     const [name, setName] = useState("");
//     const [roomId, setRoomId] = useState("");
//     const [showWorkspaceIdInput, setShowWorkspaceIdInput] = useState(false);
//     const parms = useParams();
//     const [user, setUser] = useRecoilState(userAtom);
//     const [socket, setSocket] = useRecoilState(socketAtom);

//     const [loading, setLoading] = useState(false);

//     const navigate = useNavigate();

//     const generateId = () => {
//         const id = Math.floor(Math.random() * 100000);
//         return id.toString();
//     }

//     const initializeSocket = () => {
//         setLoading(true);
//         let GeneratedId = "";
//         if (user.id == "") {
//             GeneratedId = generateId();
//             setUser({
//                 id: GeneratedId,
//                 name: name,
//                 roomId: ""
//             });
//         }

//         if (!socket || socket.readyState === WebSocket.CLOSED) {
//             const u = {
//                 id: user.id == "" ? GeneratedId : user.id,
//                 name: name
//             }
//             if(name == "") {
//                 alert("Please enter a name to continue");
//                 setLoading(false);
//                 return;
//             }
//             const ws = new WebSocket(`ws://${IP_ADDRESS}:5000?roomId=${roomId}&id=${u.id}&name=${u.name}`);
          
//             setSocket(ws);

//             ws.onopen = () => {
//                 console.log("Connected to WebSocket");
//             };

//             ws.onmessage = (event) => {
//                 const data = JSON.parse(event.data);
//                 if (data.type == "roomId") {
//                     setRoomId(data.roomId);
//                     console.log("Room ID : ", data.roomId);
//                     setUser({
//                         id: user.id == "" ? GeneratedId : user.id,
//                         name: name,
//                         roomId: data.roomId
//                     });
                   
//                     setLoading(false);
//                     alert(data.message);
//                     navigate("/code/" + data.roomId);
//                 }
//             };
//             ws.onclose = () => {
//                 console.log("WebSocket connection closed from register page");
//                 setLoading(false);
//             };
//         }
//         else {
//             setLoading(false);
//         }
//     }

//     const handleNewRoom = () => {
//         if (!loading)
//             initializeSocket();
//     }

//     const handleJoinRoom = () => {
//         if (roomId != "" && roomId.length == 6 && !loading) {
//             initializeSocket();
//         }
//         else {
//             alert("Please enter a room ID to join a room");
//         }
//     }

//     useEffect(() => {
//         setRoomId(parms.roomId || "");
//     }, []);

//     return (

//       <div className="absolute inset-0 flex items-center justify-center">
     
//         <div className="bg-[#3d3d3d] dark:bg-[#3d3d3d] rounded-lg shadow-lg p-6">
//           <h1 className="text-3xl font-bold text-center text-green-600 mb-6">Workspace</h1>
          
//           <input
//             type="text"
//             placeholder="Name"
//             value={name}
//             onChange={(e) => setName(e.target.value)}
//             className="w-full p-3 bg-[#525252] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
//           />

//           <input
//             type="text"
//             placeholder="Workspace ID (6 digits)"
//             value={roomId}
//             onChange={(e) => setRoomId(e.target.value.replace(/\D/g,'').slice(0,6))}
//             className="w-full p-3 bg-[#525252] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
//           />

//           <div className="space-y-4">
//             <button
//               disabled={loading || !name.trim()}
//               onClick={handleNewRoom}
//               className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
//             >
//               Create New Workspace
//             </button>
            
//             <button
//               disabled={loading || !name.trim() || roomId.length !== 6}
//               onClick={handleJoinRoom}
//               className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
//             >
//               Join Workspace
//             </button>
//           </div>
//         </div>
//       </div>
//     );
// };

// export default CreateRoom;





























// import React from 'react';

// export default function Home() {
//   return (
//     <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
//       <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Hello World</h1>
//       {/* Add more content here as needed */}
//     </div>
//   );
// }
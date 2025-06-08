
import React, { useState, useEffect,useCallback  } from "react"
import MonacoEditor from "@monaco-editor/react"
import { userAtom } from "./atoms/userAtom"
import { useRecoilState } from "recoil"
import { AiOutlineLoading3Quarters } from "react-icons/ai" 
import { socketAtom } from "./atoms/socketAtom"
import { useNavigate, useParams } from "react-router-dom"
import { connectedUsersAtom } from "./atoms/connectedUsersAtom"
import { IP_ADDRESS } from "../../Globle"
import { useSubmitCodeMutation } from '../../redux/slices/api/codeCollaborationApi.js';
import CodeCollaborationPage from "../../pages/CodeCollaborationPage.jsx"

const CodeEditor = () => {
   const [code, setCode] = useState("# Write your code here...");
  const [language, setLanguage] = useState("Python");
  const [output, setOutput] = useState([]); 
  const [socket, setSocket] = useRecoilState(socketAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [currentButtonState, setCurrentButtonState] = useState("Submit Code");
  const [input, setInput] = useState(""); 
  const [user, setUser] = useRecoilState(userAtom);
  const navigate = useNavigate();

  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersAtom);
  const parms = useParams();
  const [submitCode] = useSubmitCodeMutation();

 
const safeSend = useCallback((data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    try {
      socket.send(JSON.stringify(data));
    } catch (err) {
      console.error("Error sending WebSocket message:", err);
      
    }
  } else {
    console.warn("WebSocket not ready, queuing message:", data);
    
  }
}, [socket]);


useEffect(() => {
  if (socket) {
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.CLOSED) {
        console.log("WebSocket disconnected, attempting reconnect...");
      
         connectWebSocket();
      }
    }, 5000);
    return () => clearInterval(interval);
  }
}, [socket]);

useEffect(() => {
  if (socket) {
    const handleCodeChange = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "code" && data.senderId !== user.id) {
          setCode(data.code);
        }
      } catch (err) {
        console.error("Error handling code change:", err);
      }
    };

    socket.addEventListener("message", handleCodeChange);
    return () => {
      socket.removeEventListener("message", handleCodeChange);
    };
  }
}, [socket, user.id]);

useEffect(() => {
  if (socket) {
    const handleOutput = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "output") {
          setOutput(prev => [...prev, data.message]);
        }
      } catch (err) {
        console.error("Error handling output:", err);
      }
    };

    socket.addEventListener("message", handleOutput);
    return () => {
      socket.removeEventListener("message", handleOutput);
    };
  }
}, [socket]);

useEffect(() => {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;

  const onMessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log("Received message:", data); 
      
      switch (data.type) {
         case "roomState":  
          setCode(data.code || "");
          setLanguage(data.language || "Python");
          setInput(data.input || "");
          setConnectedUsers(data.users || []);
          setOutput(data.history?.filter(item => item.type === "output")?.map(item => item.message) || []);
          break;
        case "users":
          setConnectedUsers(data.users);
          break;
        case "code":
          if (code !== data.code) {
            setCode(data.code);
          }
          break;
        case "userJoined":
         
          if (data.userId !== user.id) {
            safeSend({
              type: "allData",
              code,
              language,
              input,
              users: connectedUsers,
              output,
              roomId: user.roomId
            });
          }
          break;
        case "language":
          setLanguage(data.language);
          break;
        case "input":
          setInput(data.input);
          break;
        case "output":
          setOutput(prev => [...prev, data.message]);
          handleButtonStatus("Submit Code", false);
          break;
        case "allData":
          if (data.code !== undefined && data.code !== null) setCode(data.code);
          if (data.input !== undefined && data.input !== null) setInput(data.input);
          if (data.language !== undefined && data.language !== null) setLanguage(data.language);
          if (data.users !== undefined && data.users !== null) setConnectedUsers(data.users);
          if (data.output !== undefined && data.output !== null) {
            setOutput(Array.isArray(data.output) ? data.output : [data.output]);
          }
          break;
      }
    } catch (err) {
      console.error("Socket message error:", err);
    }
  };

  socket.addEventListener("message", onMessage);
  
  if (socket.readyState === WebSocket.OPEN) {
    console.log("Requesting initial data..."); 
    socket.send(JSON.stringify({
      type: "requestForAllData",
      userId: user.id,
      roomId: user.roomId
    }));
  }

  return () => {
    socket.removeEventListener("message", onMessage);
  };
}, [socket, user.id, user.roomId]);

  const handleSubmit = async () => {
    handleButtonStatus("Compiling...", true)
    const submission = {
      code,
      language,
      roomId: user.roomId,
      input
    }

     try {
      const response = await submitCode(submission).unwrap(); 
      console.log("Code submission response:", response);
      
      
    safeSend({
      type: "output",
      message: response.output || "Execution completed.",
      roomId: user.roomId
    });

   
    setOutput(prev => [...prev, response.output || "Execution completed."]);
    } catch (err) {
      console.error("Code submission error:", err);

    safeSend({
      type: "output",
      message: "Error submitting code. Please try again.",
      roomId: user.roomId
    });

    setOutput(prev => [...prev, "Error submitting code. Please try again."]);
    }finally {
    handleButtonStatus("Submit Code", false);
    }
   
  }

  const handleInputChange = e => {
    setInput(e.target.value)
    socket?.send(
      JSON.stringify({
        type: "input",
        input: e.target.value,
        roomId: user.roomId
      })
    )
  }

  const handleLanguageChange = value => {
    setLanguage(value)
    socket?.send(
      JSON.stringify({
        type: "language",
        language: value,
        roomId: user.roomId
      })
    )
  }

  const handleButtonStatus = (value, isLoading) => {
    setCurrentButtonState(value)
    setIsLoading(isLoading)
    socket?.send(
      JSON.stringify({
        type: "submitBtnStatus",
        value: value,
        isLoading: isLoading,
        roomId: user.roomId
      })
    )
  }

  const handleEditorDidMount = (editor, monaco) => {
    console.log("editor", editor)
    console.log("monaco", monaco)

    if (editor) {
     
      editor.onDidChangeModelContent(event => {
        console.log("Code Updated:", editor.getValue())
        setCode(editor.getValue())
        socket?.send(
          JSON.stringify({
            type: "code",
            code: editor.getValue(),
            roomId: user.roomId,
            senderId: user.id
          })
        )
      })

    }
  }

  return (
<>
    <div className="mt-14 bg-[#2e2e2e] dark:bg-[#1b1b1b] z-10 rounded-lg">
     <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
          
          <div className="w-full lg:w-3/4">
            <div className="flex justify-end mb-4 lg:px-3">
             
              <div className="flex gap-3 ">
              
                <div className="flex justify-center">
                  <button
                    onClick={handleSubmit}
                    className={`bg-gradient-to-r bg-green-600 hover:bg-green-700 text-white px-3 lg:px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 transform ${
                      isLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={isLoading}
                  >
                    <span className="flex items-center space-x-2">
                      {isLoading && (
                        <AiOutlineLoading3Quarters className="animate-spin" />
                      )}
                      <span>{currentButtonState}</span>
                    </span>
                  </button>
                </div>
               
                <select
                  value={language}
                  onChange={e => handleLanguageChange(e.target.value)}
                  className="bg-[#2e2e2e] h-10 text-white px-3 lg:px-4 py-2 rounded-lg focus:outline-none shadow-lg transition duration-300"
                >
                  {/* <option value="javascript">JavaScript</option> */}
                  <option value="python">Python</option>
                 
                </select>
              </div>
            </div>
            <div className="border border-gray-700 rounded-lg overflow-hidden shadow-lg">
              <MonacoEditor
                value={code}
                language={language}
                theme="vs-dark"
                className="lg:h-[83vh] h-[60vh]"
                onMount={handleEditorDidMount}
              />
            </div>
          </div>
          <div className="w-full lg:w-1/4 flex flex-col space-y-4">
           
            <div className="flex flex-col lg:flex-row justify-between space-y-4 lg:space-y-0 lg:space-x-4">
             
              <div className="w-full lg:w-full">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">
                  Users:
                </h2>
                <div className="bg-[#2e2e2e] text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
                  {connectedUsers.length > 0 ? (
                    connectedUsers.map((user, index) => (
                      <div key={index} className="flex items-center space-x-2 mt-2">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <pre className="whitespace-pre-wrap text-sm lg:text-base">
                          {user.name}
                        </pre>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500">No user connected yet.</p>
                  )}
                </div>
              </div>
       
            </div>
            
              <div className="w-full lg:w-full">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">
                  Invitation Code:
                </h2>
                <div className="bg-[#2e2e2e] text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
                  {user.roomId.length > 0 ? (
                    <pre className="whitespace-pre-wrap text-sm lg:text-base">
                      {user.roomId}
                    </pre>
                  ) : (
                    <p className="text-gray-500">No invitation code yet.</p>
                  )}
                </div>
              </div>
           
            <div className="flex-1 pb-8">
              <div className="flex justify-between px-2">
                <h2 className="text-lg lg:text-xl font-bold text-gray-400">
                  Output:
                </h2>
                <button
                  onClick={() => setOutput([])}
                  className="text-red-500 hover:text-red-600"
                >
                  Clear
                </button>
              </div>

              <div className="bg-[#2e2e2e] text-green-400 p-4 max-h-[60vh] rounded-lg mt-2 h-full overflow-y-auto shadow-lg space-y-2 text-sm lg:text-base">
                {output.length > 0 ? (
                  output.map((line, index) => (
                    <pre key={index} className="whitespace-pre-wrap">
                      {line}
                    </pre>
                  ))
                ) : (
                  <p className="text-gray-500">
                    No output yet. Run your code to see results.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</>

  )
}
export default CodeEditor

import React, { useState, useEffect } from "react"
import MonacoEditor from "@monaco-editor/react"
import { userAtom } from "./atoms/userAtom"
import { useRecoilState } from "recoil"
import { AiOutlineLoading3Quarters } from "react-icons/ai" 
import { socketAtom } from "./atoms/socketAtom"
import { useNavigate, useParams } from "react-router-dom"
import { connectedUsersAtom } from "./atoms/connectedUsersAtom"
import { IP_ADDRESS } from "../../Globle"

const CodeEditor = () => {
  const [code, setCode] = useState("// Write your code here...")
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState([]) 
  const [socket, setSocket] = useRecoilState(socketAtom)
  const [isLoading, setIsLoading] = useState(false) 
  const [currentButtonState, setCurrentButtonState] = useState("Run")
  const [input, setInput] = useState("") 
  const [user, setUser] = useRecoilState(userAtom)
  const navigate = useNavigate()

  const [connectedUsers, setConnectedUsers] = useRecoilState(connectedUsersAtom)
  const parms = useParams()

  const handleSubmit = async () => {
    handleButtonStatus("Compiling...", true)
    const submission = {
      code,
      language,
      roomId: user.roomId,
      input
    }

    socket?.send(user?.id ? user.id : "")

    const res = await fetch(`http://${IP_ADDRESS}:3000/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(submission)
    })

    handleButtonStatus("Compiling...", true)

    if (!res.ok) {
      setOutput(prevOutput => [
        ...prevOutput,
        "Error submitting code. Please try again."
      ])
      handleButtonStatus("Submit Code", false)
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
            roomId: user.roomId
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
                  <option value="javascript">JavaScript</option>
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
                <div className="bg-[#1f1f1f] text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
                  {connectedUsers.length > 0 ? (
                    connectedUsers.map((user, index) => (
                      <div key={index} className="flex items-center space-x-2">
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
                <div className="bg-[#1f1f1f] text-green-400 p-4 rounded-lg mt-2 overflow-y-auto shadow-lg max-h-40 lg:max-h-60">
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

              <div className="bg-[#1f1f1f] text-green-400 p-4 max-h-[60vh] rounded-lg mt-2 h-full overflow-y-auto shadow-lg space-y-2 text-sm lg:text-base">
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

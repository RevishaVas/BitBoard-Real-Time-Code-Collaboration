import React, { useEffect, useState }  from 'react'
import CreateRoom from '../components/codeCollaboration/CreateRoom'
import CodeEditor from '../components/codeCollaboration/CodeEditor'
export default function CodeCollaborationPage() {

  const [roomCreated, setRoomCreated] = useState(false)
  const [roomId, setRoomId] = useState(null)

  const handleRoomCreated = (id) => {
    setRoomId(id)
    setRoomCreated(true)
  }

  return (
   <div>
      {roomCreated ? (
        <CodeEditor roomId={roomId} />
      ) : (
        <CreateRoom onRoomCreated={handleRoomCreated} />
      )}
    </div>
  )
}

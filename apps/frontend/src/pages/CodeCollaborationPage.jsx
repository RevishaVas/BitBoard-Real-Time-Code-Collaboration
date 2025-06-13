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
        <div className='flex flex-col p-2 overflow-hidden'>
            <CodeEditor roomId={roomId} />
        </div>
        
      ) : (
        <CreateRoom onRoomCreated={handleRoomCreated} />
      )}
    </div>
  )
}

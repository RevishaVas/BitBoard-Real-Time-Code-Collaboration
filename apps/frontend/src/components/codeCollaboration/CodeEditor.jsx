import React from 'react'

export default function CodeEditor({ roomId }) {
  return (
    <div className="h-full mt-14">
      <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 h-full">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Code Editor - Workspace: {roomId}
        </h1>
        {/* Add your actual code editor implementation here */}
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded">
          This is where the collaborative code editor will be implemented
        </div>
      </div>
    </div>
  )
}
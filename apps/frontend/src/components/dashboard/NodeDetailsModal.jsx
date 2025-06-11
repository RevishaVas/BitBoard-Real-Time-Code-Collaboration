import React from "react";

export default function NodeDetailsModal({ node, onClose }) {
  if (!node) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-900 p-6 rounded shadow-lg w-[90%] max-w-md">
        <h2 className="text-xl font-semibold mb-4">Node Details</h2>
        <div className="space-y-2 text-sm">
          <p><strong>ID:</strong> {node.id}</p>
          <p><strong>Label:</strong> {node.label}</p>
          {node.name && <p><strong>Name:</strong> {node.name}</p>}
          {node.title && <p><strong>Title:</strong> {node.title}</p>}
          {node.role && <p><strong>Role:</strong> {node.role}</p>}
        </div>
        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-1 bg-blue-600 text-white rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

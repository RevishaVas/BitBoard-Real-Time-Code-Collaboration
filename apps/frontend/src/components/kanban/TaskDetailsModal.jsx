import React, { useState } from 'react';

export default function TaskDetailsModal({ task, onClose, onDelete }) {
  const [showConfirm, setShowConfirm] = useState(false);

  if (!task) return null;

  const getImageSrc = () => {
    if (task.attachment?.data && task.attachment?.contentType?.startsWith("image")) {
      return `data:${task.attachment.contentType};base64,${task.attachment.data}`;
    }
    return null;
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, { method: 'DELETE' });
      if (response.ok) {
        onDelete(task._id);
        onClose();
      } else {
        const errData = await response.json();
        alert("Failed to delete: " + errData.error);
      }
    } catch (error) {
      alert("Error deleting task: " + error.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-6 rounded-2xl shadow-xl w-full max-w-md relative">
          <h2 className="text-xl font-bold mb-4">Task Details</h2>
          <div className="space-y-2">
            <p><strong>Title:</strong> {task.title}</p>
            <p><strong>Description:</strong> {task.description || '—'}</p>
            <p><strong>Assignee:</strong> {task.assignee?.name || '—'}</p>
            <p><strong>Status:</strong> {task.status || '—'}</p>
            <p><strong>Deadline:</strong> {task.deadline ? new Date(task.deadline).toLocaleDateString() : '—'}</p>
            <p><strong>Task created at:</strong> {task.createdAt ? new Date(task.createdAt).toLocaleString() : '—'}</p>
            {task.attachment ? (
              getImageSrc() ? (
                <div>
                  <strong>Attachment:</strong>
                  <img
                    src={getImageSrc()}
                    alt="attachment"
                    className="mt-2 rounded border max-h-48 object-contain"
                  />
                </div>
              ) : (
                <div>
                  <strong>Attachment:</strong>
                  <p className="text-sm italic text-gray-500">(Attached file is not an image)</p>
                </div>
              )
            ) : null}
          </div>

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setShowConfirm(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-md"
            >
              Delete Task
            </button>
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Are you sure?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">This action will permanently delete the task.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

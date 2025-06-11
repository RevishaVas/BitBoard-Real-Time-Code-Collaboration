import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import kanbanSocket from '../../sockets/socket';
import CommentSection from '../comment/CommentSection';

export default function TaskDetailsModal({ task, onClose, onDelete }) {
  if (!task) return null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedTask, setEditedTask] = useState({ ...task });

  const currentUser = useSelector((state) => state.auth.user);
  const isManager = currentUser?.role === 'manager';

  useEffect(() => {
    const handleSocketUpdate = (updatedTask) => {
      if (updatedTask._id === task._id) {

        setEditedTask(updatedTask);
      }
    };

    kanbanSocket.on('taskUpdated', handleSocketUpdate);
    return () => {
      kanbanSocket.off('taskUpdated', handleSocketUpdate);
    };
  }, [task?._id]);

  const getImageSrc = () => {
    if (
      editedTask.attachment?.data &&
      editedTask.attachment?.contentType?.startsWith("image")
    ) {
      return `data:${editedTask.attachment.contentType};base64,${editedTask.attachment.data}`;
    }
    return null;
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'DELETE',
      });
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

  const handleUpdate = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
          assignee: editedTask.assignee?._id || task.assignee?._id,
          deadline: editedTask.deadline || task.deadline,
        }),
      });

      if (!response.ok) {
        let errText = "Unknown error";
        try {
          const err = await response.json();
          errText = err.error || JSON.stringify(err);
        } catch {}
        alert("Failed to update: " + errText);
        return;
      }

      setEditMode(false);
    } catch (error) {
      alert("Error updating task: " + error.message);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-[#1e1e1e] text-white p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

          {/* Title + Close button */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Task Details</h2>
            <button
              onClick={onClose}
              title="Close"
              className="text-gray-300 hover:text-red-500 text-2xl font-bold"
            >
              &times;
            </button>
          </div>

          <div className="space-y-4">
            <p>
              <strong>Title:</strong>{' '}
              {editMode ? (
                <input
                  type="text"
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                  className="w-full p-2 rounded border bg-[#2e2e2e] text-white"
                />
              ) : (
                editedTask.title
              )}
            </p>

            <p>
              <strong>Description:</strong>{' '}
              {editMode ? (
                <textarea
                  value={editedTask.description}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, description: e.target.value })
                  }
                  className="w-full p-2 rounded border bg-[#2e2e2e] text-white"
                />
              ) : (
                editedTask.description || '—'
              )}
            </p>

            <p><strong>Assignee:</strong> {editedTask.assignee?.name || '—'}</p>

            <p>
              <strong>Status:</strong>{' '}
              {editMode ? (
                <select
                  value={editedTask.status}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, status: e.target.value })
                  }
                  className="w-full p-2 rounded border bg-[#2e2e2e] text-white"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              ) : (
                editedTask.status || '—'
              )}
            </p>

            <p><strong>Deadline:</strong> {editedTask.deadline ? new Date(editedTask.deadline).toLocaleDateString() : '—'}</p>
            <p><strong>Task created at:</strong> {editedTask.createdAt ? new Date(editedTask.createdAt).toLocaleString() : '—'}</p>

            {editedTask.attachment && (
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
                  <p className="text-sm italic text-gray-400">(Attached file is not an image)</p>
                </div>
              )
            )}

            <hr className="my-4 border-gray-600" />
            <h3 className="font-semibold mb-2">Comments</h3>
            <CommentSection taskId={task._id} />
          </div>

          <div className="mt-6 flex justify-between flex-wrap gap-2">
            {isManager && !editMode && (

              <button
                onClick={() => setEditMode(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow-md"
              >
                Edit Task
              </button>
            )}

            {isManager && editMode && (
              <button
                onClick={handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-md"
              >
                Save Changes
              </button>
            )}

            {isManager && (
              <button
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow-md"
              >
                Delete Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#2e2e2e] p-6 rounded-2xl shadow-xl text-center max-w-sm w-full text-white">
            <h3 className="text-lg font-semibold mb-4">Are you sure?</h3>
            <p className="text-gray-300 mb-6">This action will permanently delete the task.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
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

import React, { useState, useEffect } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import TaskDetailsModal from "../components/kanban/TaskDetailsModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import socket from '../sockets/socket';

export default function KanbanPage() {
  const [columns, setColumns] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New modal states for adding column
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [columnsRes, tasksRes] = await Promise.all([
          fetch("/api/columns"),
          fetch("/api/tasks"),
        ]);

        const columnsData = await columnsRes.json();
        const tasksData = await tasksRes.json();

        const formattedColumns = columnsData.map(col => {
          const matchedTasks = tasksData.filter(task =>
            task.status?.toLowerCase() === col.name.toLowerCase()
          );

          return {
            id: col._id,
            title: col.name,
            tasks: matchedTasks
          };
        });

        setColumns(formattedColumns);
      } catch (err) {
        console.error("Failed to fetch columns or tasks:", err);
      }
    };

    fetchData();
  }, []);

  // Socket listeners
  useEffect(() => {
    socket.on('taskCreated', (newTask) => {
      setColumns((prev) =>
        prev.map((col) =>
          col.title.toLowerCase() === newTask.status?.toLowerCase()
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      );
    });

    socket.on('taskUpdated', (updatedTask) => {
      setColumns((prev) =>
        prev.map((col) => {
          const filteredTasks = col.tasks.filter(task => task._id !== updatedTask._id);
          if (col.title.toLowerCase() === updatedTask.status?.toLowerCase()) {
            return { ...col, tasks: [...filteredTasks, updatedTask] };
          }
          return { ...col, tasks: filteredTasks };
        })
      );
    });

    socket.on('taskDeleted', ({ id }) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task._id !== id),
        }))
      );
    });

    return () => {
      socket.off('taskCreated');
      socket.off('taskUpdated');
      socket.off('taskDeleted');
    };
  }, []);

  const addColumn = async () => {
    if (!newColumnName.trim()) return;

    try {
      const response = await fetch("/api/columns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newColumnName }),
      });

      const newColumn = await response.json();
      setColumns(prev => [...prev, { id: newColumn._id, title: newColumn.name, tasks: [] }]);
      setNewColumnName('');
      setShowAddColumnModal(false);
    } catch (error) {
      console.error("Error creating column:", error);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColIndex = columns.findIndex(c => c.id === source.droppableId);
    const destColIndex = columns.findIndex(c => c.id === destination.droppableId);
    const movedTask = columns[sourceColIndex].tasks[source.index];

    fetch(`/api/tasks/${movedTask._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: columns[destColIndex].title }),
    }).catch((err) => {
      console.error("Drag status update failed", err);
    });
  };

  return (
    <div className="p-6 min-h-screen bg-[#f5f5f5] dark:bg-[#1b1b1b] text-black dark:text-white transition-colors duration-300">
      <h1 className="text-3xl font-bold mb-6">Board</h1>

      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowCreateModal(true)}>Create Task</Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-black p-4 min-w-[250px] rounded-2xl shadow flex-shrink-0"
                >
                  <h2 className="text-xl font-semibold capitalize mb-3 text-white">
                    {col.title}
                  </h2>
                  <div className="space-y-3">
                    {col.tasks.map((task, index) => (
                      <Draggable
                        key={task._id}
                        draggableId={task._id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card className="bg-gray-100 dark:bg-gray-800">
                              <CardContent className="p-3">
                                <div className="font-medium">{task.title}</div>
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setSelectedTask(task)}
                                  >
                                    Task Details
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}

          {/* Add Column Button */}
          <div className="flex items-center justify-center min-w-[250px]">
            <button
              onClick={() => setShowAddColumnModal(true)}
              className="w-10 h-10 text-3xl font-bold text-white bg-gray-600 hover:bg-gray-700 rounded-full"
              title="Add column"
            >
              +
            </button>
          </div>
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onDelete={(deletedId) =>
            setColumns((prev) =>
              prev.map((col) => ({
                ...col,
                tasks: col.tasks.filter((task) => task._id !== deletedId),
              }))
            )
          }
        />
      )}

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl text-center max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Column</h3>
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="Column name"
              className="w-full px-4 py-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
            />
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={() => setShowAddColumnModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={addColumn}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

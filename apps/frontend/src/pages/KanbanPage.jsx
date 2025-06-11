import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import CreateTaskModal from "../components/kanban/CreateTaskModal";
import TaskDetailsModal from "../components/kanban/TaskDetailsModal";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import kanbanSocket from '../sockets/socket';

export default function KanbanPage() {
  const currentUser = useSelector((state) => state.auth.user);

  const [columns, setColumns] = useState([]);
  const [viewMode, setViewMode] = useState("manager");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [columnsRes, tasksRes] = await Promise.all([
          fetch("http://localhost:5000/api/columns"),
          fetch(
            viewMode === "manager"
              ? "http://localhost:5000/api/tasks"
              : `http://localhost:5000/api/tasks/user/${currentUser._id}`
          ),
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
            tasks: matchedTasks,
          };
        });

        setColumns(formattedColumns);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    if (currentUser) fetchData();
  }, [viewMode, currentUser]);

  useEffect(() => {
    kanbanSocket.on('taskCreated', (newTask) => {
      if (viewMode === "member" && newTask.assignee !== currentUser._id) return;

      setColumns((prev) =>
        prev.map((col) =>
          col.title.toLowerCase() === newTask.status?.toLowerCase()
            ? { ...col, tasks: [...col.tasks, newTask] }
            : col
        )
      );
    });

    kanbanSocket.on('taskUpdated', (updatedTask) => {
      if (viewMode === "member" && updatedTask.assignee !== currentUser._id) return;

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

    kanbanSocket.on('taskDeleted', ({ id }) => {
      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task._id !== id),
        }))
      );
    });

    return () => {
      kanbanSocket.off('taskCreated');
      kanbanSocket.off('taskUpdated');
      kanbanSocket.off('taskDeleted');
    };
  }, [viewMode, currentUser]);

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColIndex = columns.findIndex(c => c.id === source.droppableId);
    const destColIndex = columns.findIndex(c => c.id === destination.droppableId);
    const movedTask = columns[sourceColIndex].tasks[source.index];

    fetch(`http://localhost:5000/api/tasks/${movedTask._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: columns[destColIndex].title }),
    }).catch((err) => console.error("Drag status update failed", err));
  };

  return (
    <div className="mt-14 p-6 min-h-screen bg-[#1e1e1e] text-white">
      <h1 className="text-3xl font-bold mb-6">Board</h1>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setViewMode("manager")}
          className={`px-4 py-2 rounded font-semibold ${viewMode === "manager" ? "bg-white text-black" : "bg-gray-700"}`}
        >
          Manager View
        </button>
        <button
          onClick={() => setViewMode("member")}
          className={`px-4 py-2 rounded font-semibold ${viewMode === "member" ? "bg-white text-black" : "bg-gray-700"}`}
        >
          My Tasks
        </button>

        {currentUser?.role === 'manager' && (
          <Button onClick={() => setShowCreateModal(true)}>Create Task</Button>
        )}
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((col) => (
            <Droppable droppableId={col.id} key={col.id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-[#2e2e2e] p-4 min-w-[250px] rounded-2xl shadow flex-shrink-0"
                >
                  <h2 className="text-xl font-semibold capitalize mb-3">{col.title}</h2>
                  <div className="space-y-3">
                    {col.tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                            <Card className="bg-gray-100 dark:bg-[#3f3f3f]">
                              <CardContent className="p-3">
                                <div className="font-medium">{task.title}</div>
                                <div className="text-sm text-gray-400">
                                  Assigned to: {task.assignee?.name || 'N/A'}
                                </div>
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
        </div>
      </DragDropContext>

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
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
    </div>
  );
}

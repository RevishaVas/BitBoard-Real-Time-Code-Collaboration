import React from "react";

export default function FiltersPanel({ filter, setFilter }) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <div className="flex items-center gap-2">
       <label className="text-sm text-gray-700 dark:text-gray-300">
  Filter by Node Type:
</label>
        <select
          className="p-1 border rounded"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>User</option>
          <option>Task</option>
          <option>Status</option>
          <option>Room</option>
          <option>Comment</option>
          <option>Message</option>
          <option>Notification</option>
          <option>Project</option>
        </select>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";

export default function BlockedTasksTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7001/api/status/top-blocked-tasks")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load blocked tasks", err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-2xl shadow-md text-white w-full">
      <h2 className="text-xl font-semibold mb-2">Top Blocked Tasks</h2>
      <p className="text-sm text-gray-400 mb-2">
  These tasks are blocking progress of others. Prioritize unblocking them early in the sprint.
</p>
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="text-gray-400 border-b border-gray-700">
            <th className="py-2">Task Title</th>
            <th className="py-2"># of Dependent Tasks</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-gray-700">
              <td className="py-2">{row.task}</td>
              <td className="py-2 text-center">{row.dependentCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TaskTimelineChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7001/api/status/tasks-by-date")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load timeline data", err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-2xl shadow-md text-white w-full">
      <h2 className="text-xl font-semibold mb-2">Task Creation Timeline</h2>
      <p className="text-sm text-gray-400 mb-2">
  Notice the spike in task creation around June 1–4, indicating peak sprint planning.
</p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="taskCount" stroke="#4D96FF" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

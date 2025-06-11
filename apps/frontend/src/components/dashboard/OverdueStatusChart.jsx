import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#A66DD4", "#FF9F1C"];

export default function OverdueStatusChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7001/api/status/overdue-by-status")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Failed to load overdue status data", err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-2xl shadow-md text-white w-full">
      <h2 className="text-xl font-semibold mb-2">Overdue Tasks by Status</h2>
      <p className="text-sm text-gray-400 mb-2">
  Most overdue tasks are stuck "In Progress". This may signal a bottleneck in that stage.
</p>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="overdueCount"
            nameKey="status"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

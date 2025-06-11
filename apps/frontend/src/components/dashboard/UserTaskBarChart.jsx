import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

const UserTaskBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:7001/api/status/tasks-per-user")
      .then((res) => res.json())
    .then((json) => {
      console.log("📊 User Task Data:", json);  // <--- Add this
      setData(json);
    })

      .catch((err) => console.error("Failed to load chart data", err));
  }, []);

  return (
    <div className="p-4 bg-gray-800 rounded-2xl shadow-md text-white w-full">
      <h2 className="text-xl font-semibold mb-2">Task Load per User</h2>
      <p className="text-sm text-gray-400 mb-2">
  Revisha Vas has the highest number of tasks (9). Consider balancing workload across team.
</p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="user" type="category" />
          <Tooltip />
          <Bar dataKey="taskCount" fill="#8884d8">
            <LabelList dataKey="taskCount" position="right" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UserTaskBarChart;

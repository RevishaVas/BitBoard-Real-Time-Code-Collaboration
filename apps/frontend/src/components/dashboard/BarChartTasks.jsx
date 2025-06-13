import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function BarChartTasks() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/status/tasksByStatus")
      .then(res => res.json())
      .then(setData)
      .catch(() => setData([]));
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Tasks by Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="status" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#38bdf8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

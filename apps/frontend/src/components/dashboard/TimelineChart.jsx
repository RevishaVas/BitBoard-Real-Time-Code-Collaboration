import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TimelineChart() {
  const [data, setData] = useState([]);

 useEffect(() => {
  fetch("http://localhost:7001/api/status/tasks-by-date")
    .then((res) => res.json())
    .then((json) => {
      console.log("📅 Timeline data:", json); 
      setData(json);
    })
    .catch((err) => console.error("Failed to load timeline data", err));
}, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Task Timeline</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#4ade80" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

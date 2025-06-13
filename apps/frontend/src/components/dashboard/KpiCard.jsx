import React from "react";

export default function KpiCard({ title, value, icon }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex items-center gap-4">
      {icon && <div className="text-2xl">{icon}</div>}
      <div>
        <h3 className="text-sm text-gray-500 dark:text-gray-400">{title}</h3>
        <p className="text-xl font-semibold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
}

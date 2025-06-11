import { useEffect, useState } from "react";
import KpiCard from "../components/dashboard/KpiCard";
import FiltersPanel from "../components/dashboard/FiltersPanel";
import BarChartTasks from "../components/dashboard/BarChartTasks";
import TimelineChart from "../components/dashboard/TimelineChart";
import VisualizationPage from "../components/graph/VisualizationPage";
import UserTaskBarChart from "../components/dashboard/UserTaskBarChart";
import BlockedTasksTable from "../components/dashboard/BlockedTasksTable";
import OverdueStatusChart from "../components/dashboard/OverdueStatusChart";
import TaskTimelineChart from "../components/dashboard/TaskTimelineChart";

const BASE_URL = "http://localhost:7001";
export default function VisualizationDashboard() {
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    nextMilestone: "N/A",
    currentMilestone: "N/A"

  });

   useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [total, completed, overdue, nextMilestone, currentMilestone] = await Promise.all([
          fetch(`${BASE_URL}/api/status/totalTasks`).then(res => res.json()),
          fetch(`${BASE_URL}/api/status/completedTasks`).then(res => res.json()),
          fetch(`${BASE_URL}/api/status/overdueTasks`).then(res => res.json()),
          fetch(`${BASE_URL}/api/status/nextMilestone`).then(res => res.json()),
          fetch(`${BASE_URL}/api/status/currentMilestone`).then(res => res.json()),
        ]);

        console.log("📊 Stats fetched:", total, completed, overdue, nextMilestone, currentMilestone); // ✅ ✅ ✅ here

        setStats({
          totalTasks: total.total || 0,
          completedTasks: completed.completed || 0,
          overdueTasks: overdue.overdue || 0,
          nextMilestone: nextMilestone.title || "None",
          currentMilestone: currentMilestone.title || "None"
        });
      } catch {
        setStats({
          totalTasks: 0,
          completedTasks: 0,
          overdueTasks: 0,
          nextMilestone: "Unavailable",
          currentMilestone: "Unavailable"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  


  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-20 space-y-10 max-w-screen-2xl mx-auto">
      {loading ? (
        <p className="text-center text-gray-400 text-lg">Loading stats...</p>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <KpiCard title="Total Tasks" value={stats.totalTasks} icon="🗂️" />
            <KpiCard title="Completed" value={stats.completedTasks} icon="✅" />
            <KpiCard title="Overdue" value={stats.overdueTasks} icon="⚠️" />
            <KpiCard title="Current Milestone" value={stats.currentMilestone} icon="📍" /> 
            <KpiCard title="Next Milestone" value={stats.nextMilestone} icon="📅" />
             
          </div>

          {/* Filters */}
          <FiltersPanel filter={filter} setFilter={setFilter} />

          {/* Graph View */}
          <VisualizationPage filter={filter} />

          {/* Story Insight Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UserTaskBarChart />
             <BlockedTasksTable />
              <OverdueStatusChart />
              <TaskTimelineChart />
            {/* Later you can add more here like: <BlockedTasksTable /> */}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           
          </div>
        </>
      )}
    </div>
  );
}

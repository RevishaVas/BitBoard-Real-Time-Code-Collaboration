import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import ForceGraph2D from "react-force-graph-2d";

const getNodeColor = (label) => {
  switch (label) {
    case "User": return "#1f77b4";
    case "Task": return "#ff7f0e";
    case "Status": return "#2ca02c";
    case "Room": return "#d62728";
    case "Comment": return "#9467bd";
    case "Message": return "#c7c7c7";
    case "Notification": return "#faff00";
    case "Project": return "#9999ff";
    default: return "#7f7f7f";
  }
};

const getNodeSize = (label) => {
  switch (label) {
    case "User": return 12;
    case "Task": return 8;
    case "Status": return 6;
    default: return 5;
  }
};

export default function VisualizationPage({filter}) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [highlightedNodes, setHighlightedNodes] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const graphRef = useRef();

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:7001/api/status/graph");
      const formatted = {
        nodes: res.data.nodes.map(n => ({ ...n, id: String(n.id) })),
        links: res.data.links.map(l => ({ ...l, source: String(l.source), target: String(l.target) }))
      };
      setGraphData(formatted);
    } catch (err) {
      setError("Failed to load graph.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = useCallback((node) => {
    setSelectedNode(node);
    const neighbors = new Set();
    graphData.links.forEach(link => {
      if (link.source === node.id) neighbors.add(link.target);
      if (link.target === node.id) neighbors.add(link.source);
    });
    setHighlightedNodes(neighbors);
  }, [graphData]);

  const handleExport = () => {
    const canvas = document.querySelector("canvas");
    const link = document.createElement("a");
    link.download = "bitboard-graph.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const filteredGraph = useMemo(() => ({
    nodes: graphData.nodes.filter(n => filter === "All" || n.label === filter),
    links: graphData.links.filter(l =>
      graphData.nodes.find(n => n.id === l.source) &&
      graphData.nodes.find(n => n.id === l.target)
    )
  }), [graphData, filter]);

  return (
    <div className="flex flex-col p-4 gap-4 pt-16">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">BitBoard Graph View</h1>
        <div className="flex items-center gap-2">
          <label className="font-medium">Filter:</label>
          <select
            className="p-1 rounded border"
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
          <button onClick={handleExport} className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">
            Export PNG
          </button>
          <button onClick={() => { setSelectedNode(null); setHighlightedNodes(new Set()); }} className="ml-2 px-3 py-1 border rounded">
            Clear Selection
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading graph...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-3/4 bg-white dark:bg-gray-800 p-4 rounded shadow relative">
            <ForceGraph2D
              ref={graphRef}
              graphData={filteredGraph}
              nodeRelSize={6}
              cooldownTicks={50}
            
              enableNodeDrag={true}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const color = getNodeColor(node.label);
                const size = getNodeSize(node.label);
                ctx.beginPath();
                ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();
                if (highlightedNodes.has(node.id)) {
                  ctx.strokeStyle = "yellow";
                  ctx.lineWidth = 2;
                  ctx.stroke();
                }
                const text = node.name || node.title || node.label;
                ctx.fillStyle = "white";
                ctx.font = `${10 / globalScale}px Sans-Serif`;
                ctx.textAlign = "center";
                ctx.fillText(text, node.x, node.y + 3);
              }}
              linkDirectionalArrowLength={6}
              linkDirectionalArrowRelPos={1}
              linkWidth={1}
              linkColor={(link) => link.type === "DEPENDS_ON" ? "#d62728" : "#aaa"}
              linkCanvasObjectMode={() => "after"}
              linkCanvasObject={(link, ctx, globalScale) => {
                const label = link.type;
                if (!label) return;
                const start = link.source;
                const end = link.target;
                if (typeof start !== "object" || typeof end !== "object") return;
                const midX = (start.x + end.x) / 2;
                const midY = (start.y + end.y) / 2;

                ctx.save();
                ctx.translate(midX, midY);
                ctx.rotate(Math.atan2(end.y - start.y, end.x - start.x));
                ctx.textAlign = "center";
                ctx.font = `${12 / globalScale}px Sans-Serif`;
                ctx.fillStyle = "#ffffff";
                ctx.strokeStyle = "#000000";
                ctx.lineWidth = 2;
                ctx.strokeText(label, 0, -4);
                ctx.fillText(label, 0, -4);
                ctx.restore();
              }}
              onNodeClick={handleNodeClick}
            />
            <div className="absolute top-4 right-4 bg-white dark:bg-gray-700 text-sm p-3 rounded shadow border space-y-1">
              {["User", "Task", "Status", "Room", "Comment", "Message", "Notification", "Project"].map(label => (
                <div key={label}>
                  <span className="inline-block w-3 h-3 mr-1 rounded-full" style={{ backgroundColor: getNodeColor(label) }}></span>
                  {label}
                </div>
              ))}
            </div>
          </div>
          <div className="md:w-1/4 bg-white dark:bg-gray-900 p-4 rounded shadow h-full">
            <h2 className="text-xl font-semibold mb-2">Node Details</h2>
            {selectedNode ? (
              <div className="text-sm space-y-2">
                <p><strong>ID:</strong> {selectedNode.id}</p>
                <p><strong>Label:</strong> {selectedNode.label}</p>
                {selectedNode.name && <p><strong>Name:</strong> {selectedNode.name}</p>}
                {selectedNode.title && <p><strong>Title:</strong> {selectedNode.title}</p>}
                {selectedNode.role && <p><strong>Role:</strong> {selectedNode.role}</p>}
              </div>
            ) : (
              <p className="text-gray-500">Click a node to view details</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
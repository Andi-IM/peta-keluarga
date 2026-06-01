"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { processNetworkData, getNodeStats, type ClusterInfo } from "@/lib/network-utils";
import {
  NodeInfoPanel,
  SearchPanel,
  Legend,
  StatsPanel,
  ClusterInfoPanel,
} from "@/components/sidebar-panels";

const NetworkGraph = dynamic(
  () => import("@/components/network-graph").then((mod) => mod.NetworkGraph),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading network graph...</div>
      </div>
    ),
  }
);

export function FamilyNetworkApp() {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<ClusterInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { nodes, edges, clusters } = useMemo(() => processNetworkData(), []);
  const stats = useMemo(() => getNodeStats(), []);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNode(nodeId);
    setSelectedCluster(null);
  }, []);

  const handleClusterSelect = useCallback((cluster: ClusterInfo | null) => {
    setSelectedCluster(cluster);
    setSelectedNode(null);
  }, []);

  const handleSearch = useCallback((name: string) => {
    setSelectedNode(name);
    setSelectedCluster(null);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div
        className={`flex-shrink-0 border-r bg-card transition-all duration-300 ${
          sidebarOpen ? "w-80" : "w-0"
        } overflow-hidden`}
      >
        <div className="flex h-full w-80 flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <h1 className="text-xl font-bold text-foreground">
              Keluarga Politik
            </h1>
            <p className="text-sm text-muted-foreground">
              Jaringan Keluarga Politik Indonesia
            </p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <SearchPanel onSearch={handleSearch} />
            {selectedCluster && <ClusterInfoPanel cluster={selectedCluster} />}
            {selectedNode && <NodeInfoPanel selectedNode={selectedNode} />}
            <Legend />
            <StatsPanel
              totalNodes={stats.totalNodes}
              totalEdges={stats.totalEdges}
              relationshipCounts={stats.relationshipCounts}
              totalClusters={clusters.length}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative flex-1">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent"
          title={sidebarOpen ? "Sembunyikan Sidebar" : "Tampilkan Sidebar"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>

        {/* Network Graph */}
        <NetworkGraph
          nodes={nodes}
          edges={edges}
          clusters={clusters}
          onNodeSelect={handleNodeSelect}
          onClusterSelect={handleClusterSelect}
        />
      </div>
    </div>
  );
}

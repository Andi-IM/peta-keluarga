"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Network, Options } from "vis-network";
import { DataSet } from "vis-data";
import type { Node, Edge } from "vis-network";
import type { ClusterInfo } from "@/lib/network-utils";

interface NetworkGraphProps {
  nodes: Node[];
  edges: Edge[];
  clusters: ClusterInfo[];
  options?: Options;
  onNodeSelect?: (nodeId: string | null) => void;
  onClusterSelect?: (cluster: ClusterInfo | null) => void;
}

const defaultOptions: Options = {
  nodes: {
    shape: "dot",
    borderWidth: 2,
    shadow: true,
    font: {
      size: 12,
      face: "system-ui, -apple-system, sans-serif",
    },
  },
  edges: {
    width: 1.5,
    shadow: false,
    smooth: {
      enabled: true,
      type: "curvedCW",
      roundness: 0.2,
    },
  },
  layout: {
    improvedLayout: false,
  },
  physics: {
    enabled: false,
  },
  interaction: {
    hover: true,
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    navigationButtons: false,
    keyboard: true,
    zoomView: true,
    dragView: true,
  },
};

export function NetworkGraph({
  nodes,
  edges,
  clusters,
  options = {},
  onNodeSelect,
  onClusterSelect,
}: NetworkGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const nodesDataSetRef = useRef<DataSet<Node> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clusteredView, setClusteredView] = useState(true);
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  const fitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initNetwork = useCallback(() => {
    if (!containerRef.current) return;

    let isDestroyed = false;

    if (fitTimeoutRef.current) {
      clearTimeout(fitTimeoutRef.current);
      fitTimeoutRef.current = null;
    }

    const nodesDataSet = new DataSet(nodes);
    const edgesDataSet = new DataSet(edges);
    nodesDataSetRef.current = nodesDataSet;

    const mergedOptions: Options = {
      ...defaultOptions,
      ...options,
    };

    const network = new Network(
      containerRef.current,
      { nodes: nodesDataSet, edges: edgesDataSet },
      mergedOptions
    );

    const safeFit = () => {
      if (isDestroyed) return;
      if (network && containerRef.current) {
        try {
          network.fit({ animation: true });
        } catch (e) {
          console.warn("Fit failed:", e);
        }
      }
    };

    network.once("afterDrawing", () => {
      if (isDestroyed) return;
      setIsLoading(false);
      
      // Initially cluster all groups
      if (clusteredView) {
        clusters.forEach((cluster) => {
          if (!expandedClusters.has(cluster.id)) {
            clusterNodes(network, cluster, nodesDataSet);
          }
        });
      }
      
      safeFit();
    });

    network.on("selectNode", (params) => {
      if (isDestroyed) return;
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        
        // Check if it's a cluster
        if (network.isCluster(nodeId)) {
          const cluster = clusters.find((c) => c.id === nodeId);
          if (cluster && onClusterSelect) {
            onClusterSelect(cluster);
          }
        } else if (onNodeSelect) {
          onNodeSelect(nodeId);
        }
      }
    });

    network.on("deselectNode", () => {
      if (isDestroyed) return;
      if (onNodeSelect) onNodeSelect(null);
      if (onClusterSelect) onClusterSelect(null);
    });

    network.on("doubleClick", (params) => {
      if (isDestroyed) return;
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0] as string;
        
        if (network.isCluster(nodeId)) {
          // Expand cluster on double click
          network.openCluster(nodeId);
          setExpandedClusters((prev) => new Set([...prev, nodeId]));
        } else {
          // Find cluster for this node and collapse it
          const cluster = clusters.find((c) => c.members.includes(nodeId));
          if (cluster) {
            clusterNodes(network, cluster, nodesDataSet);
            setExpandedClusters((prev) => {
              const next = new Set(prev);
              next.delete(cluster.id);
              return next;
            });
          }
        }
      }
    });

    networkRef.current = network;

    return () => {
      isDestroyed = true;
      if (fitTimeoutRef.current) {
        clearTimeout(fitTimeoutRef.current);
        fitTimeoutRef.current = null;
      }
      networkRef.current = null;
      network.destroy();
    };
  }, [nodes, edges, clusters, options, onNodeSelect, onClusterSelect, clusteredView, expandedClusters]);

  useEffect(() => {
    const cleanup = initNetwork();
    return cleanup;
  }, [initNetwork]);

  const clusterNodes = (network: Network, cluster: ClusterInfo, nodesDataSet: DataSet<Node>) => {
    const clusterOptionsByData = {
      joinCondition: (nodeOptions: Node) => {
        return cluster.members.includes(nodeOptions.id as string);
      },
      clusterNodeProperties: {
        id: cluster.id,
        label: `${cluster.name}\n(${cluster.members.length} orang)`,
        shape: "dot",
        size: Math.min(30 + cluster.members.length * 2, 80),
        color: {
          background: cluster.color,
          border: adjustColor(cluster.color, -30),
          highlight: {
            background: adjustColor(cluster.color, 20),
            border: adjustColor(cluster.color, -20),
          },
        },
        font: {
          size: 14,
          color: "#1f2937",
          bold: { color: "#1f2937" },
        },
        x: cluster.x,
        y: cluster.y,
      },
    };

    try {
      network.cluster(clusterOptionsByData);
    } catch {
      // Cluster might already exist
    }
  };

  const isNodeCluster = (nodeId: string): boolean => {
    if (!networkRef.current) return false;
    try {
      // Check if the node exists in the network first to avoid "Node does not exist" error
      // which is thrown by isCluster if the nodeId is not found.
      const positions = networkRef.current.getPositions([nodeId]);
      if (positions[nodeId]) {
        return networkRef.current.isCluster(nodeId);
      }
      return false;
    } catch {
      return false;
    }
  };

  const handleClusterAll = () => {
    if (networkRef.current) {
      setExpandedClusters(new Set());
      setClusteredView(true);
      // We don't need to manually cluster here because changing clusteredView 
      // will trigger initNetwork to re-run and cluster everything.
    }
  };

  const handleExpandAll = () => {
    if (networkRef.current) {
      setExpandedClusters(new Set(clusters.map((c) => c.id)));
      setClusteredView(false);
      // We don't need to manually expand here because changing clusteredView 
      // will trigger initNetwork to re-run and create an unclustered view.
    }
  };

  const handleZoomIn = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkRef.current) {
      const scale = networkRef.current.getScale();
      networkRef.current.moveTo({ scale: scale / 1.2 });
    }
  };

  const handleFit = () => {
    if (networkRef.current) {
      networkRef.current.fit({ animation: true });
    }
  };

  return (
    <div className="relative h-full w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="mb-2 text-lg font-medium">Memuat Jaringan...</div>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
      
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Cluster controls */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={handleClusterAll}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent text-sm font-medium"
          title="Kelompokkan Semua"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="4"/>
          </svg>
          Kelompokkan
        </button>
        <button
          onClick={handleExpandAll}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent text-sm font-medium"
          title="Buka Semua Kluster"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          Buka Semua
        </button>
      </div>
      
      {/* Hint */}
      <div className="absolute bottom-20 left-4 px-3 py-2 rounded-lg bg-card/80 text-card-foreground shadow-md text-xs">
        Klik dua kali kluster untuk membuka/menutup
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent"
          title="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent"
          title="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button
          onClick={handleFit}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-card text-card-foreground shadow-md transition-colors hover:bg-accent"
          title="Fit to View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function adjustColor(color: string, amount: number): string {
  if (color.startsWith("hsl")) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount));
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
  return color;
}

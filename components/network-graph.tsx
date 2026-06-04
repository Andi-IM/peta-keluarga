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
  sidebarOpen?: boolean;
}

const defaultOptions: Options = {
  nodes: {
    shape: "dot",
    borderWidth: 2,
    shadow: {
      enabled: true,
      color: "rgba(255, 255, 255, 0.4)",
      size: 15,
      x: 0,
      y: 0,
    },
    font: {
      size: 12,
      face: "system-ui, -apple-system, sans-serif",
      color: "rgba(255, 255, 255, 0.85)",
      strokeWidth: 2,
      strokeColor: "#030014",
    },
  },
  edges: {
    width: 1,
    shadow: false,
    smooth: {
      enabled: true,
      type: "curvedCW",
      roundness: 0.2,
    },
  },
  layout: {
    improvedLayout: true,
  },
  physics: {
    enabled: true,
    solver: "barnesHut",
    barnesHut: {
      gravitationalConstant: -2000,
      centralGravity: 0.15,
      springLength: 100,
      springConstant: 0.04,
      damping: 0.9,
      avoidOverlap: 1,
    },
    stabilization: {
      enabled: true,
      iterations: 200,
      updateInterval: 25,
    },
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
  sidebarOpen = true,
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

    // Zoom level tracking and dynamic level of detail
    let currentZoomLevel: 'close' | 'medium' | 'far' = 'far';

    const applyZoomLoD = (scale: number) => {
      let newZoomLevel: 'close' | 'medium' | 'far' = 'far';
      if (scale >= 0.8) {
        newZoomLevel = 'close';
      } else if (scale >= 0.35) {
        newZoomLevel = 'medium';
      } else {
        newZoomLevel = 'far';
      }

      if (newZoomLevel !== currentZoomLevel) {
        currentZoomLevel = newZoomLevel;
        updateLabelsForZoom(newZoomLevel, nodesDataSet, edgesDataSet, nodes, edges);
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
      
      // Setup initial labels based on scale after first fit
      const initialScale = network.getScale();
      let initialZoomLevel: 'close' | 'medium' | 'far' = 'far';
      if (initialScale >= 0.8) initialZoomLevel = 'close';
      else if (initialScale >= 0.35) initialZoomLevel = 'medium';
      
      currentZoomLevel = initialZoomLevel;
      updateLabelsForZoom(initialZoomLevel, nodesDataSet, edgesDataSet, nodes, edges);

      safeFit();
    });

    network.on("zoom", () => {
      if (isDestroyed) return;
      const scale = network.getScale();
      applyZoomLoD(scale);
    });

    network.on("beforeDrawing", (ctx) => {
      if (isDestroyed) return;
      ctx.save();
      
      // Draw Concentric Altitude/Elevation Rings (Faint Cyan/Indigo)
      ctx.strokeStyle = "rgba(56, 189, 248, 0.04)"; // very faint cyan
      ctx.lineWidth = 1;
      
      const maxRadius = 4500;
      const step = 250;
      
      for (let r = 250; r <= maxRadius; r += step) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
        
        // Add faint radius label (e.g. light years "ly")
        ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
        ctx.font = "9px system-ui, -apple-system, sans-serif";
        ctx.fillText(`${r} ly`, 5, -r + 12);
      }
      
      // Draw Azimuthal Radial Lines (Grid Lines)
      const rayCount = 12; // every 30 degrees
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * maxRadius, Math.sin(angle) * maxRadius);
        ctx.stroke();
        
        // Add coordinate degrees label at the end of rays
        const deg = i * (360 / rayCount);
        const labelRadius = 2500; // place near inner boundary
        const lx = Math.cos(angle) * labelRadius;
        const ly = Math.sin(angle) * labelRadius;
        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(angle + Math.PI / 2);
        ctx.fillStyle = "rgba(255, 255, 255, 0.12)";
        ctx.font = "10px system-ui, -apple-system, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${deg}°`, 0, 0);
        ctx.restore();
      }
      
      // Draw center core indicator
      ctx.fillStyle = "rgba(255, 255, 255, 0.02)";
      ctx.beginPath();
      ctx.arc(0, 0, 100, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
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
        size: Math.min(35 + cluster.members.length * 2.5, 75),
        color: {
          background: "#ffffff", // Galaxy core
          border: cluster.color, // Galaxy corona
          highlight: {
            background: "#ffffff",
            border: adjustColor(cluster.color, 20),
          },
          hover: {
            background: "#ffffff",
            border: adjustColor(cluster.color, 10),
          }
        },
        font: {
          size: 14,
          color: "#ffffff",
          face: "system-ui, -apple-system, sans-serif",
          strokeWidth: 3,
          strokeColor: "#030014",
          bold: { color: "#ffffff" },
        },
        shadow: {
          enabled: true,
          color: cluster.color,
          size: Math.min(25 + cluster.members.length * 3, 50),
          x: 0,
          y: 0,
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
    <div className="relative h-full w-full bg-[#020208] overflow-hidden">
      {/* Cosmic background with stars and nebulas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#030014] via-[#050515] to-[#010103]" />
        
        {/* Deep Nebulas */}
        <div className="absolute -top-[15%] -left-[15%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px]" />
        <div className="absolute -bottom-[15%] -right-[15%] w-[60%] h-[60%] rounded-full bg-purple-500/5 blur-[120px]" />
        <div className="absolute top-[35%] left-[45%] w-[50%] h-[50%] rounded-full bg-sky-500/3 blur-[140px]" />
        
        {/* SVG Starfield */}
        <svg className="absolute inset-0 w-full h-full opacity-35" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="stars-pattern" width="220" height="220" patternUnits="userSpaceOnUse">
              <circle cx="15" cy="40" r="1.2" fill="#fff" opacity="0.8" />
              <circle cx="70" cy="100" r="1.5" fill="#fff" opacity="0.45" />
              <circle cx="120" cy="30" r="0.8" fill="#fff" opacity="0.9" />
              <circle cx="190" cy="75" r="1.3" fill="#fff" opacity="0.6" />
              <circle cx="40" cy="170" r="1.1" fill="#fff" opacity="0.75" />
              <circle cx="140" cy="195" r="1.7" fill="#fff" opacity="0.4" />
              <circle cx="210" cy="145" r="0.8" fill="#fff" opacity="0.8" />
              <circle cx="20" cy="230" r="0.6" fill="#fff" opacity="0.3" />
              <circle cx="160" cy="125" r="0.7" fill="#fff" opacity="0.5" />
              <circle cx="95" cy="155" r="0.8" fill="#fff" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#stars-pattern)" />
        </svg>
      </div>

      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#030014]/90 backdrop-blur-md">
          <div className="text-center text-slate-200">
            <div className="mb-3 text-lg font-medium tracking-wide">Memuat Rasi Bintang...</div>
            <div className="animate-spin h-8 w-8 border-4 border-sky-500 border-t-transparent rounded-full mx-auto" />
          </div>
        </div>
      )}
      
      {/* Network canvas must sit on top of the space background */}
      <div ref={containerRef} className="h-full w-full relative z-10 bg-transparent" />
      
      {/* Cluster controls */}
      <div className={`absolute top-4 ${sidebarOpen ? "left-4" : "left-16"} z-20 flex gap-2 transition-all duration-300`}>
        <button
          onClick={handleClusterAll}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-800/80 hover:text-white hover:border-white/20 text-sm font-medium cursor-pointer"
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
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-800/80 hover:text-white hover:border-white/20 text-sm font-medium cursor-pointer"
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
      <div className="absolute bottom-20 left-4 z-20 px-3 py-2 rounded-lg bg-slate-900/65 backdrop-blur-md text-slate-300 border border-white/5 shadow-lg text-xs">
        Klik dua kali kluster untuk membuka/menutup rasi bintang
      </div>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-800/80 hover:text-white hover:border-white/20 cursor-pointer"
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
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-800/80 hover:text-white hover:border-white/20 cursor-pointer"
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
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/60 backdrop-blur-md text-slate-200 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all hover:bg-slate-800/80 hover:text-white hover:border-white/20 cursor-pointer"
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

// dynamic label and edge thickness updating function for zoom levels
function updateLabelsForZoom(
  zoomLevel: 'close' | 'medium' | 'far',
  nodesDataSet: DataSet<Node>,
  edgesDataSet: DataSet<Edge>,
  nodes: Node[],
  edges: Edge[]
) {
  // Update nodes
  const updatedNodes = nodes.map((node) => {
    // Highly connected node check (size > 20)
    const isKeyNode = (node.size && node.size > 20);
    let label = node.id as string;
    let fontSize = 12;
    let opacity = 0.85;

    if (zoomLevel === 'far') {
      label = isKeyNode ? (node.id as string) : "";
      fontSize = 11;
      opacity = isKeyNode ? 0.75 : 0;
    } else if (zoomLevel === 'medium') {
      label = node.id as string;
      fontSize = 10;
      opacity = 0.65;
    } else {
      label = node.id as string;
      fontSize = 12;
      opacity = 0.9;
    }

    return {
      id: node.id,
      label: label,
      font: {
        size: fontSize,
        color: `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
        strokeColor: "#030014",
      }
    };
  });

  nodesDataSet.update(updatedNodes);

  // Update edges
  const updatedEdges = edges.map((edge) => {
    const isSpouse = edge.dashes === true;
    let label = "";
    let width = isSpouse ? 1.2 : 1;
    let colorOpacity = 0.25;

    if (zoomLevel === 'close') {
      label = edge.label || "";
      width = isSpouse ? 1.5 : 1.2;
      colorOpacity = 0.8;
    } else if (zoomLevel === 'medium') {
      label = "";
      width = isSpouse ? 1.2 : 1;
      colorOpacity = 0.4;
    } else {
      label = "";
      width = isSpouse ? 1 : 0.8;
      colorOpacity = 0.2;
    }

    // Set dynamic neon color with transparency
    const baseColor = getConstellationEdgeColor(edge.label as string, colorOpacity);

    return {
      id: edge.id,
      label: label,
      width: width,
      color: {
        color: baseColor,
        highlight: getConstellationEdgeColor(edge.label as string, 0.95),
        hover: getConstellationEdgeColor(edge.label as string, 0.8),
      },
      font: {
        size: 10,
        color: `rgba(255, 255, 255, ${zoomLevel === 'close' ? 0.75 : 0})`,
        strokeWidth: 2,
        strokeColor: "#030014",
      }
    };
  });

  edgesDataSet.update(updatedEdges);
}

// neon constellation edge helper
function getConstellationEdgeColor(type: string, alpha: number = 0.25): string {
  const colors: Record<string, string> = {
    bapak: `rgba(56, 189, 248, ${alpha})`,   // bright sky blue
    ibu: `rgba(244, 114, 182, ${alpha})`,     // pink
    pasangan: `rgba(52, 211, 153, ${alpha})`, // emerald green
    anak: `rgba(251, 191, 36, ${alpha})`,     // amber/gold
  };
  return colors[type] || `rgba(229, 231, 235, ${alpha})`;
}

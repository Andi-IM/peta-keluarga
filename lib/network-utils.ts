import { familyData, relationshipColors } from "./family-data";
import type { Node, Edge } from "vis-network";

export interface NetworkData {
  nodes: Node[];
  edges: Edge[];
  clusters: ClusterInfo[];
}

export interface ClusterInfo {
  id: string;
  name: string;
  members: string[];
  color: string;
  x: number;
  y: number;
}

export function processNetworkData(): NetworkData {
  const nodeMap = new Map<string, { id: string; connections: number; families: Set<string> }>();
  const edges: Edge[] = [];
  
  // First pass: collect all unique people and count their connections
  familyData.forEach((relation) => {
    const personId = relation.person;
    const relatedId = relation.related_to;
    
    if (!nodeMap.has(personId)) {
      nodeMap.set(personId, { id: personId, connections: 0, families: new Set() });
    }
    if (!nodeMap.has(relatedId)) {
      nodeMap.set(relatedId, { id: relatedId, connections: 0, families: new Set() });
    }
    
    nodeMap.get(personId)!.connections++;
    nodeMap.get(relatedId)!.connections++;
  });
  
  // Assign family groups using connected components
  const familyGroups = assignFamilyGroups(nodeMap, familyData);
  
  // Generate distinct colors for each family group
  const numGroups = new Set(familyGroups.values()).size;
  const groupColors = generateGroupColors(numGroups);
  const groupColorMap = new Map<number, string>();
  
  const uniqueGroups = [...new Set(familyGroups.values())].sort((a, b) => a - b);
  uniqueGroups.forEach((groupId, index) => {
    groupColorMap.set(groupId, groupColors[index % groupColors.length]);
  });
  
  // Group members by cluster
  const clusterMembers = new Map<number, string[]>();
  familyGroups.forEach((groupId, name) => {
    if (!clusterMembers.has(groupId)) {
      clusterMembers.set(groupId, []);
    }
    clusterMembers.get(groupId)!.push(name);
  });
  
  // Find most connected person in each cluster to use as cluster name
  const clusterNames = new Map<number, string>();
  clusterMembers.forEach((members, groupId) => {
    let maxConnections = 0;
    let clusterHead = members[0];
    
    members.forEach((name) => {
      const connections = nodeMap.get(name)?.connections || 0;
      if (connections > maxConnections) {
        maxConnections = connections;
        clusterHead = name;
      }
    });
    
    // Use the family name (last name or most connected person's name)
    clusterNames.set(groupId, `Keluarga ${clusterHead.split(" ").pop()}`);
  });
  
  // Create cluster info
  const clusters: ClusterInfo[] = [];
  
  // Sort cluster groups by member count descending so larger families occupy the center
  const sortedClusters = Array.from(clusterMembers.entries())
    .sort((a, b) => b[1].length - a[1].length);
    
  const clusterPositions = calculateClusterPositions(sortedClusters.length);
  
  sortedClusters.forEach(([groupId, members], index) => {
    const color = groupColorMap.get(groupId) || "#6366f1";
    const pos = clusterPositions[index];
    
    clusters.push({
      id: `cluster-${groupId}`,
      name: clusterNames.get(groupId) || `Cluster ${groupId}`,
      members,
      color,
      x: pos.x,
      y: pos.y,
    });
  });
  
  // Create nodes with colors based on family groups
  const nodes: Node[] = [];
  
  nodeMap.forEach((data, name) => {
    const groupId = familyGroups.get(name) || 0;
    const color = groupColorMap.get(groupId) || "#6366f1";
    // Scale node size based on connections, matching star magnitude
    const size = Math.min(12 + data.connections * 2.5, 45);
    
    // Find cluster position
    const clusterIdx = clusters.findIndex((c) => c.members.includes(name));
    const cluster = clusters[clusterIdx];
    
    // Position nodes within their cluster
    const memberIndex = cluster?.members.indexOf(name) || 0;
    const memberCount = cluster?.members.length || 1;
    const spreadRadius = Math.min(150, 30 + memberCount * 5);
    
    const angle = (memberIndex / memberCount) * Math.PI * 2;
    const nodeX = (cluster?.x || 0) + Math.cos(angle) * spreadRadius * (0.5 + Math.random() * 0.5);
    const nodeY = (cluster?.y || 0) + Math.sin(angle) * spreadRadius * (0.5 + Math.random() * 0.5);
    
    // Stars have a bright core (white) and a glowing colored corona (border & shadow)
    nodes.push({
      id: name,
      label: name,
      x: nodeX,
      y: nodeY,
      color: {
        background: "#ffffff", // Star core
        border: color,         // Colored corona
        highlight: {
          background: "#ffffff",
          border: adjustColor(color, 20),
        },
        hover: {
          background: "#ffffff",
          border: adjustColor(color, 10),
        }
      },
      size,
      font: {
        size: 12,
        color: "rgba(255, 255, 255, 0.85)",
        face: "system-ui, -apple-system, sans-serif",
        strokeWidth: 2,
        strokeColor: "#030014", // dark outline for readability
      },
      shadow: {
        enabled: true,
        color: color, // glow matching the family color
        size: Math.min(8 + data.connections * 3, 25),
        x: 0,
        y: 0,
      },
      group: groupId.toString(),
    });
  });
  
  // Create edges as constellation lines
  familyData.forEach((relation, index) => {
    const isSpouse = relation.relationship_type === "pasangan";
    const baseColor = getConstellationEdgeColor(relation.relationship_type, 0.25);
    
    edges.push({
      id: `edge-${index}`,
      from: relation.person,
      to: relation.related_to,
      label: relation.relationship_type,
      color: {
        color: baseColor,
        highlight: getConstellationEdgeColor(relation.relationship_type, 0.9),
        hover: getConstellationEdgeColor(relation.relationship_type, 0.7),
      },
      font: {
        size: 10,
        color: "rgba(255, 255, 255, 0.75)",
        strokeWidth: 2,
        strokeColor: "#030014",
      },
      arrows: {
        to: {
          enabled: !isSpouse, // spouse relationships have no direction
          scaleFactor: 0.4,
        },
      },
      smooth: {
        enabled: true,
        type: "curvedCW",
        roundness: 0.2,
      },
      dashes: isSpouse, // dotted/dashed lines for spouses, typical for star maps
      width: isSpouse ? 1.2 : 1,
    });
  });
  
  return { nodes, edges, clusters };
}

function calculateClusterPositions(count: number): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  
  // Fermat's Spiral (Golden Spiral) to distribute star systems organically in a circular disk
  const goldenAngle = 137.5 * (Math.PI / 180);
  const spacingConstant = 180; // distance spacing between spirals
  
  for (let i = 0; i < count; i++) {
    // Square root distributes points evenly across a circular area
    const r = spacingConstant * Math.sqrt(i + 0.5) * 1.35;
    const theta = i * goldenAngle;
    
    positions.push({
      x: r * Math.cos(theta),
      y: r * Math.sin(theta),
    });
  }
  
  return positions;
}

function assignFamilyGroups(
  nodeMap: Map<string, { id: string; connections: number; families: Set<string> }>,
  relations: typeof familyData
): Map<string, number> {
  const parent = new Map<string, string>();
  
  // Initialize each node as its own parent
  nodeMap.forEach((_, name) => {
    parent.set(name, name);
  });
  
  // Find with path compression
  function find(x: string): string {
    if (parent.get(x) !== x) {
      parent.set(x, find(parent.get(x)!));
    }
    return parent.get(x)!;
  }
  
  // Union
  function union(x: string, y: string) {
    const px = find(x);
    const py = find(y);
    if (px !== py) {
      parent.set(px, py);
    }
  }
  
  // Connect all related people
  relations.forEach((relation) => {
    union(relation.person, relation.related_to);
  });
  
  // Assign group numbers
  const groupMap = new Map<string, number>();
  let groupCounter = 0;
  
  const result = new Map<string, number>();
  nodeMap.forEach((_, name) => {
    const root = find(name);
    if (!groupMap.has(root)) {
      groupMap.set(root, groupCounter++);
    }
    result.set(name, groupMap.get(root)!);
  });
  
  return result;
}

function generateGroupColors(count: number): string[] {
  const colors: string[] = [];
  const hueStep = 360 / Math.max(count, 1);
  
  for (let i = 0; i < count; i++) {
    const hue = (i * hueStep + 200) % 360; // Start from blue
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  
  return colors;
}

function adjustColor(color: string, amount: number): string {
  // Handle HSL colors
  if (color.startsWith("hsl")) {
    const match = color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
    if (match) {
      const h = parseInt(match[1]);
      const s = parseInt(match[2]);
      const l = Math.max(0, Math.min(100, parseInt(match[3]) + amount));
      return `hsl(${h}, ${s}%, ${l}%)`;
    }
  }
  
  // Handle hex colors
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  }
  
  return color;
}

export function getNodeStats() {
  const nodeMap = new Map<string, number>();
  
  familyData.forEach((relation) => {
    nodeMap.set(relation.person, (nodeMap.get(relation.person) || 0) + 1);
    nodeMap.set(relation.related_to, (nodeMap.get(relation.related_to) || 0) + 1);
  });
  
  return {
    totalNodes: nodeMap.size,
    totalEdges: familyData.length,
    relationshipCounts: familyData.reduce((acc, rel) => {
      acc[rel.relationship_type] = (acc[rel.relationship_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };
}

function getConstellationEdgeColor(type: string, alpha: number = 0.25): string {
  const colors: Record<string, string> = {
    bapak: `rgba(56, 189, 248, ${alpha})`,   // bright sky blue
    ibu: `rgba(244, 114, 182, ${alpha})`,     // pink
    pasangan: `rgba(52, 211, 153, ${alpha})`, // emerald green
    anak: `rgba(251, 191, 36, ${alpha})`,     // amber/gold
  };
  return colors[type] || `rgba(229, 231, 235, ${alpha})`;
}

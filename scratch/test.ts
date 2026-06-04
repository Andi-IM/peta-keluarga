import { processNetworkData } from '../lib/network-utils';

const data = processNetworkData();
console.log("Nodes count:", data.nodes.length);
console.log("Edges count:", data.edges.length);
console.log("Clusters count:", data.clusters.length);
console.log("Clusters details:");
data.clusters.forEach(c => {
  console.log(`Cluster ${c.id}: ${c.name}, members: ${c.members.length}`);
});

"use client";

import { useState, useMemo } from "react";
import { familyData, relationshipLabels, relationshipColors, personRelationsLookup, allUniqueNames } from "@/lib/family-data";
import type { ClusterInfo } from "@/lib/network-utils";

interface NodeInfoPanelProps {
  selectedNode: string | null;
}

export function NodeInfoPanel({ selectedNode }: NodeInfoPanelProps) {
  const nodeInfo = useMemo(() => {
    if (!selectedNode) return null;

    const indexed = personRelationsLookup[selectedNode] || { fathers: [], mothers: [], spouses: [], children: [] };

    return {
      name: selectedNode,
      fathers: indexed.fathers,
      mothers: indexed.mothers,
      spouses: indexed.spouses,
      children: indexed.children,
      totalConnections: indexed.fathers.length + indexed.mothers.length + indexed.spouses.length + indexed.children.length,
    };
  }, [selectedNode]);

  if (!nodeInfo) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 text-lg font-semibold">{nodeInfo.name}</h3>
      <div className="space-y-3 text-sm">
        {nodeInfo.fathers.length > 0 && (
          <div>
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: relationshipColors.bapak }}
            >
              {relationshipLabels.bapak}
            </span>
            <ul className="mt-1 ml-2">
              {nodeInfo.fathers.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        )}
        {nodeInfo.mothers.length > 0 && (
          <div>
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: relationshipColors.ibu }}
            >
              {relationshipLabels.ibu}
            </span>
            <ul className="mt-1 ml-2">
              {nodeInfo.mothers.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          </div>
        )}
        {nodeInfo.spouses.length > 0 && (
          <div>
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: relationshipColors.pasangan }}
            >
              {relationshipLabels.pasangan}
            </span>
            <ul className="mt-1 ml-2">
              {nodeInfo.spouses.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        )}
        {nodeInfo.children.length > 0 && (
          <div>
            <span
              className="inline-block rounded px-2 py-0.5 text-xs font-medium text-white"
              style={{ backgroundColor: relationshipColors.anak }}
            >
              Anak
            </span>
            <ul className="mt-1 ml-2 max-h-32 overflow-y-auto">
              {nodeInfo.children.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="border-t pt-2 text-muted-foreground">
          Total koneksi: {nodeInfo.totalConnections}
        </div>
      </div>
    </div>
  );
}

interface ClusterInfoPanelProps {
  cluster: ClusterInfo;
}

export function ClusterInfoPanel({ cluster }: ClusterInfoPanelProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: cluster.color }}
        />
        <h3 className="text-lg font-semibold">{cluster.name}</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Jumlah Anggota</span>
          <span className="font-medium">{cluster.members.length}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="text-xs text-muted-foreground mb-2">Anggota Keluarga:</div>
          <ul className="max-h-48 overflow-y-auto space-y-1">
            {cluster.members.slice(0, 20).map((member) => (
              <li key={member} className="text-sm">{member}</li>
            ))}
            {cluster.members.length > 20 && (
              <li className="text-sm text-muted-foreground">
                ... dan {cluster.members.length - 20} lainnya
              </li>
            )}
          </ul>
        </div>
        <p className="text-xs text-muted-foreground italic pt-2">
          Klik dua kali pada kluster untuk membukanya
        </p>
      </div>
    </div>
  );
}

interface SearchPanelProps {
  onSearch: (query: string) => void;
}

export function SearchPanel({ onSearch }: SearchPanelProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const allNames = allUniqueNames;

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.length > 1) {
      const filtered = allNames
        .filter((name) => name.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelect = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    onSearch(name);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Cari nama..."
          className="w-full rounded-lg border bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border bg-popover shadow-lg">
          {suggestions.map((name) => (
            <li
              key={name}
              onClick={() => handleSelect(name)}
              className="cursor-pointer px-4 py-2 text-sm hover:bg-accent"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Legend() {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Jenis Hubungan
      </h3>
      <div className="space-y-2">
        {Object.entries(relationshipLabels).map(([key, label]) => (
          <div key={key} className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: relationshipColors[key] }}
            />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface StatsPanelProps {
  totalNodes: number;
  totalEdges: number;
  relationshipCounts: Record<string, number>;
  totalClusters?: number;
}

export function StatsPanel({
  totalNodes,
  totalEdges,
  relationshipCounts,
  totalClusters,
}: StatsPanelProps) {
  return (
    <div className="rounded-lg border bg-card p-4 text-card-foreground">
      <h3 className="mb-3 text-sm font-medium text-muted-foreground">
        Statistik
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Total Orang</span>
          <span className="font-medium">{totalNodes}</span>
        </div>
        <div className="flex justify-between">
          <span>Total Koneksi</span>
          <span className="font-medium">{totalEdges}</span>
        </div>
        {totalClusters && (
          <div className="flex justify-between">
            <span>Total Kluster Keluarga</span>
            <span className="font-medium">{totalClusters}</span>
          </div>
        )}
        <div className="mt-3 border-t pt-3">
          <div className="text-xs text-muted-foreground mb-2">Berdasarkan Hubungan</div>
          {Object.entries(relationshipCounts).map(([key, count]) => (
            <div key={key} className="flex justify-between">
              <span className="flex items-center gap-2">
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: relationshipColors[key] }}
                />
                {relationshipLabels[key]}
              </span>
              <span>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";

type RatingItem = {
  // якщо бекенд ще не віддає rank — тимчасово можна зробити rank?: number
  rank: number;
  id: number;
  name: string;
  group: string;
  points: number;
};

type SortKey = "rank" | "name" | "group" | "points";
type SortDir = "asc" | "desc";

export default function RatingTable() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [group, setGroup] = useState("");
  const [rows, setRows] = useState<RatingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("rank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const load = async () => {
    if (!base) {
      setErr("NEXT_PUBLIC_API_BASE_URL is missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const url = group
        ? `${base}/rating?group=${encodeURIComponent(group)}`
        : `${base}/rating`;

      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as RatingItem[];

      setRows(j);
    } catch (e: unknown) {
  if (e instanceof Error) {
    setErr(e.message);
  } else {
    setErr("Fetch failed");
  }
  setRows([]);
} finally {
  setLoading(false);
}

  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  const sorted = useMemo(() => {
    const arr = [...rows];
    const mul = sortDir === "asc" ? 1 : -1;

    arr.sort((a, b) => {
      if (sortKey === "rank") return (a.rank - b.rank) * mul;

      if (sortKey === "points") {
        const d = (a.points - b.points) * mul;
        if (d !== 0) return d;
        return a.name.localeCompare(b.name, "uk");
      }

      if (sortKey === "name") {
        const d = a.name.localeCompare(b.name, "uk") * mul;
        if (d !== 0) return d;
        return a.rank - b.rank;
      }

      // group
      const d = a.group.localeCompare(b.group, "uk") * mul;
      if (d !== 0) return d;
      return a.rank - b.rank;
    });

    return arr;
  }, [rows, sortKey, sortDir]);

  const onHeaderClick = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);

    // дефолтні напрямки “як люди звикли”
    if (key === "rank") setSortDir("asc");
    else if (key === "points") setSortDir("desc");
    else setSortDir("asc");
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          placeholder="Група (наприклад CS-21) або пусто"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border rounded px-3 py-2 text-black w-72"
        />

        <button
          className="border rounded px-3 py-2"
          onClick={load}
          disabled={loading}
          title="Оновити"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="border rounded p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-2/3" />
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>
      )}

      {!loading && err && (
        <div className="border rounded p-4">
          <div className="font-semibold">Помилка завантаження</div>
          <div className="text-sm opacity-80">{err}</div>
          <button className="mt-3 border rounded px-3 py-2" onClick={load}>
            Retry
          </button>
        </div>
      )}

      {!loading && !err && sorted.length === 0 && (
        <div className="border rounded p-4">
          Немає даних (або група не знайдена).
        </div>
      )}

      {!loading && !err && sorted.length > 0 && (
        <div className="border rounded overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <Th onClick={() => onHeaderClick("rank")} active={sortKey === "rank"} dir={sortDir}>
                  Rank
                </Th>
                <Th onClick={() => onHeaderClick("name")} active={sortKey === "name"} dir={sortDir}>
                  ПІБ
                </Th>
                <Th onClick={() => onHeaderClick("group")} active={sortKey === "group"} dir={sortDir}>
                  Група
                </Th>
                <Th onClick={() => onHeaderClick("points")} active={sortKey === "points"} dir={sortDir}>
                  Бали
                </Th>
              </tr>
            </thead>

            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3 font-semibold">#{s.rank}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.group}</td>
                  <td className="p-3">{s.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  dir,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active: boolean;
  dir: "asc" | "desc";
}) {
  return (
    <th
      className="text-left p-3 select-none cursor-pointer text-black"
      onClick={onClick}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {active && <span className="text-xs opacity-60">{dir === "asc" ? "▲" : "▼"}</span>}
      </span>
    </th>
  );
}

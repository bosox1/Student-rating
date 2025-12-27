"use client";

import { useEffect, useState } from "react";

type Student = {
  id: number;
  name: string;
  group: string;
  points: number;
};

export default function RatingTable() {
  const [group, setGroup] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!base) {
    console.error("NEXT_PUBLIC_API_BASE_URL is missing");
    return;
  }

  const url = group
    ? `${base}/rating?group=${encodeURIComponent(group)}`
    : `${base}/students`;

  fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then(setStudents)
    .catch((e) => {
      console.error("Fetch failed:", e);
    });
}, [group]);


  return (
    <>
      <div className="mb-4">
        <input
          placeholder="Група (наприклад CS-21)"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="border p-2 text-black"
        />
      </div>

      <table className="w-full border border-gray-700">
        <thead>
          <tr>
            <th className="p-3">ПІБ</th>
            <th className="p-3">Група</th>
            <th className="p-3">Бали</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id} className="border-t border-gray-700">
              <td className="p-3">{s.name}</td>
              <td className="p-3">{s.group}</td>
              <td className="p-3">{s.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

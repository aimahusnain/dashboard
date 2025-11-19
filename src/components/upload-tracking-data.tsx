"use client";

import { useState } from "react";

export default function Uploadtrackingdata() {
  const [loading, setLoading] = useState(false);

  const upload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.target as HTMLFormElement);

    const res = await fetch("/api/import-tracker", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    alert(JSON.stringify(data));
    setLoading(false);
  };

  return (
    <form onSubmit={upload} className="p-8 space-y-4">
      <input type="file" name="file" accept=".csv" className="border p-2" />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload CSV"}
      </button>
    </form>
  );
}

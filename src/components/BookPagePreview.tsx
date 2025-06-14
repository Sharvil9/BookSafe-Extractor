
import React from "react";
import { useBook } from "./BookContext";

export default function BookPagePreview() {
  const { pages } = useBook();
  if (pages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-4 py-2">
      {pages.map((page, idx) => (
        <div
          key={idx}
          className="shadow rounded overflow-hidden flex flex-col items-center border bg-white"
        >
          <img
            src={page.imageUrl}
            alt={page.name}
            className="max-h-40 object-contain mx-auto"
            style={{ background: "#f7f7f7" }}
          />
          <div className="text-xs text-center p-1">{page.name}</div>
        </div>
      ))}
    </div>
  );
}

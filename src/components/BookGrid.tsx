
import React, { useState } from "react";
import { useBook } from "./BookContext";
import PageEditDrawer from "./PageEditDrawer";

// Main grid display and selection logic
export default function BookGrid() {
  const { pages } = useBook();
  const [selected, setSelected] = useState<number | null>(null);

  if (pages.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2 sm:px-0 py-3 transition-all animate-fade-in">
        {pages.map((page, idx) => (
          <button
            type="button"
            key={idx}
            className={`relative shadow-lg rounded-xl overflow-hidden flex flex-col items-center border border-muted bg-white transition hover:shadow-xl focus:ring-2 ring-primary group`}
            onClick={() => setSelected(idx)}
            tabIndex={0}
            aria-label={`Edit page ${page.name}`}
          >
            <img
              src={page.imageUrl}
              alt={page.name}
              className="object-contain max-h-44 w-full bg-muted transition-transform duration-150 group-hover:scale-105"
              draggable={false}
              style={{ background: "#f7f7f7" }}
            />
            <div className="text-[10px] text-muted-foreground font-mono absolute bottom-1 right-2 bg-white/70 rounded px-1">
              {page.name}
            </div>
          </button>
        ))}
      </div>
      {selected !== null && (
        <PageEditDrawer
          pageIndex={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}


import React from "react";
import { useBook } from "./BookContext";
import { Trash } from "lucide-react";

export default function BookPagePreview() {
  const { pages } = useBook();
  if (pages.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2 sm:px-0 py-3 transition-all animate-fade-in">
      {pages.map((page, idx) => (
        <div
          key={idx}
          className="group relative shadow-lg rounded-xl overflow-hidden flex flex-col items-center border border-muted bg-white transition hover:shadow-xl"
        >
          <img
            src={page.imageUrl}
            alt={page.name}
            className="object-contain max-h-44 w-full bg-muted transition-transform duration-150 group-hover:scale-105"
            draggable={false}
            style={{ background: "#f7f7f7" }}
          />
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled
              tabIndex={-1}
              className="bg-white/80 hover:bg-destructive text-destructive transition rounded-full shadow p-1 border border-destructive cursor-not-allowed"
              title="Remove (coming soon)"
            >
              <Trash size={16} />
              <span className="sr-only">Remove page (future)</span>
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground font-mono absolute bottom-1 right-2 bg-white/70 rounded px-1">
            {page.name}
          </div>
        </div>
      ))}
    </div>
  );
}

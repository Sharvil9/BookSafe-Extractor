
import React, { useEffect, useRef, useState } from "react";
import PageEditDrawer from "./PageEditDrawer";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { Loader2 } from "lucide-react";
import type { BookPage } from "./PageEditDrawer";

export default function LazyBookGrid() {
  const { metadata, renderPage, pdfFile } = useSharedLazyPdfProcessor();
  const [selected, setSelected] = useState<number | null>(null);
  const [visiblePages, setVisiblePages] = useState<Set<number>>(new Set());
  const observerRef = useRef<IntersectionObserver>();

  // Set up intersection observer for lazy loading
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page') || '0');
            setVisiblePages(prev => new Set([...prev, pageNumber]));
          }
        });
      },
      { rootMargin: '50px' }
    );

    return () => observerRef.current?.disconnect();
  }, []);

  // Render visible pages
  useEffect(() => {
    if (!pdfFile || !metadata) return;
    
    visiblePages.forEach(async (pageNumber) => {
      const page = metadata.pages.find(p => p.pageNumber === pageNumber);
      if (page && !page.imageUrl && !page.isLoading) {
        try {
          await renderPage(pageNumber);
        } catch (error) {
          console.error(`Failed to render page ${pageNumber}:`, error);
        }
      }
    });
  }, [visiblePages, metadata, pdfFile, renderPage]);

  if (!metadata) return null;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2 sm:px-0 py-3 transition-all animate-fade-in">
        {metadata.pages.map((page, idx) => (
          <button
            type="button"
            key={page.pageNumber}
            data-page={page.pageNumber}
            ref={(el) => {
              if (el && observerRef.current) {
                observerRef.current.observe(el);
              }
            }}
            className="relative shadow-lg rounded-xl overflow-hidden flex flex-col items-center border border-muted bg-white transition hover:shadow-xl focus:ring-2 ring-primary group min-h-44"
            onClick={() => setSelected(idx)}
          >
            {page.isLoading ? (
              <div className="flex items-center justify-center w-full h-44 bg-muted">
                <Loader2 className="animate-spin" size={24} />
              </div>
            ) : page.imageUrl ? (
              <img
                src={page.imageUrl}
                alt={`Page ${page.pageNumber}`}
                className="object-contain max-h-44 w-full bg-muted transition-transform duration-150 group-hover:scale-105"
                draggable={false}
              />
            ) : (
              <div 
                className="flex items-center justify-center w-full bg-muted text-muted-foreground"
                style={{ 
                  height: Math.min(176, (page.height / page.width) * 176),
                  aspectRatio: `${page.width} / ${page.height}`
                }}
              >
                <span className="text-sm">Page {page.pageNumber}</span>
              </div>
            )}
            <div className="text-[10px] text-muted-foreground font-mono absolute bottom-1 right-2 bg-white/70 rounded px-1">
              Page {page.pageNumber}
            </div>
          </button>
        ))}
      </div>
      {selected !== null && metadata.pages[selected]?.imageUrl && (
        <PageEditDrawer
          page={{
            imageUrl: metadata.pages[selected].imageUrl as string,
            name: `Page ${metadata.pages[selected].pageNumber}`
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

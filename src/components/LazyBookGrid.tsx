
import React, { useEffect, useRef, useState } from "react";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { Loader2, RotateCcw, RotateCw } from "lucide-react";
import { Button } from "./ui/button";

export default function LazyBookGrid() {
  const { metadata, renderPage, pdfFile, updatePageRotation } = useSharedLazyPdfProcessor();
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
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-2 sm:px-0 py-3 transition-all animate-fade-in">
      {metadata.pages.map((page) => (
        <div
          key={page.pageNumber}
          data-page={page.pageNumber}
          ref={(el) => {
            if (el && observerRef.current) {
              observerRef.current.observe(el);
            }
          }}
          className="relative shadow-lg rounded-xl overflow-hidden flex flex-col items-center border border-muted bg-white transition hover:shadow-xl group min-h-44"
        >
          <div className="absolute top-2 right-2 z-10 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              title="Rotate Left"
              onClick={() => updatePageRotation && updatePageRotation(page.pageNumber, (page.rotation || 0) - 90)}
            >
              <RotateCcw size={16}/>
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full"
              title="Rotate Right"
              onClick={() => updatePageRotation && updatePageRotation(page.pageNumber, (page.rotation || 0) + 90)}
            >
              <RotateCw size={16} />
            </Button>
          </div>

          {page.isLoading ? (
            <div className="flex items-center justify-center w-full h-44 bg-muted">
              <Loader2 className="animate-spin" size={24} />
            </div>
          ) : page.imageUrl ? (
            <img
              src={page.imageUrl}
              alt={`Page ${page.pageNumber}`}
              className="object-contain max-h-44 w-full bg-muted transition-transform duration-300 group-hover:scale-105"
              style={{ transform: `rotate(${page.rotation || 0}deg)` }}
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
        </div>
      ))}
    </div>
  );
}

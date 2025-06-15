
import React, { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { Play, Grid3x3, X as Cross, List } from "lucide-react";
import PageEditor from "./PageEditor";
import LazyBookGrid from "./LazyBookGrid";

export default function FullPagePreview() {
  const [showGrid, setShowGrid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { metadata, renderPage, pdfFile, clearMetadata: onClear, progress } = useSharedLazyPdfProcessor();

  const observerRef = useRef<IntersectionObserver>();
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    if (!metadata || showGrid) return;

    const currentObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageNumber = parseInt(entry.target.getAttribute('data-page-number') || '0', 10);
            if (pageNumber > 0) {
              const pageData = metadata.pages.find((p: any) => p.pageNumber === pageNumber);
              if (pdfFile && pageData && !pageData.imageUrl && !pageData.isLoading) {
                renderPage(pageNumber).catch(console.error);
              }
            }
          }
        });
      },
      { rootMargin: '400px' }
    );
    observerRef.current = currentObserver;

    metadata.pages.forEach((page: any) => {
      const pageElement = pageRefs.current.get(page.pageNumber);
      if (pageElement) {
        currentObserver.observe(pageElement);
      }
    });

    return () => currentObserver.disconnect();
  }, [metadata, pdfFile, renderPage, showGrid]);


  if (!metadata) return null;

  const totalPages = metadata.totalPages;

  const handleProcess = () => {
    setIsProcessing(true);
    // Start processing all pages in background
    if(!pdfFile) {
        // For non-pdf files, all pages are already processed
        setIsProcessing(false);
        return;
    }
    for (let i = 1; i <= totalPages; i++) {
        renderPage(i).catch(console.error);
    }
    // The button state will be updated by progress changes
  };

  useEffect(() => {
    if (progress === 100) {
        setIsProcessing(false);
    }
  }, [progress]);

  return (
    <div className="w-full flex flex-col items-center gap-8 py-8">
      {/* Header Card */}
      <Card className="w-full max-w-7xl p-4 sm:p-8 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className="font-bold text-2xl sm:text-4xl text-amber-900 tracking-wide uppercase">
              {metadata.title || 'Text Document'}
            </h1>
            <p className="text-base sm:text-xl text-amber-700 mt-2 font-medium">
              {totalPages} Pages • Knowledge Preserved
            </p>
          </div>
          <div className="flex items-start flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex flex-col w-full sm:w-auto">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg"
                onClick={handleProcess}
                disabled={isProcessing || progress === 100}
              >
                <Play size={20} className="mr-2 hidden sm:inline-block" />
                {isProcessing ? `Processing... ${progress}%` : progress === 100 ? 'All Pages Processed' : 'Process All Pages'}
              </Button>
              {(isProcessing || progress > 0) && <Progress value={progress} className="h-2 mt-2" />}
            </div>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4"
              onClick={() => setShowGrid(s => !s)}
            >
              {showGrid ? <List size={20} className="mr-2 hidden sm:inline-block" /> : <Grid3x3 size={20} className="mr-2 hidden sm:inline-block" />}
              {showGrid ? "List View" : "Grid View"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <div className="relative flex flex-col items-center gap-8 w-full max-w-7xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-4 -right-2 sm:top-0 sm:right-0 z-10 h-12 w-12 rounded-full bg-amber-200/80 hover:bg-amber-300/90 text-amber-900"
          onClick={onClear}
          title="Close Preview"
        >
          <Cross size={28} />
        </Button>
        
        {showGrid ? (
            <Suspense fallback={<div className="text-amber-400 text-xl">Loading grid...</div>}>
                <LazyBookGrid />
            </Suspense>
        ) : (
          <div className="flex flex-col items-center gap-12 w-full">
            {metadata.pages.map((pageData: any) => (
              <div
                key={pageData.pageNumber}
                ref={el => el && pageRefs.current.set(pageData.pageNumber, el)}
                data-page-number={pageData.pageNumber}
                className="w-full flex flex-col items-center"
              >
                <h3 className="text-xl font-bold text-amber-800 mb-4 bg-amber-200/70 px-4 py-1 rounded-full">
                    Page {pageData.pageNumber}
                </h3>
                <div className="relative flex justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-200 p-4 sm:p-8 w-full">
                  {pageData?.isLoading ? (
                    <div className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse rounded-xl border-2 border-amber-300 w-full min-h-[60vh]">
                      <div className="text-center">
                        <div className="text-2xl text-amber-800 font-bold mb-2">Processing Page {pageData.pageNumber}...</div>
                        <div className="text-lg text-amber-600">The spice must flow...</div>
                      </div>
                    </div>
                  ) : pageData?.imageUrl ? (
                    <PageEditor imageUrl={pageData.imageUrl} />
                  ) : (
                    <div className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-dashed border-amber-400 rounded-xl w-full min-h-[60vh]">
                      <div className="text-center">
                        <div className="text-3xl text-amber-800 font-bold mb-2">Page {pageData.pageNumber}</div>
                        <div className="text-xl text-amber-600">Ready to be processed</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { ChevronLeft, ChevronRight, Play, Grid3x3, X as Cross } from "lucide-react";
import PageEditor from "./PageEditor";

export default function FullPagePreview() {
  const [currentPage, setCurrentPage] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { metadata, renderPage, pdfFile, clearMetadata: onClear } = useSharedLazyPdfProcessor();

  useEffect(() => {
    if (!metadata) return;
    const pageData = metadata.pages.find((p: any) => p.pageNumber === currentPage);
    if (pdfFile && pageData && !pageData.imageUrl && !pageData.isLoading) {
      renderPage(currentPage).catch(console.error);
    }
  }, [pdfFile, metadata, currentPage, renderPage]);

  if (showGrid) {
    const LazyBookGrid = React.lazy(() => import("./LazyBookGrid"));
    return (
      <React.Suspense fallback={<div className="text-amber-400 text-xl">Loading grid...</div>}>
        <LazyBookGrid pdfFile={pdfFile} />
      </React.Suspense>
    );
  }

  if (!metadata) return null;

  const currentPageData = metadata.pages.find((p: any) => p.pageNumber === currentPage);
  const totalPages = metadata.totalPages;

  const handleProcess = () => {
    setIsProcessing(true);
    // Start processing all pages in background
    for (let i = 1; i <= Math.min(totalPages, 10); i++) {
      if (pdfFile) {
        renderPage(i).catch(console.error);
      }
    }
    setTimeout(() => setIsProcessing(false), 3000);
  };

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
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              <Play size={20} className="mr-2 hidden sm:inline-block" />
              {isProcessing ? 'Processing...' : 'Process All Pages'}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4"
              onClick={() => setShowGrid(true)}
            >
              <Grid3x3 size={20} className="mr-2 hidden sm:inline-block" />
              Grid View
            </Button>
          </div>
        </div>
      </Card>

      {/* Main Page Editor */}
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
        
        <div className="relative flex justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-200 p-4 sm:p-8 w-full">
          {currentPageData?.isLoading ? (
            <div 
              className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse rounded-xl border-2 border-amber-300 w-full min-h-[60vh]"
            >
              <div className="text-center">
                <div className="text-2xl text-amber-800 font-bold mb-2">Processing Page {currentPage}...</div>
                <div className="text-lg text-amber-600">The spice must flow...</div>
              </div>
            </div>
          ) : currentPageData?.imageUrl ? (
            <PageEditor imageUrl={currentPageData.imageUrl} />
          ) : (
            <div 
              className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-dashed border-amber-400 rounded-xl w-full min-h-[60vh]"
            >
              <div className="text-center">
                <div className="text-3xl text-amber-800 font-bold mb-2">Page {currentPage}</div>
                <div className="text-xl text-amber-600">Ready to be processed</div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-2 sm:gap-8 flex-wrap justify-center">
          <Button
            size="default"
            variant="outline"
            className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold text-base sm:text-lg px-4 py-2 sm:px-6 sm:py-4"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={24} />
            Previous
          </Button>
          
          <div className="bg-gradient-to-r from-amber-200 to-orange-200 px-4 py-2 sm:px-8 sm:py-4 rounded-xl border-2 border-amber-400 shadow-lg order-first sm:order-none w-full sm:w-auto text-center">
            <span className="text-xl sm:text-2xl font-bold text-amber-900 font-mono">
              Page {currentPage} of {totalPages}
            </span>
          </div>
          
          <Button
            size="default"
            variant="outline"
            className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold text-base sm:text-lg px-4 py-2 sm:px-6 sm:py-4"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight size={24} />
          </Button>
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLazyPdfProcessor } from "@/hooks/useLazyPdfProcessor";
import { ChevronLeft, ChevronRight, Play, Grid3x3 } from "lucide-react";

interface FullPagePreviewProps {
  metadata: any;
}

export default function FullPagePreview({ metadata }: FullPagePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { renderPage } = useLazyPdfProcessor();

  // Get current file from uploader context if needed
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // Auto-render first page on load
  useEffect(() => {
    if (currentFile && metadata && currentPage === 1) {
      const firstPage = metadata.pages.find((p: any) => p.pageNumber === 1);
      if (firstPage && !firstPage.imageUrl && !firstPage.isLoading) {
        renderPage(1, currentFile).catch(console.error);
      }
    }
  }, [currentFile, metadata, currentPage, renderPage]);

  if (showGrid) {
    const LazyBookGrid = React.lazy(() => import("./LazyBookGrid"));
    return (
      <React.Suspense fallback={<div className="text-amber-400 text-xl">Loading grid...</div>}>
        <LazyBookGrid pdfFile={currentFile} />
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
      if (currentFile) {
        renderPage(i, currentFile).catch(console.error);
      }
    }
    setTimeout(() => setIsProcessing(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100 py-12">
      <div className="flex flex-col items-center gap-12 w-full max-w-7xl mx-auto px-4 sm:px-8">
        {/* Dune-style Header */}
        <Card className="w-full p-4 sm:p-8 bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-2xl">
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

        {/* Main Page Preview - Dune Style */}
        <div className="relative flex flex-col items-center gap-8 w-full">
          <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-200 p-4 sm:p-8 max-w-4xl w-full">
            {currentPageData?.isLoading ? (
              <div 
                className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse rounded-xl border-2 border-amber-300 w-full"
                style={{ 
                  aspectRatio: `${currentPageData.width} / ${currentPageData.height}`
                }}
              >
                <div className="text-center">
                  <div className="text-2xl text-amber-800 font-bold mb-2">Processing Page {currentPage}...</div>
                  <div className="text-lg text-amber-600">The spice must flow...</div>
                </div>
              </div>
            ) : currentPageData?.imageUrl ? (
              <img
                src={currentPageData.imageUrl}
                alt={`Page ${currentPage}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
              />
            ) : (
              <div 
                className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-dashed border-amber-400 rounded-xl w-full"
                style={{ 
                  aspectRatio: `${currentPageData?.width || 3} / ${currentPageData?.height || 4}`,
                  minHeight: '400px',
                }}
              >
                <div className="text-center">
                  <div className="text-3xl text-amber-800 font-bold mb-2">Page {currentPage}</div>
                  <div className="text-xl text-amber-600">Ready to be processed</div>
                </div>
              </div>
            )}
          </div>

          {/* Dune-style Navigation */}
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

          {/* Dune-style Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-4">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg"
            >
              Begin Crop
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg"
            >
              Extract Text (OCR)
            </Button>
            <Button 
              size="lg"
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base sm:text-lg px-6 py-3 sm:px-8 sm:py-4 shadow-lg"
            >
              Export Wisdom
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

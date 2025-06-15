
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLazyPdfProcessor } from "@/hooks/useLazyPdfProcessor";
import { ChevronLeft, ChevronRight, Play, Grid3x3, Crop, RotateCcw, Download } from "lucide-react";

interface FullPagePreviewProps {
  pdfFile: File | null;
  metadata: any;
}

export default function FullPagePreview({ pdfFile, metadata }: FullPagePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showGrid, setShowGrid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { renderPage } = useLazyPdfProcessor();

  // Auto-render first page on load
  useEffect(() => {
    if (pdfFile && metadata && currentPage === 1) {
      const firstPage = metadata.pages.find((p: any) => p.pageNumber === 1);
      if (firstPage && !firstPage.imageUrl && !firstPage.isLoading) {
        renderPage(1, pdfFile).catch(console.error);
      }
    }
  }, [pdfFile, metadata, currentPage, renderPage]);

  // Render current page when changed
  useEffect(() => {
    if (pdfFile && metadata) {
      const page = metadata.pages.find((p: any) => p.pageNumber === currentPage);
      if (page && !page.imageUrl && !page.isLoading) {
        renderPage(currentPage, pdfFile).catch(console.error);
      }
    }
  }, [currentPage, pdfFile, metadata, renderPage]);

  if (showGrid) {
    const LazyBookGrid = React.lazy(() => import("./LazyBookGrid"));
    return (
      <React.Suspense fallback={<div>Loading grid...</div>}>
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
        renderPage(i, pdfFile).catch(console.error);
      }
    }
    setTimeout(() => setIsProcessing(false), 2000);
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-4xl mx-auto px-4">
      {/* Header with file info and controls */}
      <Card className="w-full p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{metadata.title || 'PDF Document'}</h3>
            <p className="text-sm text-muted-foreground">{totalPages} pages • {(pdfFile?.size || 0 / 1024 / 1024).toFixed(1)}MB</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleProcess}
              disabled={isProcessing}
            >
              <Play size={16} className="mr-1" />
              {isProcessing ? 'Processing...' : 'Process All'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowGrid(true)}
            >
              <Grid3x3 size={16} className="mr-1" />
              Grid View
            </Button>
          </div>
        </div>
      </Card>

      {/* Main page preview */}
      <div className="relative flex flex-col items-center gap-4 w-full">
        <div className="relative bg-white rounded-lg shadow-lg border p-4 max-w-full overflow-hidden">
          {currentPageData?.isLoading ? (
            <div 
              className="flex items-center justify-center bg-muted animate-pulse"
              style={{ 
                width: Math.min(600, currentPageData.width * 0.6),
                height: Math.min(800, currentPageData.height * 0.6)
              }}
            >
              <span className="text-muted-foreground">Loading page {currentPage}...</span>
            </div>
          ) : currentPageData?.imageUrl ? (
            <img
              src={currentPageData.imageUrl}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-[70vh] object-contain"
              style={{ 
                maxWidth: '600px'
              }}
            />
          ) : (
            <div 
              className="flex items-center justify-center bg-muted border-2 border-dashed"
              style={{ 
                width: Math.min(600, currentPageData?.width * 0.6 || 400),
                height: Math.min(800, currentPageData?.height * 0.6 || 600)
              }}
            >
              <span className="text-muted-foreground">Page {currentPage}</span>
            </div>
          )}
        </div>

        {/* Page navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <span className="text-sm font-mono bg-muted px-3 py-1 rounded">
            Page {currentPage} of {totalPages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight size={16} />
          </Button>
        </div>

        {/* Quick edit actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Crop size={16} className="mr-1" />
            Crop
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw size={16} className="mr-1" />
            Rotate
          </Button>
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-1" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}

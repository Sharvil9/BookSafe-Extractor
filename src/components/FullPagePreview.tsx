import React, { useState, useEffect, useRef, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { Play, Grid3x3, X as Cross, List, Download, ScanText, FileText } from "lucide-react";
import PageEditor from "./PageEditor";
import LazyBookGrid from "./LazyBookGrid";
import { Textarea } from "./ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";


// Import the PdfPage interface
interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  imageUrl?: string;
  isLoading?: boolean;
  rotation?: number;
  croppedImageUrl?: string;
}

export default function FullPagePreview() {
  const [showGrid, setShowGrid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrResult, setOcrResult] = useState("");
  const [showOcrEditor, setShowOcrEditor] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { metadata, renderPage, pdfFile, clearMetadata: onClear, progress } = useSharedLazyPdfProcessor();

  const observerRef = useRef<IntersectionObserver>();
  const pageRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleProcess = async () => {
    if (!metadata) return;

    const croppedPages = metadata.pages.filter(p => p.croppedImageUrl);

    if (croppedPages.length === 0) {
        alert("Please crop at least one page before extracting text.");
        return;
    }

    setIsProcessing(true);
    setOcrProgress(0);
    setOcrResult("");

    const Tesseract = await import('tesseract.js');
    const scheduler = Tesseract.createScheduler();
    const workerCount = Math.max(1, (navigator.hardwareConcurrency || 4) - 1); // Leave one core for UI

    const workers = await Promise.all(Array(workerCount).fill(0).map(() => 
        Tesseract.createWorker('eng').then(w => {
            scheduler.addWorker(w);
            return w;
        })
    ));

    const results = new Array(croppedPages.length);
    let completedPages = 0;

    await Promise.all(croppedPages.map((page, index) => {
        if (page.croppedImageUrl) {
            return scheduler.addJob('recognize', page.croppedImageUrl).then(({ data: { text } }) => {
                results[index] = `--- Page ${page.pageNumber} ---\n\n${text}\n\n`;
                completedPages++;
                setOcrProgress(Math.round((completedPages / croppedPages.length) * 100));
            });
        }
        return Promise.resolve();
    }));

    await scheduler.terminate();

    setOcrResult(results.join(""));
    setShowOcrEditor(true);
    setIsProcessing(false);
  };

  const handleDownloadText = () => {
    const blob = new Blob([ocrResult], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${metadata?.title?.replace('.pdf', '') || 'ocr-result'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (progress === 100) {
        setIsProcessing(false);
    }
  }, [progress]);

  return (
    <div className="w-full flex flex-col items-center gap-8 py-4">
      {/* Header Card */}
      <Card className={`w-full max-w-7xl bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-amber-300 shadow-2xl sticky top-4 z-30 transition-all duration-300 ease-in-out ${isScrolled ? 'p-3 sm:p-4' : 'p-4 sm:p-8'}`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h1 className={`font-bold text-amber-900 tracking-wide transition-all duration-300 ease-in-out ${isScrolled ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'}`}>
              {metadata.title || 'Text Document'}
            </h1>
            <p className={`text-amber-700 font-medium transition-all duration-300 ease-in-out ${isScrolled ? 'text-sm sm:text-base mt-1' : 'text-base sm:text-xl mt-2'}`}>
              {totalPages} Pages • Knowledge Preserved
            </p>
          </div>
          <div className="flex items-center flex-col sm:flex-row gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
                <div className="flex flex-col w-full sm:w-auto">
                <Button 
                    size={isScrolled ? 'default' : 'lg'}
                    className={`bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold shadow-lg transition-all ${isScrolled ? 'text-sm' : 'text-base sm:text-lg'}`}
                    onClick={handleProcess}
                    disabled={isProcessing}
                >
                    <ScanText size={isScrolled ? 18 : 20} className="mr-2 hidden sm:inline-block" />
                    {isProcessing ? `Extracting... ${ocrProgress}%` : 'Extract Text'}
                </Button>
                {isProcessing && <Progress value={ocrProgress} className="h-2 mt-2" />}
                </div>
                {ocrResult && !isProcessing && (
                <Button
                    size={isScrolled ? 'default' : 'lg'}
                    variant="outline"
                    className={`bg-amber-100 text-amber-800 border-2 border-amber-500 font-bold transition-all ${isScrolled ? 'text-sm' : 'text-base sm:text-lg'}`}
                    onClick={() => setShowOcrEditor(true)}
                >
                    <FileText size={isScrolled ? 18 : 20} className="mr-2 hidden sm:inline-block" />
                    View Text
                </Button>
                )}
            </div>
            <Button 
              size={isScrolled ? 'default' : 'lg'}
              variant="outline"
              className={`border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold transition-all ${isScrolled ? 'text-sm' : 'text-base sm:text-lg'}`}
              onClick={() => setShowGrid(s => !s)}
            >
              {showGrid ? <List size={isScrolled ? 18 : 20} className="mr-2 hidden sm:inline-block" /> : <Grid3x3 size={isScrolled ? 18 : 20} className="mr-2 hidden sm:inline-block" />}
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
            {metadata.pages.map((pageData: PdfPage) => (
              <div
                key={pageData.pageNumber}
                ref={el => el && pageRefs.current.set(pageData.pageNumber, el)}
                data-page-number={pageData.pageNumber}
                className="w-full flex flex-col items-center"
              >
                <h3 className="text-xl font-bold text-amber-800 mb-4 bg-amber-200/70 px-4 py-1 rounded-full">
                    Page {pageData.pageNumber}
                </h3>
                <div className="relative flex justify-center bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl shadow-2xl border-4 border-amber-200 p-2 sm:p-4 w-full">
                  {pageData?.isLoading ? (
                    <div className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 animate-pulse rounded-xl border-2 border-amber-300 w-full min-h-[50vh]">
                      <div className="text-center">
                        <div className="text-2xl text-amber-800 font-bold mb-2">Processing Page {pageData.pageNumber}...</div>
                        <div className="text-lg text-amber-600">The spice must flow...</div>
                      </div>
                    </div>
                  ) : pageData?.imageUrl ? (
                    <PageEditor pageData={pageData} />
                  ) : (
                    <div className="flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-dashed border-amber-400 rounded-xl w-full min-h-[50vh]">
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

      {/* OCR Editor Dialog */}
      <Dialog open={showOcrEditor} onOpenChange={setShowOcrEditor}>
        <DialogContent className="max-w-4xl w-full h-[80vh] flex flex-col bg-gradient-to-br from-amber-50 to-orange-50">
            <DialogHeader>
                <DialogTitle className="text-2xl sm:text-3xl font-bold text-amber-900">Extracted Text</DialogTitle>
            </DialogHeader>
            <div className="flex-grow overflow-y-auto pr-2">
                <Textarea 
                    value={ocrResult}
                    onChange={(e) => setOcrResult(e.target.value)}
                    className="w-full min-h-full bg-white border-amber-300 focus:ring-amber-500 text-base p-4 rounded-lg"
                    placeholder="Editable OCR text..."
                />
            </div>
            <DialogFooter className="mt-4">
                <Button onClick={handleDownloadText} className="bg-amber-600 hover:bg-amber-700 text-white">
                    <Download size={18} className="mr-2"/>
                    Download .txt
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useMultiCoreProcessor } from "@/hooks/useMultiCoreProcessor";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";
import { Image, File, LoaderCircle, Cpu, Zap } from "lucide-react";

export default function BookUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedNames, setImportedNames] = useState<string[]>([]);
  const [useLazyLoading, setUseLazyLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    progress: multiCoreProgress, 
    loading: multiCoreLoading, 
    results, 
    processPDF, 
    processImages, 
    workerCount 
  } = useMultiCoreProcessor();

  const {
    metadata,
    loading: lazyLoading,
    progress: lazyProgress,
    loadPdfMetadata,
    loadProcessedPages,
  } = useSharedLazyPdfProcessor();

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }, []);

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    
    // Clear previous imports
    setImportedNames([]);
    setUseLazyLoading(false);
    
    setImportedNames([...files].map(f => f.name));
    
    try {
      const file = files[0];
      
      if (file.type === "application/pdf") {
        // For PDFs larger than 10MB, use lazy loading
        if (file.size > 10 * 1024 * 1024) {
          console.log('Large PDF detected, using lazy loading approach');
          setUseLazyLoading(true);
          // Start preprocessing immediately
          await loadPdfMetadata(file);
        } else {
          console.log(`Processing PDF with ${workerCount} parallel workers`);
          setUseLazyLoading(false);
          const pages = await processPDF(file);
          loadProcessedPages(pages, file.name);
        }
      } else if (files[0].type.startsWith("image/")) {
        console.log(`Processing ${files.length} images with ${workerCount} parallel workers`);
        setUseLazyLoading(false);
        const pages = await processImages(files);
        loadProcessedPages(pages, files.length > 1 ? `${files.length} images` : files[0].name);
      } else {
        setError("Unsupported file type—please import a PDF or image file.");
        setImportedNames([]);
        return;
      }
    } catch (e: any) {
      console.error('Processing error:', e);
      setError(e.message || "The file resisted... Please try again.");
      setImportedNames([]);
      setUseLazyLoading(false);
    }
  };

  const isLoading = multiCoreLoading || lazyLoading;
  const progress = useLazyLoading ? lazyProgress : multiCoreProgress;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dune-style Performance indicator */}
      <div className="flex items-center gap-3 text-lg text-amber-700 mb-4 font-medium">
        {useLazyLoading ? (
          <>
            <Zap size={20} />
            <span>Spice-enhanced processing for maximum efficiency</span>
          </>
        ) : (
          <>
            <Cpu size={20} />
            <span>Harnessing {workerCount} processing cores (up to 8)</span>
          </>
        )}
      </div>

      <div
        className={`relative flex flex-col items-center justify-center rounded-3xl border-4 border-dashed transition-all duration-300 w-full max-w-2xl min-h-[200px] p-6 sm:p-12
        ${
          dragActive
            ? "bg-gradient-to-br from-amber-100 to-orange-100 border-amber-500 shadow-2xl"
            : "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-lg"
        }
        `}
        onDragOver={e => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={e => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={onDrop}
        tabIndex={0}
        aria-label="File import area"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-8">
          <span className="bg-gradient-to-br from-amber-200 to-orange-200 rounded-full p-4 sm:p-6 shadow-lg border-2 border-amber-400">
            <File size={48} strokeWidth={2} className="text-amber-800" />
          </span>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-base sm:text-xl px-8 py-4 sm:px-12 sm:py-6 shadow-xl"
            disabled={isLoading}
            onClick={() => inputRef.current?.click()}
          >
            {isLoading ? (
              <span className="flex items-center gap-3 animate-pulse">
                <LoaderCircle className="animate-spin" size={24} />
                {useLazyLoading ? 'Analyzing Document...' : 'Processing Files...'}
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <File size={24} />
                Import Files
              </span>
            )}
          </Button>
          <div className="text-base sm:text-lg text-amber-700 text-center font-medium">
            Drag and drop your files, or click the button above <br className="hidden sm:block" />
            <span className="flex items-center gap-2 mt-3 justify-center">
              <File size={18} className="inline" /> PDFs 
              <span className="mx-2 text-amber-500">|</span>
              <Image size={18} className="inline" /> Images (JPG, PNG)
            </span>
          </div>
        </div>
        {isLoading && (
          <div className="w-full mt-8">
            <Progress value={progress} className="h-3" />
            <div className="text-base sm:text-lg text-amber-700 text-center mt-4 font-bold">
              {useLazyLoading ? (
                <>Analyzing document structure... {progress}%</>
              ) : (
                <>Processing with the power of {workerCount} cores... {progress}%</>
              )}
            </div>
            {!useLazyLoading && results.length > 0 && (
              <div className="text-lg text-orange-600 text-center mt-2 font-medium">
                {results.length} pages have been processed
              </div>
            )}
            {useLazyLoading && metadata && (
              <div className="text-lg text-green-600 text-center mt-2 font-bold">
                Discovered {metadata.totalPages} pages - Ready for preview!
              </div>
            )}
          </div>
        )}
      </div>
      {importedNames.length > 0 && !isLoading && (
        <div className="mt-6 text-amber-800 flex flex-col sm:flex-row flex-wrap gap-3 items-center text-base sm:text-lg">
          <span className="font-bold text-lg sm:text-xl">File Imported:</span>
          {importedNames.map((name, i) => (
            <span key={i} className="inline-block bg-gradient-to-r from-amber-200 to-orange-200 border-2 border-amber-400 text-amber-800 px-4 py-2 rounded-xl font-medium shadow-md">
              {name}
            </span>
          ))}
          {(useLazyLoading || metadata) && (
            <span className="inline-block bg-gradient-to-r from-green-200 to-emerald-200 border-2 border-green-400 text-green-800 px-4 py-2 rounded-xl font-bold shadow-md">
              Ready for Preview
            </span>
          )}
        </div>
      )}
      {error && (
        <span className="text-red-600 text-lg mt-3 font-medium bg-red-100 px-4 py-2 rounded-lg border border-red-300">{error}</span>
      )}
    </div>
  );
}

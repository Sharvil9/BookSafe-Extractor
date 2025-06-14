
import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBook } from "./BookContext";
import { useMultiCoreProcessor } from "@/hooks/useMultiCoreProcessor";
import { Image, File, LoaderCircle, Cpu } from "lucide-react";

export default function BookUploader() {
  const { setPages } = useBook();
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [importedNames, setImportedNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { 
    progress, 
    loading, 
    results, 
    processPDF, 
    processImages, 
    workerCount 
  } = useMultiCoreProcessor();

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    
    setImportedNames([...files].map(f => f.name));
    
    try {
      const file = files[0];
      let pages;
      
      if (file.type === "application/pdf") {
        console.log(`Processing PDF with ${workerCount} parallel workers`);
        pages = await processPDF(file);
      } else if (file.type.startsWith("image/")) {
        console.log(`Processing ${files.length} images with ${workerCount} parallel workers`);
        pages = await processImages(files);
      } else {
        setError("Unsupported file type—please import PDF or images.");
        setImportedNames([]);
        return;
      }
      
      setPages(pages);
    } catch (e) {
      console.error('Processing error:', e);
      setError("There was an error processing your file(s).");
      setImportedNames([]);
    }
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Performance indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
        <Cpu size={14} />
        <span>Using {workerCount} CPU cores for parallel processing</span>
      </div>

      <div
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 w-full max-w-lg min-h-[120px] p-6
        ${
          dragActive
            ? "bg-accent border-primary"
            : "bg-white border-muted"
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
        aria-label="Import area"
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/*"
          multiple
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-3">
          <span className="bg-muted rounded-full p-2 mb-2 text-primary">
            <File size={32} strokeWidth={2} />
          </span>
          <Button
            variant="default"
            className="font-medium px-6"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <span className="flex items-center gap-2 animate-pulse">
                <LoaderCircle className="animate-spin" size={19} />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <File size={19} />
                Import PDF or Images
              </span>
            )}
          </Button>
          <div className="text-xs text-muted-foreground mt-2 mb-0 text-center">
            Drag and drop, or click the button. <br />
            <span className="flex items-center gap-1 mt-1">
              <File size={14} className="inline" /> PDF 
              <span className="mx-1">|</span>
              <Image size={14} className="inline" /> Images (JPG, PNG)
            </span>
          </div>
        </div>
        {loading && (
          <div className="w-full mt-6">
            <Progress value={progress} />
            <div className="text-xs text-muted-foreground text-center mt-2 font-mono">
              Processing with {workerCount} workers... {progress}%
            </div>
            {results.length > 0 && (
              <div className="text-xs text-primary text-center mt-1">
                {results.length} pages processed
              </div>
            )}
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-dashed transition 
          " style={{
            borderColor: dragActive ? 'var(--primary)' : 'transparent',
            opacity: dragActive ? 1 : 0
          }} aria-hidden={!dragActive}></div>
      </div>
      {importedNames.length > 0 && !loading && (
        <div className="mt-2 text-primary flex flex-wrap gap-2 items-center text-xs">
          <span className="font-semibold">Imported:</span>
          {importedNames.map((name, i) => (
            <span key={i} className="inline-block bg-muted px-2 py-0.5 rounded">
              {name}
            </span>
          ))}
        </div>
      )}
      {error && (
        <span className="text-destructive text-xs mt-1">{error}</span>
      )}
    </div>
  );
}

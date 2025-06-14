
import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBook } from "./BookContext";
import { Image, File, LoaderCircle } from "lucide-react";

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

async function parsePDF(file: File, onProgress?: (p: number) => void): Promise<{ imageUrl: string; name: string }[]> {
  const pdfjsLib = await import("pdfjs-dist/build/pdf");
  await import("pdfjs-dist/build/pdf.worker.entry");
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages: { imageUrl: string; name: string }[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context, viewport }).promise;
    pages.push({
      imageUrl: canvas.toDataURL("image/png"),
      name: `Page ${i}`,
    });
    if (onProgress) onProgress(Math.round((i / pdf.numPages) * 100));
  }
  return pages;
}

export default function BookUploader() {
  const { setPages } = useBook();
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [importedNames, setImportedNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    setImportProgress(0);
    if (!files || files.length === 0) return;
    setImporting(true);
    setImportedNames([...files].map(f => f.name));
    try {
      const file = files[0];
      if (file.type === "application/pdf") {
        // Import PDF, live update
        const pages = await parsePDF(file, (p) => setImportProgress(p));
        setPages(pages);
      } else if (file.type.startsWith("image/")) {
        // Import as images, update progress per image
        let count = 0;
        const total = files.length;
        const allPages = await Promise.all([...files].map(async (img, idx) => {
          const imageUrl = await fileToDataUrl(img);
          count++;
          setImportProgress(Math.round((count / total) * 100));
          return {
            imageUrl,
            name: img.name || `Image ${idx + 1}`,
          };
        }));
        setPages(allPages);
      } else {
        setError("Unsupported file type—please import PDF or images.");
        setImportedNames([]);
      }
      setImportProgress(100);
    } catch (e) {
      setError("There was an error processing your file(s).");
      setImportedNames([]);
    } finally {
      setTimeout(() => setImporting(false), 400); // UX: let progress bar finish
    }
  };

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragActive(false);
    handleFiles(event.dataTransfer.files);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1">
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
            disabled={importing}
            onClick={() => inputRef.current?.click()}
          >
            {importing ? (
              <span className="flex items-center gap-2 animate-pulse">
                <LoaderCircle className="animate-spin" size={19} />
                Importing...
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
        {importing && (
          <div className="w-full mt-6">
            <Progress value={importProgress} />
            <div className="text-xs text-muted-foreground text-center mt-2 font-mono">
              Importing... {importProgress}%
            </div>
          </div>
        )}
        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-dashed transition 
          " style={{
            borderColor: dragActive ? 'var(--primary)' : 'transparent',
            opacity: dragActive ? 1 : 0
          }} aria-hidden={!dragActive}></div>
      </div>
      {importedNames.length > 0 && !importing && (
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

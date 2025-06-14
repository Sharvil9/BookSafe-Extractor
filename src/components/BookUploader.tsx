
import React, { useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useBook } from "./BookContext";
import { Upload, Image, File } from "lucide-react";

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

async function parsePDF(file: File): Promise<{ imageUrl: string; name: string }[]> {
  // Lazy import for performance
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
  }
  return pages;
}

export default function BookUploader() {
  const { setPages } = useBook();
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedNames, setUploadedNames] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    setError(null);
    if (!files || files.length === 0) return;
    setLoading(true);
    setUploadedNames([...files].map(f => f.name));
    try {
      const file = files[0];
      if (file.type === "application/pdf") {
        const pages = await parsePDF(file);
        setPages(pages);
      } else if (file.type.startsWith("image/")) {
        // Single or multiple images
        const allPages = await Promise.all([...files].map(async (img, idx) => ({
          imageUrl: await fileToDataUrl(img),
          name: img.name || `Image ${idx + 1}`,
        })));
        setPages(allPages);
      } else {
        setError("Unsupported file type—please upload PDF or images.");
        setUploadedNames([]);
      }
    } catch (e) {
      setError("There was an error processing your file(s).");
      setUploadedNames([]);
    } finally {
      setLoading(false);
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
        aria-label="Upload area"
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
            <Upload size={32} strokeWidth={2} />
          </span>
          <Button
            variant="default"
            className="font-medium px-6"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? (
              <span className="flex items-center gap-2 animate-pulse">
                <Upload className="animate-bounce" size={19} />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload size={19} />
                Upload PDF or Images
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
        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-dashed transition 
          " style={{
            borderColor: dragActive ? 'var(--primary)' : 'transparent',
            opacity: dragActive ? 1 : 0
          }} aria-hidden={!dragActive}></div>
      </div>
      {uploadedNames.length > 0 && !loading && (
        <div className="mt-2 text-primary flex flex-wrap gap-2 items-center text-xs">
          <span className="font-semibold">Uploaded:</span>
          {uploadedNames.map((name, i) => (
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

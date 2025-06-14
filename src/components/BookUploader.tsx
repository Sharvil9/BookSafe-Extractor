
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useBook } from "./BookContext";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

async function parsePDF(file: File): Promise<{ imageUrl: string; name: string }[]> {
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
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
      alert("Unsupported file type!");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/*"
        multiple
        style={{ display: "none" }}
        onChange={e => handleFiles(e.target.files)}
      />
      <Button variant="default" onClick={() => inputRef.current?.click()}>
        Upload PDF or Images
      </Button>
      <div className="text-sm text-muted-foreground">
        Supported: PDF (all pages), Image files (one or many)
      </div>
    </div>
  );
}

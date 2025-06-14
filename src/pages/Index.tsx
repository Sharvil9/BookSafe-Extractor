
import React from "react";
import { BookProvider } from "@/components/BookContext";
import BookUploader from "@/components/BookUploader";
import BookPagePreview from "@/components/BookPagePreview";

export default function Index() {
  return (
    <BookProvider>
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-background px-2">
        <div className="max-w-2xl w-full mx-auto flex flex-col gap-8 pt-8">
          <header className="flex flex-col items-center gap-2">
            <span className="inline-block text-primary">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="8" width="32" height="24" rx="4" fill="white" stroke="currentColor" />
                <rect x="10" y="14" width="20" height="12" rx="2" fill="#f7f7f7" />
              </svg>
            </span>
            <h1 className="font-semibold text-3xl tracking-tight text-center">
              Book Crop & OCR Tool
            </h1>
            <p className="text-muted-foreground text-center text-base max-w-xl">
              Minimalistic tool to crop, remove, OCR and export book pages—all processed locally on your device.
            </p>
          </header>
          <BookUploader />
          <BookPagePreview />
          {/* Later: Cropping controls, OCR controls, Export */}
        </div>
      </div>
    </BookProvider>
  );
}

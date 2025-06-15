
import React from "react";
import { BookProvider } from "@/components/BookContext";
import BookUploader from "@/components/BookUploader";
import BookPagePreview from "@/components/BookPagePreview";

export default function Index() {
  return (
    <BookProvider>
      <div className="min-h-screen w-full flex flex-col items-center justify-start bg-gradient-to-b from-amber-50 via-orange-50 to-yellow-100 px-4">
        <div className="max-w-6xl w-full mx-auto flex flex-col gap-8 sm:gap-16 pt-8 sm:pt-12">
          <header className="flex flex-col items-center gap-6">
            <span className="inline-block text-amber-600">
              <svg width="60" height="60" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="8" y="12" width="48" height="36" rx="6" fill="white" stroke="currentColor" />
                <rect x="16" y="20" width="32" height="20" rx="3" fill="#fef3c7" />
              </svg>
            </span>
            <h1 className="font-bold text-4xl sm:text-6xl tracking-tight text-center text-amber-900 uppercase">
              Book Crop & OCR Tool
            </h1>
            <p className="text-amber-700 text-center text-lg sm:text-2xl max-w-4xl font-medium leading-relaxed">
              A tool to crop, remove, OCR and export knowledge—all processed locally on your device with the power of the spice.
            </p>
          </header>
          <BookUploader />
          <BookPagePreview />
        </div>
      </div>
    </BookProvider>
  );
}

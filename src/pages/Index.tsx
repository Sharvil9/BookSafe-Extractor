import React from "react";
import { BookProvider } from "@/components/BookContext";
import BookUploader from "@/components/BookUploader";
import BookPagePreview from "@/components/BookPagePreview";

export default function Index() {
  return (
    <BookProvider>
      <div className="w-full min-h-screen bg-muted">
        <h1 className="font-bold text-2xl text-center py-8">Book Crop & OCR Tool</h1>
        <BookUploader />
        <BookPagePreview />
        {/* In next steps: Add cropping, removal, OCR and export UI here */}
      </div>
    </BookProvider>
  );
}

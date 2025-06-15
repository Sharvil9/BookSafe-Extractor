import React, { useState } from "react";
import BookGrid from "./BookGrid";
import LazyBookGrid from "./LazyBookGrid";
import { useBook } from "./BookContext";
import { useLazyPdfProcessor } from "@/hooks/useLazyPdfProcessor";

export default function BookPagePreview() {
  const { pages } = useBook();
  const { metadata } = useLazyPdfProcessor();
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // If we have lazy PDF metadata, use LazyBookGrid
  if (metadata) {
    return <LazyBookGrid pdfFile={currentFile} />;
  }

  // Otherwise use regular BookGrid
  return <BookGrid />;
}

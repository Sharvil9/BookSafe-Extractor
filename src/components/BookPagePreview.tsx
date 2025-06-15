
import React, { useState } from "react";
import BookGrid from "./BookGrid";
import LazyBookGrid from "./LazyBookGrid";
import FullPagePreview from "./FullPagePreview";
import { useBook } from "./BookContext";
import { useLazyPdfProcessor } from "@/hooks/useLazyPdfProcessor";

export default function BookPagePreview() {
  const { pages } = useBook();
  const { metadata } = useLazyPdfProcessor();
  const [currentFile, setCurrentFile] = useState<File | null>(null);

  // If we have lazy PDF metadata, show full preview first, then grid
  if (metadata) {
    return <FullPagePreview pdfFile={currentFile} metadata={metadata} />;
  }

  // If we have processed pages, show them in grid
  if (pages.length > 0) {
    return <BookGrid />;
  }

  return null;
}

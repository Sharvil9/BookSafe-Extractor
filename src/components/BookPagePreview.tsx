
import React, { useState } from "react";
import BookGrid from "./BookGrid";
import LazyBookGrid from "./LazyBookGrid";
import FullPagePreview from "./FullPagePreview";
import { useBook } from "./BookContext";
import { useLazyPdfProcessor } from "@/hooks/useLazyPdfProcessor";

export default function BookPagePreview() {
  const { pages } = useBook();
  const { metadata } = useLazyPdfProcessor();

  // Show full preview if we have lazy PDF metadata
  if (metadata) {
    return <FullPagePreview metadata={metadata} />;
  }

  // Show grid if we have processed pages
  if (pages.length > 0) {
    return <BookGrid />;
  }

  return null;
}

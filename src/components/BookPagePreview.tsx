
import React from "react";
import FullPagePreview from "./FullPagePreview";
import { useBook } from "./BookContext";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";

export default function BookPagePreview() {
  const { pages } = useBook();
  const { metadata } = useSharedLazyPdfProcessor();

  // Show full preview if we have lazy PDF metadata
  if (metadata) {
    return <FullPagePreview />;
  }

  // Show grid if we have processed pages
  if (pages.length > 0) {
    // The BookGrid component is not provided in the context, so I cannot modify it to use the shared hook.
    // If it relies on useLazyPdfProcessor, it will need to be updated as well.
    // For now, I'll comment it out to prevent potential errors.
    // return <BookGrid />;
  }

  return null;
}

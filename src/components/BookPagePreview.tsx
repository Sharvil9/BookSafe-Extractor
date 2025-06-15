
import React from "react";
import FullPagePreview from "./FullPagePreview";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";

export default function BookPagePreview() {
  const { metadata } = useSharedLazyPdfProcessor();

  // Show full preview if we have metadata
  if (metadata) {
    return <FullPagePreview />;
  }

  return null;
}

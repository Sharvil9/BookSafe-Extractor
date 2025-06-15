import { useState, useCallback } from 'react';

interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  imageUrl?: string; // Only populated when rendered
  isLoading?: boolean;
}

interface PdfMetadata {
  totalPages: number;
  pages: PdfPage[];
  title?: string;
}

interface ProcessorResult {
  imageUrl: string;
  name: string;
}

export type UseLazyPdfProcessorReturn = ReturnType<typeof useLazyPdfProcessor>;

export function useLazyPdfProcessor() {
  const [metadata, setMetadata] = useState<PdfMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const parsePdfMetadata = useCallback(async (file: File): Promise<PdfMetadata> => {
    const arrayBuffer = await file.arrayBuffer();
    
    // Load PDF.js dynamically
    const pdfjsLib = await import('pdfjs-dist');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const totalPages = pdf.numPages;
    
    // Get page dimensions quickly without rendering
    const pages: PdfPage[] = [];
    for (let i = 1; i <= Math.min(totalPages, 5); i++) { // Sample first 5 pages for dimensions
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 0.1 }); // Very small scale just for dimensions
      pages.push({
        pageNumber: i,
        width: viewport.width * 10, // Scale back up
        height: viewport.height * 10
      });
    }
    
    // Fill remaining pages with estimated dimensions
    const avgWidth = pages.reduce((sum, p) => sum + p.width, 0) / pages.length;
    const avgHeight = pages.reduce((sum, p) => sum + p.height, 0) / pages.length;
    
    for (let i = 6; i <= totalPages; i++) {
      pages.push({
        pageNumber: i,
        width: avgWidth,
        height: avgHeight
      });
    }
    
    return {
      totalPages,
      pages,
      title: file.name
    };
  }, []);

  const loadPdfMetadata = useCallback(async (file: File) => {
    setLoading(true);
    setProgress(0);
    setPdfFile(file);
    
    try {
      const metadata = await parsePdfMetadata(file);
      setMetadata(metadata);
      setProgress(100);
      return metadata;
    } catch (error) {
      console.error('Failed to parse PDF metadata:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [parsePdfMetadata]);

  const renderPage = useCallback(async (pageNumber: number): Promise<string> => {
    if (!pdfFile) throw new Error('PDF file not available for rendering');
    
    // Update page loading state
    setMetadata(prev => {
      if (!prev) return prev;
      const updatedPages = prev.pages.map(p => 
        p.pageNumber === pageNumber ? { ...p, isLoading: true } : p
      );
      return { ...prev, pages: updatedPages };
    });

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfjsLib = await import('pdfjs-dist');
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.5 });
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Update page with rendered image
      setMetadata(prev => {
        if (!prev) return prev;
        const updatedPages = prev.pages.map(p => 
          p.pageNumber === pageNumber ? { ...p, imageUrl, isLoading: false } : p
        );

        const renderedCount = updatedPages.filter(p => p.imageUrl).length;
        setProgress(Math.round((renderedCount / prev.totalPages) * 100));

        return { ...prev, pages: updatedPages };
      });
      
      return imageUrl;
    } catch (error) {
      // Update page loading state on error
      setMetadata(prev => {
        if (!prev) return prev;
        const updatedPages = prev.pages.map(p => 
          p.pageNumber === pageNumber ? { ...p, isLoading: false } : p
        );
        return { ...prev, pages: updatedPages };
      });
      throw error;
    }
  }, [metadata, pdfFile]);

  const loadProcessedPages = useCallback((pages: ProcessorResult[], title: string) => {
    setLoading(true);
    setPdfFile(null); // These are not from a single PDF file
    setMetadata({
      totalPages: pages.length,
      title,
      pages: pages.map((p, i) => ({
        pageNumber: i + 1,
        width: 800, // Using default dimensions
        height: 1120,
        imageUrl: p.imageUrl,
        isLoading: false,
      })),
    });
    setProgress(100);
    setLoading(false);
  }, []);

  const clearMetadata = useCallback(() => {
    setMetadata(null);
    setPdfFile(null);
  }, []);

  return {
    metadata,
    loading,
    progress,
    pdfFile,
    loadPdfMetadata,
    renderPage,
    clearMetadata,
    loadProcessedPages,
  };
}

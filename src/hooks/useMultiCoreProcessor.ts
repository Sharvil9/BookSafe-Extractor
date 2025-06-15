
import { useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface ProcessorResult {
  imageUrl: string;
  name: string;
}

export function useMultiCoreProcessor() {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ProcessorResult[]>([]);

  // Get optimal worker count (use all CPU cores)
  const getWorkerCount = useCallback(() => {
    const cores = navigator.hardwareConcurrency || 4;
    return Math.min(cores, 8); // Cap at 8 to avoid browser limits
  }, []);

  const processPDF = useCallback(async (file: File): Promise<ProcessorResult[]> => {
    setLoading(true);
    setProgress(0);
    setResults([]);

    return new Promise(async (resolve, reject) => {
      try {
        // Get PDF page count first
        const arrayBuffer = await file.arrayBuffer();
        
        // Use installed pdfjs-dist and set worker source
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;

        const workerCount = getWorkerCount();
        const pagesPerWorker = Math.ceil(totalPages / workerCount);
        const workers: Worker[] = [];
        const pageResults: ProcessorResult[] = new Array(totalPages);
        let completedPages = 0;
        let completedWorkers = 0;

        console.log(`Using ${workerCount} workers for ${totalPages} pages`);

        // Create and start workers
        for (let i = 0; i < workerCount; i++) {
          const worker = new Worker(
            new URL("../workers/multiPdfWorker.ts", import.meta.url),
            { type: "module" }
          );

          const pageStart = i * pagesPerWorker + 1;
          const pageEnd = Math.min((i + 1) * pagesPerWorker, totalPages);

          if (pageStart <= totalPages) {
            worker.onmessage = (event) => {
              const { type, pageIndex, imageUrl, name, workerId } = event.data;
              
              if (type === 'page') {
                pageResults[pageIndex] = { imageUrl, name };
                completedPages++;
                setProgress(Math.round((completedPages / totalPages) * 100));
                
                // Update results live
                setResults([...pageResults.filter(Boolean)]);
              } else if (type === 'worker-done') {
                completedWorkers++;
                if (completedWorkers === workerCount) {
                  // All workers done
                  workers.forEach(w => w.terminate());
                  setLoading(false);
                  resolve(pageResults);
                }
              } else if (type === 'error') {
                workers.forEach(w => w.terminate());
                setLoading(false);
                reject(new Error(event.data.error));
              }
            };

            worker.postMessage({
              file,
              workerId: i,
              pageStart,
              pageEnd,
              totalPages
            });

            workers.push(worker);
          }
        }
      } catch (error: any) {
        setLoading(false);
        let message = "This file seems to be corrupted or is not a supported PDF format. Please try again.";
        if (error && error.name) {
            switch (error.name) {
                case 'PasswordException':
                    message = "This PDF is password-protected and cannot be opened.";
                    break;
                case 'InvalidPDFException':
                    message = "The PDF file structure is invalid or corrupted.";
                    break;
                case 'MissingDataException':
                    message = "The PDF file is incomplete or missing essential data.";
                    break;
                case 'UnknownErrorException':
                    message = "An unknown error occurred while processing the PDF.";
                    break;
            }
        }
        console.error('PDF processing error:', error);
        reject(new Error(message));
      }
    });
  }, [getWorkerCount]);

  const processImages = useCallback(async (files: FileList): Promise<ProcessorResult[]> => {
    setLoading(true);
    setProgress(0);
    setResults([]);

    return new Promise((resolve, reject) => {
      try {
        const fileArray = Array.from(files);
        const totalFiles = fileArray.length;
        const workerCount = Math.min(getWorkerCount(), totalFiles);
        const filesPerWorker = Math.ceil(totalFiles / workerCount);
        const workers: Worker[] = [];
        const imageResults: ProcessorResult[] = new Array(totalFiles);
        let completedFiles = 0;
        let completedWorkers = 0;

        console.log(`Using ${workerCount} workers for ${totalFiles} images`);

        // Create and start workers
        for (let i = 0; i < workerCount; i++) {
          const worker = new Worker(
            new URL("../workers/imageWorker.ts", import.meta.url),
            { type: "module" }
          );

          const startIndex = i * filesPerWorker;
          const endIndex = Math.min((i + 1) * filesPerWorker - 1, totalFiles - 1);

          if (startIndex < totalFiles) {
            worker.onmessage = (event) => {
              const { type, index, imageUrl, name, workerId } = event.data;
              
              if (type === 'image') {
                imageResults[index] = { imageUrl, name };
                completedFiles++;
                setProgress(Math.round((completedFiles / totalFiles) * 100));
                
                // Update results live
                setResults([...imageResults.filter(Boolean)]);
              } else if (type === 'worker-done') {
                completedWorkers++;
                if (completedWorkers === workerCount) {
                  // All workers done
                  workers.forEach(w => w.terminate());
                  setLoading(false);
                  resolve(imageResults);
                }
              } else if (type === 'error') {
                workers.forEach(w => w.terminate());
                setLoading(false);
                reject(new Error(event.data.error));
              }
            };

            worker.postMessage({
              files: fileArray,
              workerId: i,
              startIndex,
              endIndex
            });

            workers.push(worker);
          }
        }
      } catch (error) {
        setLoading(false);
        reject(error);
      }
    });
  }, [getWorkerCount]);

  return {
    progress,
    loading,
    results,
    processPDF,
    processImages,
    workerCount: getWorkerCount()
  };
}

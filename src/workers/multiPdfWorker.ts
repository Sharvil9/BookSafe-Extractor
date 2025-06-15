/// <reference lib="webworker" />

import * as pdfjsLib from 'pdfjs-dist';

// @ts-ignore - Set worker src for pdfjs-dist
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Multi-worker PDF processing for maximum CPU utilization

interface WorkerTask {
  workerId: number;
  pageStart: number;
  pageEnd: number;
  file: File;
}

interface WorkerResult {
  pageIndex: number;
  imageUrl: string;
  name: string;
  workerId: number;
}

self.onmessage = async (event) => {
  const { file, workerId, pageStart, pageEnd, totalPages } = event.data;
  
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    // Process assigned page range
    for (let i = pageStart; i <= pageEnd; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 });

      const offscreen = new OffscreenCanvas(viewport.width, viewport.height);
      const context = offscreen.getContext("2d");
      // @ts-ignore
      await page.render({ canvasContext: context, viewport }).promise;
      
      const blob = await offscreen.convertToBlob();
      const imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      // Send result immediately when ready
      self.postMessage({
        type: 'page',
        pageIndex: i - 1,
        imageUrl,
        name: `Page ${i}`,
        workerId,
        totalPages
      });
    }

    // Signal this worker is done
    self.postMessage({ type: 'worker-done', workerId });
  } catch (error: any) {
    self.postMessage({ type: 'error', error: error.message, workerId });
  }
};

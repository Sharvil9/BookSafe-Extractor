
/// <reference lib="webworker" />

// PDF processing web worker for fast, multi-threaded, local PDF processing

self.onmessage = async (event) => {
  const { file } = event.data;
  // @ts-ignore
  importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");
  // @ts-ignore
  importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js");
  // @ts-ignore
  const pdfjsLib = self.pdfjsLib;
  // @ts-ignore
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 1.5 });

    let imageUrl;
    // Use OffscreenCanvas if available, else fallback to regular Canvas
    if (typeof OffscreenCanvas !== "undefined") {
      const offscreen = new OffscreenCanvas(viewport.width, viewport.height);
      const context = offscreen.getContext("2d");
      // @ts-ignore
      await page.render({ canvasContext: context, viewport }).promise;
      // OffscreenCanvas: get Blob, then DataURL
      if (offscreen.convertToBlob) {
        const blob = await offscreen.convertToBlob();
        imageUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } else {
        // Shouldn't happen; fallback
        imageUrl = "";
      }
    } else {
      // Fallback to hidden <canvas> (main thread only, shouldn't happen in worker, but safe in some polyfills)
      const canvas = new (self as any).document
        ? (self as any).document.createElement("canvas")
        : undefined;
      if (canvas) {
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const context = canvas.getContext("2d");
        // @ts-ignore
        await page.render({ canvasContext: context, viewport }).promise;
        imageUrl = canvas.toDataURL("image/png");
      } else {
        imageUrl = "";
      }
    }

    self.postMessage({
      pageIndex: i - 1,
      total: pageCount,
      imageUrl,
      name: `Page ${i}`,
    });
  }
  self.postMessage({ done: true });
};


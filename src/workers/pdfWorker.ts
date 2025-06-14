
// PDF processing web worker for fast, multi-threaded, local PDF processing

self.onmessage = async (event) => {
  const { file } = event.data;
  importScripts("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js");
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
    const canvas = new OffscreenCanvas(
      viewport.width,
      viewport.height
    );
    const context = canvas.getContext("2d");
    // @ts-ignore
    await page.render({ canvasContext: context, viewport }).promise;
    // @ts-ignore
    const imageUrl = canvas.convertToBlob
      ? await canvas.convertToBlob().then((blob) => {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        })
      : canvas.toDataURL("image/png");
    self.postMessage({
      pageIndex: i - 1,
      total: pageCount,
      imageUrl,
      name: `Page ${i}`
    });
  }
  self.postMessage({ done: true });
};

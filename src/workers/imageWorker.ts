
/// <reference lib="webworker" />

// Image processing worker for parallel batch imports

self.onmessage = async (event) => {
  const { files, workerId, startIndex, endIndex } = event.data;
  
  try {
    for (let i = startIndex; i <= endIndex; i++) {
      const file = files[i];
      if (!file) continue;

      const imageUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Send result immediately when ready
      self.postMessage({
        type: 'image',
        index: i,
        imageUrl,
        name: file.name || `Image ${i + 1}`,
        workerId
      });
    }

    // Signal this worker is done
    self.postMessage({ type: 'worker-done', workerId });
  } catch (error) {
    self.postMessage({ type: 'error', error: error.message, workerId });
  }
};

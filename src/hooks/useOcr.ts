
import { useState, useEffect, useCallback, useRef } from 'react';
import Tesseract from 'tesseract.js';

export function useOcr() {
    const schedulerRef = useRef<Tesseract.Scheduler | null>(null);
    const [isReady, setIsReady] = useState(false);

    // Initialize scheduler and workers once on mount
    useEffect(() => {
        const workerCount = Math.max(1, (navigator.hardwareConcurrency || 4) - 1);
        const scheduler = Tesseract.createScheduler();

        const initialize = async () => {
            const workerPromises = Array(workerCount).fill(0).map(() => Tesseract.createWorker('eng'));
            try {
                const loadedWorkers = await Promise.all(workerPromises);
                loadedWorkers.forEach(w => scheduler.addWorker(w));
                schedulerRef.current = scheduler;
                setIsReady(true);
            } catch (error) {
                console.error("Failed to initialize OCR workers:", error);
            }
        };

        initialize();

        return () => {
            schedulerRef.current?.terminate();
            schedulerRef.current = null;
        };
    }, []);

    const recognize = useCallback(async (
        images: { url: string; pageNumber: number }[],
        progressCallback: (progress: number) => void
    ) => {
        const scheduler = schedulerRef.current;
        if (!scheduler || !isReady) {
            throw new Error('OCR is not ready.');
        }

        progressCallback(0);
        let completed = 0;

        const results = await Promise.all(
            images.map(({ url, pageNumber }) =>
                scheduler.addJob('recognize', url).then((result) => {
                    completed++;
                    progressCallback(Math.round((completed / images.length) * 100));
                    return { ...result, pageNumber };
                })
            )
        );

        const sortedText = results
            .sort((a, b) => a.pageNumber - b.pageNumber)
            .map(({ data: { text }, pageNumber }) => `--- Page ${pageNumber} ---\n\n${text}\n\n`)
            .join('');

        return sortedText;
    }, [isReady]);

    return { isOcrReady: isReady, recognize };
}

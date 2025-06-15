
import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Crop, FlipHorizontal, RotateCcw, RotateCw, Trash2 } from "lucide-react";
import { useSharedLazyPdfProcessor } from "@/contexts/LazyPdfProcessorContext";

// Duplicating interface here to avoid import cycle issues if we were to export it from the hook file.
interface PdfPage {
  pageNumber: number;
  width: number;
  height: number;
  imageUrl?: string;
  isLoading?: boolean;
  rotation?: number;
  croppedImageUrl?: string;
}

interface PageEditorProps {
  pageData: PdfPage;
}

export default function PageEditor({ pageData }: PageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);
  const { updatePageData } = useSharedLazyPdfProcessor();

  const imageUrl = pageData.croppedImageUrl || pageData.imageUrl;

  useEffect(() => {
    if (canvasRef.current && imageUrl) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "white",
        selection: false,
      });

      fabric.Image.fromURL(imageUrl, (img) => {
        const containerWidth = 800;
        // Maintain aspect ratio
        const scale = containerWidth / (img.width || containerWidth);
        const containerHeight = (img.height || 0) * scale;
        
        fabricCanvas.setWidth(containerWidth);
        fabricCanvas.setHeight(containerHeight);
        
        // Use a background image for main display
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
          scaleX: scale,
          scaleY: scale,
          angle: pageData.rotation || 0,
          originX: 'center',
          originY: 'center',
        });
        // Center the background image
        fabricCanvas.centerObject(fabricCanvas.backgroundImage);
        fabricCanvas.renderAll();

      }, { crossOrigin: 'anonymous' });
      
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
        setCanvas(null);
      };
    }
  }, [imageUrl, pageData.rotation]);
  
  const handleMirror = () => {
    if (canvas) {
      const image = canvas.backgroundImage as fabric.Image;
      if (image) {
        image.toggle('flipX');
        canvas.renderAll();
      }
    }
  };

  const handleCrop = () => {
    if(!canvas) return;

    if (isCropMode) {
      const cropRect = canvas.getActiveObject();
      if (cropRect && cropRect.type === 'rect') {
        // toDataURL will capture the canvas area defined by the rect
        const dataUrl = canvas.toDataURL({
            format: 'png',
            left: cropRect.left,
            top: cropRect.top,
            // @ts-ignore
            width: cropRect.width * cropRect.scaleX,
            // @ts-ignore
            height: cropRect.height * cropRect.scaleY,
        });
        updatePageData(pageData.pageNumber, { croppedImageUrl: dataUrl, rotation: 0 });
      }

      canvas.remove(...canvas.getObjects('rect'));
      setIsCropMode(false);
      canvas.selection = false;
      canvas.renderAll();
      return;
    }

    setIsCropMode(true);
    canvas.selection = true;
    
    const canvasWidth = canvas.getWidth();
    const canvasHeight = canvas.getHeight();

    const rect = new fabric.Rect({
      left: canvasWidth * 0.05,
      top: canvasHeight * 0.1,
      width: canvasWidth * 0.9,
      height: canvasHeight * 0.8,
      fill: 'rgba(0,0,0,0.3)',
      stroke: '#fde047', // yellow-300
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      cornerColor: '#fde047',
      cornerStrokeColor: '#ca8a04', // yellow-500
      borderColor: '#ca8a04',
      transparentCorners: false,
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
    canvas.renderAll();
  };
  
  const handleRotate = (degrees: number) => {
    if (!updatePageData || isCropMode) return;
    const currentRotation = pageData.rotation || 0;
    // Normalize rotation to be within 0-359
    const newRotation = (currentRotation + degrees + 360) % 360;
    updatePageData(pageData.pageNumber, { rotation: newRotation });
  };
  
  const handleReset = () => {
    if (!updatePageData) return;
    updatePageData(pageData.pageNumber, { rotation: 0, croppedImageUrl: undefined });
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex gap-2 sm:gap-4 p-2 bg-amber-100/50 rounded-lg border border-amber-200 flex-wrap justify-center">
        <Button onClick={handleCrop} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold">
          <Crop size={18} className="mr-2" />
          {isCropMode ? "Finish Crop" : "Crop"}
        </Button>
        <Button onClick={handleMirror} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold" disabled={isCropMode}>
          <FlipHorizontal size={18} className="mr-2" />
          Mirror
        </Button>
        <Button onClick={() => handleRotate(-90)} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold" disabled={isCropMode}>
            <RotateCcw size={18} className="mr-2" />
            Rotate Left
        </Button>
        <Button onClick={() => handleRotate(90)} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold" disabled={isCropMode}>
            <RotateCw size={18} className="mr-2" />
            Rotate Right
        </Button>
        <Button onClick={handleReset} variant="outline" className="border-2 border-red-600 text-red-700 hover:bg-red-100 font-bold" disabled={isCropMode}>
            <Trash2 size={18} className="mr-2" />
            Reset
        </Button>
      </div>
      <div className="border-4 border-amber-200 rounded-lg shadow-lg overflow-hidden w-full max-w-[800px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}

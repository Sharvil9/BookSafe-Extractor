
import React, { useRef, useEffect, useState } from "react";
import { fabric } from "fabric";
import { Button } from "@/components/ui/button";
import { Crop, FlipHorizontal } from "lucide-react";

interface PageEditorProps {
  imageUrl: string;
}

export default function PageEditor({ imageUrl }: PageEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [isCropMode, setIsCropMode] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        backgroundColor: "white",
        selection: false,
      });

      fabric.Image.fromURL(imageUrl, (img) => {
        const containerWidth = 800;
        const scale = containerWidth / (img.width || containerWidth);
        const containerHeight = (img.height || 0) * scale;
        
        fabricCanvas.setWidth(containerWidth);
        fabricCanvas.setHeight(containerHeight);
        
        fabricCanvas.setBackgroundImage(img, fabricCanvas.renderAll.bind(fabricCanvas), {
          scaleX: scale,
          scaleY: scale,
        });
      }, { crossOrigin: 'anonymous' });
      
      setCanvas(fabricCanvas);

      return () => {
        fabricCanvas.dispose();
      };
    }
  }, [imageUrl]);
  
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
      // Logic to perform crop would go here.
      // For now, we just exit crop mode.
      canvas.remove(...canvas.getObjects('rect'));
      setIsCropMode(false);
      canvas.selection = false;
      canvas.renderAll();
      return;
    }

    setIsCropMode(true);
    canvas.selection = true;
    const rect = new fabric.Rect({
      left: 100,
      top: 100,
      width: canvas.getWidth() / 2,
      height: canvas.getHeight() / 2,
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

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex gap-4 p-2 bg-amber-100/50 rounded-lg border border-amber-200">
        <Button onClick={handleCrop} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold">
          <Crop size={18} className="mr-2" />
          {isCropMode ? "Finish Crop" : "Crop"}
        </Button>
        <Button onClick={handleMirror} variant="outline" className="border-2 border-amber-600 text-amber-700 hover:bg-amber-100 font-bold">
          <FlipHorizontal size={18} className="mr-2" />
          Mirror
        </Button>
      </div>
      <div className="border-4 border-amber-200 rounded-lg shadow-lg overflow-hidden w-full max-w-[800px]">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}


import React, { useState } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { useBook } from "./BookContext";
import { Crop, RotateCcw, RotateCw, Trash2, Undo, Redo } from "lucide-react";
import { Button } from "@/components/ui/button";

// Minimal edit drawer UI with key actions
export default function PageEditDrawer({
  pageIndex,
  onClose,
}: {
  pageIndex: number;
  onClose: () => void;
}) {
  const { pages } = useBook();
  const page = pages[pageIndex];
  // These state vars just for demo visual;
  const [cropMode, setCropMode] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [name, setName] = useState(page.name);

  return (
    <Drawer open onOpenChange={open => !open && onClose()}>
      <DrawerContent className="max-w-lg mx-auto">
        <DrawerHeader>
          <DrawerTitle>Edit Page</DrawerTitle>
        </DrawerHeader>
        <div className="flex flex-col items-center pt-2 pb-3 gap-3">
          <div className="w-full flex justify-center">
            <img
              src={page.imageUrl}
              alt={page.name}
              className={`max-h-60 bg-muted rounded shadow border`}
              style={{
                transform: `rotate(${rotation}deg)`
              }}
            />
          </div>
          <div className="flex gap-2 items-center justify-center mt-2">
            <Button
              variant={cropMode ? "destructive" : "outline"}
              size="icon"
              title="Crop"
              onClick={() => setCropMode((c) => !c)}
            >
              <Crop />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Rotate Left"
              onClick={() => setRotation((r) => r - 90)}
            >
              <RotateCcw />
            </Button>
            <Button
              variant="outline"
              size="icon"
              title="Rotate Right"
              onClick={() => setRotation((r) => r + 90)}
            >
              <RotateCw />
            </Button>
            <Button variant="outline" size="icon" title="Undo" disabled>
              <Undo />
            </Button>
            <Button variant="outline" size="icon" title="Redo" disabled>
              <Redo />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              title="Delete"
              disabled
            >
              <Trash2 />
            </Button>
          </div>
          <div className="w-full mt-4">
            <label className="block text-xs text-muted-foreground mb-1" htmlFor="rename-input">
              Rename page
            </label>
            <input
              id="rename-input"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border rounded px-2 py-1 w-full"
            />
          </div>
        </div>
        <DrawerClose asChild>
          <Button className="absolute right-5 top-5" size="sm" variant="ghost">
            Close
          </Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

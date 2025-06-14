
import React, { createContext, useContext, useState } from "react";

export interface BookPage {
  imageUrl: string;
  name: string; // "Page 1", etc.
}

interface BookContextValue {
  pages: BookPage[];
  setPages: React.Dispatch<React.SetStateAction<BookPage[]>>;
}

const BookContext = createContext<BookContextValue | undefined>(undefined);

export const BookProvider = ({ children }: { children: React.ReactNode }) => {
  const [pages, setPages] = useState<BookPage[]>([]);
  return (
    <BookContext.Provider value={{ pages, setPages }}>
      {children}
    </BookContext.Provider>
  );
};

export function useBook() {
  const ctx = useContext(BookContext);
  if (!ctx) throw new Error("useBook must be used inside BookProvider");
  return ctx;
}

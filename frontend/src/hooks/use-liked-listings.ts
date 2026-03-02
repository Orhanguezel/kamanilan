"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "liked_listings";

function readLiked(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function writeLiked(set: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  } catch {}
}

export function useLikedListings() {
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLiked(readLiked());
  }, []);

  const toggle = useCallback((id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      writeLiked(next);
      return next;
    });
  }, []);

  const isLiked = useCallback((id: string) => liked.has(id), [liked]);

  return { liked, isLiked, toggle };
}

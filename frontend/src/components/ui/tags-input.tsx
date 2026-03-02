"use client";

import { useState, KeyboardEvent } from "react";

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function TagsInput({
  value,
  onChange,
  placeholder = "Enter tag",
  label,
  className,
}: TagsInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = () => {
    const newTag = inputValue.trim();
    if (newTag && !value.includes(newTag)) {
      onChange([...value, newTag]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(1));
    }
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <div className={`w-full rounded-md ${className || ""}`}>
      <div
        className="flex flex-wrap items-center gap-2 rounded-md p-2 min-h-10 focus-within:ring-2 focus-within:ring-blue-400"
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-gray-200 text-gray-800 px-2 py-1 rounded-md text-sm"
          >
            {tag}
            <button
              type="button"
              className="text-gray-500 hover:text-red-500"
              onClick={() => removeTag(tag)}
            >
              ✕
            </button>
          </span>
        ))}

        <input
          className="flex-1 outline-none bg-transparent text-sm"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

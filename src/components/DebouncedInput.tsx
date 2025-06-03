"use client";

import { useState, useEffect, useRef } from "react";

interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}

export default function DebouncedInput({
  value,
  onChange,
  placeholder,
  debounceMs = 300,
  className,
}: DebouncedInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const isFirstRender = useRef(true);

  // Sync internal state with external value prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    // Skip the first render to avoid calling onChange on mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      // Only call onChange if the value actually changed
      if (inputValue !== value) {
        onChange(inputValue);
      }
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, debounceMs, onChange, value]);

  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      placeholder={placeholder}
      className={`p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${className}`}
    />
  );
}

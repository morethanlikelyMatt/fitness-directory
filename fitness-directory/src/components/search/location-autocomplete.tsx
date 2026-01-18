"use client";

import { useState, useEffect, useRef } from "react";

interface LocationAutocompleteProps {
  defaultValue?: string;
  name: string;
  placeholder?: string;
}

// Cities we support - this could be fetched from the API in the future
const AVAILABLE_CITIES = [
  "Austin, TX",
  "Miami, FL",
  "Miami Beach, FL",
  "New York, NY",
  "Brooklyn, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Dallas, TX",
  "San Antonio, TX",
  "San Diego, CA",
  "San Jose, CA",
  "San Francisco, CA",
  "Denver, CO",
  "Seattle, WA",
  "Boston, MA",
  "Atlanta, GA",
  "Portland, OR",
  "Nashville, TN",
];

export function LocationAutocomplete({
  defaultValue = "",
  name,
  placeholder = "City or ZIP",
}: LocationAutocompleteProps) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (value.length >= 1) {
      const filtered = AVAILABLE_CITIES.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  }, [value]);

  const handleSelect = (city: string) => {
    setValue(city);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        if (highlightedIndex >= 0) {
          e.preventDefault();
          handleSelect(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => value.length >= 1 && suggestions.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
      {isOpen && suggestions.length > 0 && (
        <ul
          ref={listRef}
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((city, index) => (
            <li
              key={city}
              onClick={() => handleSelect(city)}
              className={`cursor-pointer px-4 py-2 text-sm ${
                index === highlightedIndex
                  ? "bg-orange-50 text-orange-700"
                  : "text-stone-700 hover:bg-stone-50"
              }`}
            >
              {city}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

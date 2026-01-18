"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Suggestion {
  id: string;
  name: string;
  city: string;
  slug: string;
}

interface SearchBarProps {
  placeholder?: string;
  autoFocus?: boolean;
  showOnHomepage?: boolean;
}

export function SearchBar({
  placeholder = "Search gyms, equipment, or location...",
  autoFocus = false,
  showOnHomepage = false,
}: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/search/autocomplete?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Autocomplete error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  const handleInputChange = useCallback(
    (value: string) => {
      setQuery(value);
      setSelectedIndex(-1);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 200);
    },
    [fetchSuggestions]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setIsOpen(false);

      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }
      params.delete("page"); // Reset to page 1

      router.push(`/search?${params.toString()}`);
    },
    [query, router, searchParams]
  );

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          if (selectedIndex >= 0 && suggestions[selectedIndex]) {
            e.preventDefault();
            router.push(`/gym/${suggestions[selectedIndex].slug}`);
            setIsOpen(false);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, suggestions, selectedIndex, router]
  );

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open suggestions when typing
  useEffect(() => {
    if (suggestions.length > 0 && query.length >= 2) {
      setIsOpen(true);
    }
  }, [suggestions, query]);

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className="w-full rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600" />
            </div>
          )}
        </div>
        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800:bg-zinc-100"
        >
          Search
        </button>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-zinc-200 bg-white py-2 shadow-lg">
          {suggestions.map((suggestion, index) => (
            <Link
              key={suggestion.id}
              href={`/gym/${suggestion.slug}`}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 ${
                index === selectedIndex
                  ? "bg-zinc-100"
                  : "hover:bg-zinc-50:bg-zinc-800"
              }`}
            >
              <span className="font-medium text-zinc-900">
                {suggestion.name}
              </span>
              <span className="ml-2 text-sm text-zinc-500">
                {suggestion.city}
              </span>
            </Link>
          ))}
          <div className="border-t border-zinc-100 px-4 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="text-sm text-zinc-600 hover:text-zinc-900:text-white"
            >
              Search for &quot;{query}&quot; →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

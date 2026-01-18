"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface PlaceSuggestion {
  description: string;
  place_id: string;
}

export function HomeSearchForm() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Fetch place suggestions from Google Places Autocomplete
  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/places/autocomplete?input=${encodeURIComponent(input)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.predictions || []);
        setIsOpen(data.predictions?.length > 0);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Debounce the API calls
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(location);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [location, fetchSuggestions]);

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [suggestions]);

  const handleSelectCity = (city: string) => {
    setLocation(city);
    setIsOpen(false);
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
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          e.preventDefault();
          handleSelectCity(suggestions[highlightedIndex].description);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("location", location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="flex flex-col sm:flex-row rounded-2xl bg-white shadow-xl shadow-stone-200/50 ring-1 ring-stone-200 overflow-visible">
        {/* Find input */}
        <div className="flex-1 flex items-center px-5 border-b sm:border-b-0 sm:border-r border-stone-100">
          <svg className="h-5 w-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="sauna, crossfit, yoga..."
            className="flex-1 border-0 bg-transparent py-4 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-0"
          />
        </div>

        {/* Location input with autocomplete */}
        <div className="relative sm:w-52">
          <div className="flex items-center px-5">
            <svg className="h-5 w-5 text-stone-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <input
              ref={locationInputRef}
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 150)}
              onKeyDown={handleKeyDown}
              placeholder="City"
              autoComplete="off"
              className="flex-1 border-0 bg-transparent py-4 px-3 text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-0"
            />
          </div>

          {/* Suggestions dropdown */}
          {isOpen && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.place_id}
                  onMouseDown={() => handleSelectCity(suggestion.description)}
                  className={`cursor-pointer px-4 py-2 text-sm ${
                    index === highlightedIndex
                      ? "bg-orange-50 text-orange-700"
                      : "text-stone-700 hover:bg-stone-50"
                  }`}
                >
                  {suggestion.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          className="m-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-3 font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
        >
          Search
        </button>
      </div>
    </form>
  );
}

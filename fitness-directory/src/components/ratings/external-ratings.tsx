interface ExternalRatingsProps {
  yelpUrl?: string | null;
  googleMapsUrl?: string | null;
}

export function ExternalRatings({ yelpUrl, googleMapsUrl }: ExternalRatingsProps) {
  if (!yelpUrl && !googleMapsUrl) {
    return null;
  }

  return (
    <div className="rounded-lg border border-zinc-200 p-6">
      <h3 className="font-semibold text-zinc-900">Reviews</h3>
      <div className="mt-4 flex flex-col gap-3">
        {yelpUrl && (
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
              <img
                src="/logos/yelp.png"
                alt="Yelp"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-zinc-900">
                Yelp
              </span>
              <p className="truncate text-xs text-zinc-500">See reviews</p>
            </div>
            <svg
              className="h-4 w-4 flex-shrink-0 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}

        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-16 w-full items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center">
              <img
                src="/logos/google-maps.png"
                alt="Google Maps"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-zinc-900">
                Google Maps
              </span>
              <p className="truncate text-xs text-zinc-500">See reviews</p>
            </div>
            <svg
              className="h-4 w-4 flex-shrink-0 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
}

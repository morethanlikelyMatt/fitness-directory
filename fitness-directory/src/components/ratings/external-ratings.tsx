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
      <div className="mt-4 space-y-3">
        {yelpUrl && (
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-600">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.271 9.893c.236.091.42.298.51.563.067.197.064.418-.01.613-.117.313-.38.543-.693.609-.313.066-.648-.033-.886-.263-.19-.183-.3-.442-.3-.715 0-.273.11-.532.3-.715.238-.23.573-.33.886-.263.09.02.178.052.263.098l-.07.073zm-1.95 5.08c-.162.188-.267.424-.298.674-.032.25.011.505.122.73.176.357.52.598.91.638.39.04.77-.118 1-.416.23-.298.296-.696.176-1.054-.12-.358-.412-.636-.77-.736-.358-.1-.745-.024-1.023.202l-.117-.038zm-5.33-2.892c.183.167.279.413.258.66-.022.249-.157.473-.364.607-.206.134-.462.172-.693.103-.23-.07-.415-.242-.497-.466-.082-.224-.05-.474.088-.676.138-.203.363-.334.61-.354.247-.02.492.06.676.227l-.078-.1zm8.26-5.78c-.156-.298-.217-.643-.174-.98.043-.337.187-.656.414-.913.362-.41.906-.6 1.438-.5.532.099.977.453 1.175.936.198.482.126 1.034-.188 1.454-.315.42-.833.654-1.366.617-.534-.038-1.017-.329-1.275-.801l-.024.187zm-1.165 6.99c-.067-.212-.056-.44.03-.646.088-.205.242-.377.437-.483.312-.17.693-.177 1.01-.02.319.157.551.464.616.816.065.35-.033.715-.26.966-.228.25-.566.387-.91.361-.344-.025-.657-.2-.853-.471-.117-.162-.181-.358-.181-.558 0-.02 0-.04.003-.058l.108.093zm-5.17-3.59c.164.087.294.226.367.392.073.167.088.353.041.527-.074.276-.278.497-.543.587-.264.09-.557.05-.78-.108-.222-.158-.361-.413-.368-.68-.008-.268.118-.524.332-.68.214-.156.495-.195.744-.105.073.028.14.066.207.113v-.046zm9.81-5.62c-.33-.103-.617-.32-.804-.61-.187-.29-.266-.64-.222-.985.07-.55.41-1.026.895-1.256.484-.229 1.06-.183 1.516.123.457.305.73.833.72 1.393-.01.56-.303 1.078-.772 1.365-.47.287-1.051.285-1.52-.005l.187-.025z" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-zinc-900">
                View on Yelp
              </span>
              <p className="text-xs text-zinc-500">See reviews and ratings</p>
            </div>
            <svg
              className="h-4 w-4 text-zinc-400"
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
            className="flex items-center gap-3 rounded-lg border border-zinc-200 p-3 transition-colors hover:bg-zinc-50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white border border-zinc-200">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EA4335"
                />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium text-zinc-900">
                View on Google Maps
              </span>
              <p className="text-xs text-zinc-500">See location and reviews</p>
            </div>
            <svg
              className="h-4 w-4 text-zinc-400"
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

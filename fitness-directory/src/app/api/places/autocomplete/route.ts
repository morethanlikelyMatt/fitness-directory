import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const input = searchParams.get("input");

  if (!input || input.length < 2) {
    return NextResponse.json({ predictions: [] });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("Google Maps API key not configured");
    return NextResponse.json({ predictions: [] });
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&types=(regions)&components=country:us&key=${apiKey}`
    );

    if (!response.ok) {
      console.error("Google Places API error:", response.status);
      return NextResponse.json({ predictions: [] });
    }

    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API status:", data.status);
      return NextResponse.json({ predictions: [] });
    }

    // Map to simplified format
    const predictions = (data.predictions || []).map(
      (p: { description: string; place_id: string }) => ({
        description: p.description,
        place_id: p.place_id,
      })
    );

    return NextResponse.json({ predictions });
  } catch (error) {
    console.error("Error fetching place suggestions:", error);
    return NextResponse.json({ predictions: [] });
  }
}

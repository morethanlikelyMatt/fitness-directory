import { NextRequest, NextResponse } from "next/server";
import { autocompleteFitnessCenters } from "@/lib/typesense";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") || "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await autocompleteFitnessCenters(query, 5);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Autocomplete error:", error);
    // Return empty results on error (graceful degradation)
    return NextResponse.json({ suggestions: [] });
  }
}

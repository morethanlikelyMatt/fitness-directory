/**
 * US State name to abbreviation mapping
 */
export const US_STATE_ABBREVIATIONS: Record<string, string> = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY",
  "District of Columbia": "DC",
  "Puerto Rico": "PR",
  "Guam": "GU",
  "American Samoa": "AS",
  "U.S. Virgin Islands": "VI",
  "Northern Mariana Islands": "MP",
};

/**
 * Canadian Province name to abbreviation mapping
 */
export const CA_PROVINCE_ABBREVIATIONS: Record<string, string> = {
  "Alberta": "AB",
  "British Columbia": "BC",
  "Manitoba": "MB",
  "New Brunswick": "NB",
  "Newfoundland and Labrador": "NL",
  "Northwest Territories": "NT",
  "Nova Scotia": "NS",
  "Nunavut": "NU",
  "Ontario": "ON",
  "Prince Edward Island": "PE",
  "Quebec": "QC",
  "Saskatchewan": "SK",
  "Yukon": "YT",
};

/**
 * Convert a full state/province name to its abbreviation
 * Returns the original value if no mapping is found
 */
export function toStateAbbreviation(stateName: string | null | undefined): string | null {
  if (!stateName) return null;

  const trimmed = stateName.trim();

  // Check if already an abbreviation (2-3 chars, all uppercase)
  if (trimmed.length <= 3 && trimmed === trimmed.toUpperCase()) {
    return trimmed;
  }

  // Try US states
  if (US_STATE_ABBREVIATIONS[trimmed]) {
    return US_STATE_ABBREVIATIONS[trimmed];
  }

  // Try Canadian provinces
  if (CA_PROVINCE_ABBREVIATIONS[trimmed]) {
    return CA_PROVINCE_ABBREVIATIONS[trimmed];
  }

  // Return original if no mapping found
  return trimmed;
}

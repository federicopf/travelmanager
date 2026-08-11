export function normalizeCountryCode(countryCode: string): string {
  return countryCode.trim().toUpperCase();
}

export function countryCodeToFlag(countryCode: string): string {
  const normalized = normalizeCountryCode(countryCode);

  if (!/^[A-Z]{2}$/.test(normalized)) {
    return '🌍';
  }

  return String.fromCodePoint(
    ...Array.from(normalized).map((character) => 127397 + character.charCodeAt(0))
  );
}

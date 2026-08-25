const FAVORITES_KEY = "pawcare-adoption-favorites-v1";

export function loadFavoritePets(): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
    return Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
}

export function toggleFavoritePet(current: string[], petId: string): string[] {
  const next = current.includes(petId) ? current.filter((id) => id !== petId) : [...current, petId];
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  return next;
}

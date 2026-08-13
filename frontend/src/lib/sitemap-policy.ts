export function shouldIndexCategory(listingCount: number | undefined): boolean {
  return typeof listingCount === "number" && listingCount > 0;
}

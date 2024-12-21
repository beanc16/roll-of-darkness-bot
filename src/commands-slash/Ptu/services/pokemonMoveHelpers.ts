export const removeExtraCharactersFromMoveName = (input: string): string => input
    .trim()
    .replaceAll(/ \([nN]\)$/g, '')  // Remove the (N) from some tutor moves
    .replaceAll(/^A?[\d\s]+/g, '')  // Remove the number from TMs/HMs
    .replaceAll('§', '')
    .trim();

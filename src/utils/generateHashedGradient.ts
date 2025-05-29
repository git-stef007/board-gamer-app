/*
 * This utility function generates a gradient based on a given input string.
 * The gradient colors are derived from a hash of the input string.
 * It can be used for creating visually distinct backgrounds (or image placeholders / defaults) for groups or users or cards etc..
 */

export function generateHashedGradient(input: string): string {
  const hash = Array.from(input).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);

  const color1 = `hsl(${hash % 360}, 70%, 60%)`;
  const color2 = `hsl(${(hash * 7) % 360}, 70%, 70%)`;

  return `linear-gradient(135deg, ${color1}, ${color2})`;
}
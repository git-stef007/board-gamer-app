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

/*
 * This function generates a color based on a given input string.
 * It can be used for generating visually disctinctive colors for user names in chat groups etc.
 * The color is derived from a hash of the input string.
 */

export function generateHashedColor(input: string): string {
  const hash = Array.from(input).reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
  const hue = hash % 360;
  
  return `hsl(${hue}, 70%, 50%)`;
}
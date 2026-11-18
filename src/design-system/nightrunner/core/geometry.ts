export type CornerShape = 'button' | 'panel' | 'left' | 'right';
export type Point = readonly [number, number];

/** Coordinate SVG in pixel: il taglio viene limitato per evitare forme invertite. */
export function cutPolygon(width: number, height: number, cut = 11, shape: CornerShape = 'button'): Point[] {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0) throw new RangeError('Le dimensioni devono essere finite e non negative.');
  const c = Math.max(0, Math.min(Number.isFinite(cut) ? cut : 11, width / 2, height / 2));
  if (shape === 'left') return [[0, 0], [width, 0], [width, height], [c, height], [0, height - c]];
  if (shape === 'right') return [[0, 0], [width, 0], [width, height - c], [width - c, height], [0, height]];
  if (shape === 'panel') return [[c, 0], [width - c, 0], [width, c], [width, height - c], [width - c, height], [0, height], [0, c]];
  return [[c, 0], [width, 0], [width, height - c], [width - c, height], [0, height], [0, c]];
}

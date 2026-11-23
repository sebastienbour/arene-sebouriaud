import type { Level, Point } from '../engine/types.ts'

/** Un rectangle de murs vide à l'intérieur. */
function frame(width: number, height: number): Point[] {
  const cells: Point[] = []
  for (let x = 0; x < width; x++) cells.push({ x, y: 0 }, { x, y: height - 1 })
  for (let y = 1; y < height - 1; y++) cells.push({ x: 0, y }, { x: width - 1, y })
  return cells
}

/** Le premier niveau : un cadre et un pilier central. */
export const arena: Level = {
  name: 'Arène',
  width: 30,
  height: 22,
  walls: [
    ...frame(30, 22),
    { x: 14, y: 9 }, { x: 15, y: 9 },
    { x: 14, y: 10 }, { x: 15, y: 10 },
    { x: 14, y: 11 }, { x: 15, y: 11 },
    { x: 14, y: 12 }, { x: 15, y: 12 },
  ],
  spawns: [
    { x: 3, y: 3, direction: 'right' },
    { x: 26, y: 18, direction: 'left' },
    { x: 26, y: 3, direction: 'down' },
    { x: 3, y: 18, direction: 'up' },
  ],
}

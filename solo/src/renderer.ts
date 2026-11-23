// Rendu de l'état sur un canvas. Le renderer lit l'état, il ne le modifie jamais.

import type { GameState, Point } from './engine/types.ts'

const COLORS = {
  background: '#141a2a',
  grid: '#1b2236',
  wall: '#3b4664',
  target: '#ffd166',
}

export function createRenderer(canvas: HTMLCanvasElement, state: GameState) {
  const context = canvas.getContext('2d')
  if (context === null) throw new Error('Canvas 2D indisponible')
  const cell = Math.floor(Math.min(canvas.width / state.level.width, canvas.height / state.level.height))

  const rect = (p: Point, color: string, inset = 1): void => {
    context.fillStyle = color
    context.fillRect(p.x * cell + inset, p.y * cell + inset, cell - 2 * inset, cell - 2 * inset)
  }

  return function draw(state: GameState): void {
    const { level } = state
    context.fillStyle = COLORS.background
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.strokeStyle = COLORS.grid
    context.lineWidth = 1
    for (let x = 0; x <= level.width; x++) {
      context.beginPath()
      context.moveTo(x * cell + 0.5, 0)
      context.lineTo(x * cell + 0.5, level.height * cell)
      context.stroke()
    }
    for (let y = 0; y <= level.height; y++) {
      context.beginPath()
      context.moveTo(0, y * cell + 0.5)
      context.lineTo(level.width * cell, y * cell + 0.5)
      context.stroke()
    }

    level.walls.forEach((w) => rect(w, COLORS.wall, 0))

    state.targets.forEach((t) => {
      context.fillStyle = COLORS.target
      context.beginPath()
      context.arc(t.x * cell + cell / 2, t.y * cell + cell / 2, cell * 0.3, 0, Math.PI * 2)
      context.fill()
    })

    state.players.forEach((player) => {
      const alpha = player.alive ? 1 : 0.35
      context.globalAlpha = alpha
      player.trail.forEach((p, i) => rect(p, player.color, i === 0 ? 1 : 3))
      context.globalAlpha = 1
    })
  }
}

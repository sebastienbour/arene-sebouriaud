// Tests des règles. `npm test` les exécute ; ils servent de garde‑fou pendant l'activité.

import { describe, expect, it } from 'vitest'
import { createState, freeCells, isFree, movePlayer, nextHead, opposite, spawnTarget, step } from './rules.ts'
import { BASE_LENGTH, TARGET_COUNT, type GameState, type Level } from './types.ts'

const level: Level = {
  name: 'test',
  width: 6,
  height: 5,
  walls: [{ x: 2, y: 2 }],
  spawns: [
    { x: 1, y: 1, direction: 'right' },
    { x: 4, y: 3, direction: 'left' },
  ],
}

const setups = [
  { id: 'a', name: 'A', color: 'red' },
  { id: 'b', name: 'B', color: 'blue' },
]

function running(): GameState {
  return { ...createState(level, setups), status: 'running' }
}

describe('opposite', () => {
  it('renvoie la direction inverse', () => {
    expect(opposite('up')).toBe('down')
    expect(opposite('down')).toBe('up')
    expect(opposite('left')).toBe('right')
    expect(opposite('right')).toBe('left')
  })
})

describe('nextHead', () => {
  it('avance d\'une case, y vers le bas', () => {
    expect(nextHead({ x: 3, y: 3 }, 'up')).toEqual({ x: 3, y: 2 })
    expect(nextHead({ x: 3, y: 3 }, 'down')).toEqual({ x: 3, y: 4 })
    expect(nextHead({ x: 3, y: 3 }, 'left')).toEqual({ x: 2, y: 3 })
    expect(nextHead({ x: 3, y: 3 }, 'right')).toEqual({ x: 4, y: 3 })
  })
  it('ne modifie pas le point reçu', () => {
    const head = { x: 3, y: 3 }
    nextHead(head, 'up')
    expect(head).toEqual({ x: 3, y: 3 })
  })
})

describe('isFree', () => {
  const state = running()
  it('refuse les cases hors grille', () => {
    expect(isFree(state, { x: -1, y: 0 })).toBe(false)
    expect(isFree(state, { x: 6, y: 0 })).toBe(false)
    expect(isFree(state, { x: 0, y: 5 })).toBe(false)
  })
  it('refuse les murs', () => {
    expect(isFree(state, { x: 2, y: 2 })).toBe(false)
  })
  it('refuse les traces des joueurs', () => {
    expect(isFree(state, { x: 1, y: 1 })).toBe(false)
    expect(isFree(state, { x: 4, y: 3 })).toBe(false)
  })
  it('accepte une case vide', () => {
    expect(isFree(state, { x: 0, y: 0 })).toBe(true)
  })
})

describe('freeCells', () => {
  it('compte les cases libres et exclut les cibles', () => {
    const state: GameState = { ...running(), targets: [{ x: 0, y: 0 }] }
    // 30 cases - 1 mur - 2 joueurs - 1 cible
    expect(freeCells(state)).toHaveLength(26)
  })
})

describe('spawnTarget', () => {
  it('ajoute une cible sur une case libre choisie par random', () => {
    const state = running()
    const next = spawnTarget(state, () => 0)
    expect(next.targets).toHaveLength(1)
    expect(next.targets[0]).toEqual({ x: 0, y: 0 })
    expect(isFree(state, next.targets[0])).toBe(true)
  })
  it('ne modifie pas l\'état reçu', () => {
    const state = running()
    spawnTarget(state, () => 0.5)
    expect(state.targets).toHaveLength(0)
  })
})

describe('movePlayer', () => {
  it('avance tout droit sans consigne', () => {
    const state = running()
    const moved = movePlayer(state, state.players[0], undefined)
    expect(moved.trail[0]).toEqual({ x: 2, y: 1 })
    expect(moved.alive).toBe(true)
  })
  it('prend la direction demandée', () => {
    const state = running()
    const moved = movePlayer(state, state.players[0], 'down')
    expect(moved.direction).toBe('down')
    expect(moved.trail[0]).toEqual({ x: 1, y: 2 })
  })
  it('ignore le demi‑tour', () => {
    const state = running()
    const moved = movePlayer(state, state.players[0], 'left')
    expect(moved.direction).toBe('right')
    expect(moved.trail[0]).toEqual({ x: 2, y: 1 })
  })
  it('meurt en touchant un mur', () => {
    const state = running()
    const first = movePlayer(state, state.players[0], 'down') // (1,2)
    const withFirst: GameState = { ...state, players: [first, state.players[1]] }
    const second = movePlayer(withFirst, first, 'right') // (2,2) = mur
    expect(second.alive).toBe(false)
  })
  it('mange une cible : score + 1 et trace plus longue', () => {
    const state: GameState = { ...running(), targets: [{ x: 2, y: 1 }] }
    const moved = movePlayer(state, state.players[0], undefined)
    expect(moved.score).toBe(1)
  })
  it('limite la trace à BASE_LENGTH + score', () => {
    const open: Level = { name: 'open', width: 20, height: 20, walls: [], spawns: [{ x: 1, y: 1, direction: 'right' }] }
    let state: GameState = { ...createState(open, [setups[0]]), status: 'running' }
    let player = state.players[0]
    for (let i = 0; i < 10; i++) {
      player = movePlayer(state, player, undefined)
      state = { ...state, players: [player] }
    }
    expect(player.alive).toBe(true)
    expect(player.trail).toHaveLength(BASE_LENGTH)
    expect(player.trail[0]).toEqual({ x: 11, y: 1 })
  })
})

describe('step', () => {
  it('fait avancer tout le monde et maintient les cibles', () => {
    const next = step(running(), {}, () => 0.5)
    expect(next.tick).toBe(1)
    expect(next.targets).toHaveLength(TARGET_COUNT)
    expect(next.players[0].trail[0]).toEqual({ x: 2, y: 1 })
    expect(next.players[1].trail[0]).toEqual({ x: 3, y: 3 })
  })
  it('termine la partie quand plus personne n\'est vivant', () => {
    let state = running()
    for (let i = 0; i < 10; i++) state = step(state, {}, () => 0.5)
    expect(state.status).toBe('over')
    expect(state.players.every((p) => !p.alive)).toBe(true)
  })
  it('ne fait rien si la partie n\'est pas lancée', () => {
    const idle = createState(level, setups)
    expect(step(idle, {}, () => 0)).toBe(idle)
  })
})

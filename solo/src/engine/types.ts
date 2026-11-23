// Types du moteur d'Arène.
// Le moteur ne touche jamais le DOM : il pourra tourner tel quel côté serveur (J3).

/** Les quatre directions possibles : une union de types littéraux, pas un enum. */
export type Direction = 'up' | 'down' | 'left' | 'right'

/** Une case de la grille. `readonly` : on ne modifie jamais un point, on en crée un nouveau. */
export type Point = { readonly x: number; readonly y: number }

/** Point de départ d'un joueur dans un niveau. */
export type Spawn = Point & { readonly direction: Direction }

/** Un niveau : dimensions en cases, murs, points de départ. */
export type Level = {
  readonly name: string
  readonly width: number
  readonly height: number
  readonly walls: readonly Point[]
  readonly spawns: readonly Spawn[]
}

/** Ce qu'il faut pour créer un joueur. */
export type PlayerSetup = { readonly id: string; readonly name: string; readonly color: string }

/** Un joueur en cours de partie. `trail[0]` est la tête. */
export type Player = PlayerSetup & {
  readonly direction: Direction
  readonly trail: readonly Point[]
  readonly alive: boolean
  readonly score: number
}

export type Status = 'idle' | 'running' | 'over'

/** L'état complet d'une partie. Immuable : `step` renvoie un nouvel état. */
export type GameState = {
  readonly level: Level
  readonly players: readonly Player[]
  readonly targets: readonly Point[]
  readonly tick: number
  readonly status: Status
}

/** Direction demandée par chaque joueur pour le prochain tick (clé = id du joueur). */
export type Inputs = Readonly<Record<string, Direction | undefined>>

/** Longueur de la trace sans cible ramassée. Chaque cible allonge la trace d'une case. */
export const BASE_LENGTH = 4

/** Nombre de cibles maintenues sur la grille. */
export const TARGET_COUNT = 3

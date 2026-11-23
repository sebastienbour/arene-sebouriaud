# Arène — S1 : le moteur

Un jeu de grille dans l'esprit de Snake et Tron. Vous pilotez une trace lumineuse, vous ramassez des cibles, vous perdez si vous touchez un mur ou une trace.

## Démarrer

```bash
npm install        # une seule fois : installe Vite, TypeScript et Vitest dans node_modules/
npm run dev        # serveur de développement, ouvre http://localhost:5173
npm test           # exécute les tests des règles une fois
npm run test:watch # relance les tests à chaque sauvegarde (à garder ouvert pendant l'activité)
npm run build      # vérifie les types puis produit dist/
```

Au premier lancement, le jeu affiche la grille mais plante dès qu'on appuie sur Espace : les règles ne sont pas écrites.

## Votre travail

Tout se passe dans `src/engine/rules.ts`. Six fonctions contiennent un `todo(...)` à remplacer, dans cet ordre :

1. `opposite` : la direction inverse.
2. `nextHead` : la case suivante.
3. `isFree` : une case est‑elle libre ?
4. `freeCells` : toutes les cases libres.
5. `spawnTarget` : poser une cible au hasard.
6. `movePlayer` : faire avancer un joueur.

Chaque fonction a un commentaire qui décrit ce qu'elle doit faire et donne un indice. Les tests de `src/engine/rules.test.ts` vous disent si c'est juste. Quand les 19 tests passent, le jeu est jouable : Espace pour démarrer, flèches ou ZQSD pour tourner.

## Les règles du code (à respecter, elles sont dans la grille)

- `const` par défaut ; `let` seulement si vous réaffectez.
- Aucune annotation de type sur une variable locale dont la valeur suffit à connaître le type : `const head = nextHead(...)`, pas `const head: Point = ...`. Les **frontières** (paramètres, retours exportés) sont déjà annotées.
- Jamais de `any`, jamais de `<Type>valeur`.
- On ne modifie jamais un objet ou un tableau reçu : on en construit un nouveau avec `{ ...objet, champ }` et `[...tableau, element]`.
- `map`, `filter`, `some`, `find` plutôt que des boucles `for` avec un index.
- `===`.

## Arborescence

```
src/
  engine/           le moteur : ne touche jamais le DOM, tournera aussi sur le serveur en J3
    types.ts          les types (Direction, Point, Level, Player, GameState) — lire en premier
    rules.ts          les règles : VOTRE travail
    rules.test.ts     les tests des règles
    game.ts           la boucle à pas fixe et les événements (fourni)
    emitter.ts        un émetteur d'événements typé (fourni)
  levels/arena.ts   le premier niveau
  renderer.ts       dessine l'état sur le canvas (fourni)
  input.ts          clavier → direction (fourni)
  main.ts           branche tout ensemble
```

## Bonus, si vous avez fini

- Le bout de la queue libère sa case au moment où la tête avance : autoriser ce mouvement dans `isFree` ou `movePlayer`.
- Une deuxième trace pilotée au clavier (joueur 2 sur IJKL) : deux appels à `bindKeyboard` et deux joueurs dans `new Game(...)`.
- Un niveau à vous dans `src/levels/`.

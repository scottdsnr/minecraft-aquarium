# minecraft-aquarium

A Bedrock add-on that procedurally generates an aquarium: a viewing corridor
lined with four themed zones, each with its own decoration, mobs, and a
colored accent trim marking the zone from outside. Same seed, same aquarium.

- **Icy Zone** (light blue accent) — icebergs of packed ice/snow; squid, polar bear.
- **Kelp Forest** (lime accent) — kelp towers, drip-leaf; cod, salmon, turtle.
- **Coral Reef** (pink accent) — coral blocks, sea pickles; tropical fish, dolphin.
- **Deep Ocean Zone** (black accent) — deepslate, ore, amethyst; glow squid, axolotl.

## Layout

```
behavior_packs/aquarium/
├── manifest.json
├── functions/
│   └── aquarium/generate.mcfunction   # /function aquarium/generate
└── scripts/
    ├── main.js            # scriptevent entry point
    ├── generator.js        # lays out the corridor + row of exhibits
    ├── exhibits.js          # builds one tank + decor + mobs + sign
    ├── tanks.js             # reusable rectangular glass tank
    ├── decorations.js       # per-theme coral/kelp/rock scatter + mob table
    ├── blocks.js             # generator-based fillBox/hollowBox helpers
    └── rng.js                 # seeded PRNG (mulberry32)

resource_packs/aquarium/
└── manifest.json
```

## Usage

1. Copy (or symlink) `behavior_packs/aquarium` and `resource_packs/aquarium`
   into your world's `behavior_packs` / `resource_packs` folders, and enable
   both packs on the world ("Use experimental: Beta APIs" must be on, since
   this uses the `@minecraft/server` Script API).
2. In-game, stand where you want the aquarium to start and run:
   ```
   /function aquarium/generate
   ```
   or, to pick a seed and/or an exact origin:
   ```
   /scriptevent aqua:generate {"seed":"reef-1","origin":{"x":100,"y":64,"z":100}}
   ```

Generation runs as a background job (`system.runJob`) so it doesn't freeze
the server on large builds.

## Extending

- Add a new zone by adding an entry to `THEMES` in `scripts/decorations.js`
  (floor block, accent color, coral/extra block pool, pillar block, mob pool).
- Change which exhibits get built, their order, or their width by passing
  `exhibits` in the scriptevent JSON, e.g.
  `{"exhibits":[{"type":"icy","width":14},{"type":"deep_ocean","width":16}]}`.
- `createTankJob`/`createExhibitJob` are reusable building blocks for
  composing more elaborate layouts (tunnels, cylindrical tanks, multi-floor
  buildings) beyond the single-corridor generator in `generator.js`.

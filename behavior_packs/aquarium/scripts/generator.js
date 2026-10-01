import { fillBoxJob } from "./blocks.js";
import { createExhibitJob } from "./exhibits.js";
import { mulberry32, hashStringToSeed } from "./rng.js";

const DEFAULT_EXHIBITS = [
    { type: "tropical_reef", width: 14 },
    { type: "kelp_forest", width: 12 },
    { type: "deep_ocean", width: 16 },
    { type: "jellyfish", width: 10 },
    { type: "arctic", width: 14 },
];

const CORRIDOR_WIDTH = 4;
const CORRIDOR_HEIGHT = 5;
const EXHIBIT_GAP = 3;
const TANK_DEPTH = 14;
const TANK_HEIGHT = 8;

/**
 * Generates a full aquarium: a viewing corridor running along +X, with a
 * row of themed tanks opening onto it. Same seed -> same layout.
 */
export function* generateAquariumJob(dimension, options = {}) {
    const origin = options.origin ?? { x: 0, y: 64, z: 0 };
    const exhibits = options.exhibits ?? DEFAULT_EXHIBITS;
    const seed = options.seed ?? Date.now();
    const rng = mulberry32(typeof seed === "string" ? hashStringToSeed(seed) : seed);

    const totalLength =
        exhibits.reduce((sum, e) => sum + (e.width ?? 12), 0) + EXHIBIT_GAP * (exhibits.length + 1);

    const corridorX1 = origin.x;
    const corridorX2 = origin.x + totalLength;
    const corridorZ1 = origin.z;
    const corridorZ2 = origin.z + CORRIDOR_WIDTH - 1;

    // Corridor floor and ceiling.
    yield* fillBoxJob(dimension, corridorX1, origin.y, corridorZ1, corridorX2, origin.y, corridorZ2, "minecraft:stone_bricks");
    yield* fillBoxJob(
        dimension,
        corridorX1, origin.y + CORRIDOR_HEIGHT, corridorZ1,
        corridorX2, origin.y + CORRIDOR_HEIGHT, corridorZ2,
        "minecraft:stone_brick_slab"
    );
    // Corridor end walls.
    yield* fillBoxJob(dimension, corridorX1, origin.y, corridorZ1, corridorX1, origin.y + CORRIDOR_HEIGHT, corridorZ2, "minecraft:stone_bricks");
    yield* fillBoxJob(dimension, corridorX2, origin.y, corridorZ1, corridorX2, origin.y + CORRIDOR_HEIGHT, corridorZ2, "minecraft:stone_bricks");

    let cursorX = origin.x + EXHIBIT_GAP;
    for (const exhibit of exhibits) {
        const width = exhibit.width ?? 12;
        yield* createExhibitJob(dimension, {
            x: cursorX,
            y: origin.y,
            z: corridorZ2 + 1,
            width,
            depth: TANK_DEPTH,
            height: TANK_HEIGHT,
            theme: exhibit.type,
            label: exhibit.label,
            rng,
        });
        cursorX += width + EXHIBIT_GAP;
    }
}

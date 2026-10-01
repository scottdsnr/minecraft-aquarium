import { fillBoxJob } from "./blocks.js";
import { createTankJob } from "./tanks.js";
import { furnishZoneJob } from "./exhibits.js";
import { mulberry32, hashStringToSeed } from "./rng.js";

const DEFAULT_ZONES = [
    { type: "icy", width: 14 },
    { type: "kelp_forest", width: 14 },
    { type: "coral_reef", width: 16 },
    { type: "deep_ocean", width: 16 },
];

const CORRIDOR_WIDTH = 4;
const CORRIDOR_HEIGHT = 5;
const MARGIN = 3; // walkway before/after the tank, inside the corridor
const TANK_DEPTH = 14;
const TANK_HEIGHT = 8;
const FOUNDATION_DEPTH = 10;

/**
 * Generates a full aquarium: a viewing corridor running along +X, with one
 * continuous open-top tank alongside it, divided into themed zones (floor,
 * decoration, mobs, accent color, sign) rather than separate walled tanks.
 * Same seed -> same layout.
 */
export function* generateAquariumJob(dimension, options = {}) {
    const origin = options.origin ?? { x: 0, y: 64, z: 0 };
    const zones = options.exhibits ?? options.zones ?? DEFAULT_ZONES;
    const seed = options.seed ?? Date.now();
    const rng = mulberry32(typeof seed === "string" ? hashStringToSeed(seed) : seed);

    const tankWidth = zones.reduce((sum, z) => sum + (z.width ?? 14), 0);
    const totalLength = tankWidth + MARGIN * 2;

    const corridorX1 = origin.x;
    const corridorX2 = origin.x + totalLength;
    const corridorZ1 = origin.z;
    const corridorZ2 = origin.z + CORRIDOR_WIDTH - 1;
    const tankX1 = corridorX1 + MARGIN;
    const tankZ1 = corridorZ2 + 1;
    const footprintZ2 = tankZ1 + TANK_DEPTH - 1;

    // Solid foundation under the whole footprint so the building doesn't
    // float where terrain dips below the origin's height.
    yield* fillBoxJob(
        dimension,
        corridorX1, origin.y - FOUNDATION_DEPTH, corridorZ1,
        corridorX2, origin.y - 1, footprintZ2,
        "minecraft:stone"
    );

    // Corridor floor, ceiling, and end walls.
    yield* fillBoxJob(dimension, corridorX1, origin.y, corridorZ1, corridorX2, origin.y, corridorZ2, "minecraft:stone_bricks");
    yield* fillBoxJob(
        dimension,
        corridorX1, origin.y + CORRIDOR_HEIGHT, corridorZ1,
        corridorX2, origin.y + CORRIDOR_HEIGHT, corridorZ2,
        "minecraft:stone_brick_slab"
    );
    yield* fillBoxJob(dimension, corridorX1, origin.y, corridorZ1, corridorX1, origin.y + CORRIDOR_HEIGHT, corridorZ2, "minecraft:stone_bricks");
    yield* fillBoxJob(dimension, corridorX2, origin.y, corridorZ1, corridorX2, origin.y + CORRIDOR_HEIGHT, corridorZ2, "minecraft:stone_bricks");

    // One continuous open-top tank spanning every zone.
    const tankOpts = {
        x: tankX1, y: origin.y, z: tankZ1,
        width: tankWidth, depth: TANK_DEPTH, height: TANK_HEIGHT,
        floor: "minecraft:sand",
        openTop: true,
    };
    yield* createTankJob(dimension, tankOpts);

    const interior = tankOpts.interior;
    const interiorWidth = interior.x2 - interior.x1 + 1;
    const scale = interiorWidth / tankWidth;

    let cursorX = interior.x1;
    for (let i = 0; i < zones.length; i++) {
        const zone = zones[i];
        const isLast = i === zones.length - 1;
        const rawWidth = Math.max(1, Math.round((zone.width ?? 14) * scale));
        const zoneX2 = isLast ? interior.x2 : Math.min(interior.x2, cursorX + rawWidth - 1);

        const zoneInterior = {
            x1: cursorX, x2: zoneX2,
            y1: interior.y1, y2: interior.y2,
            z1: interior.z1, z2: interior.z2,
        };

        yield* furnishZoneJob(dimension, {
            interior: zoneInterior,
            tankZ1,
            floorY: origin.y,
            signY: origin.y + 1,
            theme: zone.type,
            label: zone.label,
            rng,
        });

        cursorX = zoneX2 + 1;
    }
}

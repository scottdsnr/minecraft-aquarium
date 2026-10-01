import { fillBoxJob } from "./blocks.js";

/**
 * Builds one rectangular glass tank: a floor, four walls, water filling
 * the interior, and (unless `openTop`) a glass ceiling. With `openTop`,
 * the walls still run the full height but nothing caps them, so the
 * water surface sits open to the sky like a pool.
 *
 * Returns the interior bounds (the swimmable/decoratable volume) via the
 * `interior` field on the options object passed in, so callers composing
 * jobs with yield* can read it back after the job runs.
 */
export function* createTankJob(dimension, opts) {
    const {
        x, y, z,
        width, depth, height,
        wall = "minecraft:glass",
        floor = "minecraft:sand",
        water = "minecraft:water",
        openTop = false,
    } = opts;

    const x2 = x + width - 1;
    const y2 = y + height - 1;
    const z2 = z + depth - 1;

    // Floor.
    yield* fillBoxJob(dimension, x, y, z, x2, y, z2, wall);

    // Four full-height walls (built individually, not as a hollow box, so
    // the top can be left open rather than capped).
    yield* fillBoxJob(dimension, x, y + 1, z, x2, y2, z, wall); // south (corridor-facing)
    yield* fillBoxJob(dimension, x, y + 1, z2, x2, y2, z2, wall); // north
    yield* fillBoxJob(dimension, x, y + 1, z, x, y2, z2, wall); // west
    yield* fillBoxJob(dimension, x2, y + 1, z, x2, y2, z2, wall); // east

    if (!openTop) {
        yield* fillBoxJob(dimension, x, y2, z, x2, y2, z2, wall);
    }

    // Substrate: one block layer on the bottom of the interior.
    yield* fillBoxJob(dimension, x + 1, y + 1, z + 1, x2 - 1, y + 1, z2 - 1, floor);

    // Water above the substrate, up to the open surface (or just below
    // the ceiling when closed).
    const waterTopY = openTop ? y2 : y2 - 1;
    if (y + 2 <= waterTopY) {
        yield* fillBoxJob(dimension, x + 1, y + 2, z + 1, x2 - 1, waterTopY, z2 - 1, water);
    }

    opts.interior = {
        x1: x + 1, x2: x2 - 1,
        y1: y + 1, y2: waterTopY,
        z1: z + 1, z2: z2 - 1,
    };
}

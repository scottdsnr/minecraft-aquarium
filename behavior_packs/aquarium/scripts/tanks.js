import { fillBoxJob } from "./blocks.js";

/**
 * Builds a sealed rectangular glass tank: a solid shell, a substrate layer
 * on the bottom, and water filling the rest of the interior.
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
    } = opts;

    const x2 = x + width - 1;
    const y2 = y + height - 1;
    const z2 = z + depth - 1;

    // Shell (hollow: just the walls, air inside).
    yield* fillBoxJob(dimension, x, y, z, x2, y2, z2, wall, "hollow");

    // Substrate: one block layer on the bottom of the interior.
    yield* fillBoxJob(dimension, x + 1, y + 1, z + 1, x2 - 1, y + 1, z2 - 1, floor);

    // Water above the substrate, up to just below the ceiling.
    if (y + 2 <= y2 - 1) {
        yield* fillBoxJob(dimension, x + 1, y + 2, z + 1, x2 - 1, y2 - 1, z2 - 1, water);
    }

    opts.interior = {
        x1: x + 1, x2: x2 - 1,
        y1: y + 1, y2: y2 - 1,
        z1: z + 1, z2: z2 - 1,
    };
}

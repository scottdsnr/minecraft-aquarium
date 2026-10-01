import { createTankJob } from "./tanks.js";
import { decorateTankJob, spawnMobs, themeFor } from "./decorations.js";

/**
 * Builds one themed exhibit: a tank, its decoration, and its mobs, then
 * labels it with a sign facing the viewing corridor.
 */
export function* createExhibitJob(dimension, opts) {
    const { x, y, z, width, depth, height, theme, rng, label } = opts;

    const tankOpts = { x, y, z, width, depth, height, floor: themeFor(theme).floor };
    yield* createTankJob(dimension, tankOpts);

    yield* decorateTankJob(dimension, tankOpts.interior, theme, rng);
    spawnMobs(dimension, tankOpts.interior, theme, rng);

    placeLabel(dimension, x, y, z, width, label ?? titleCase(theme));

    return tankOpts.interior;
}

function placeLabel(dimension, x, y, z, width, text) {
    const signX = x + Math.floor(width / 2);
    const signY = y + 1;
    try {
        const block = dimension.getBlock({ x: signX, y: signY, z: z - 1 });
        block?.setType("minecraft:standing_sign");
        const sign = block?.getComponent("minecraft:sign");
        sign?.setText(text);
    } catch {
        // Sign component availability varies by engine version; non-fatal.
    }
}

function titleCase(id) {
    return id
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
}

import { fillBoxJob } from "./blocks.js";
import { createTankJob } from "./tanks.js";
import { decorateTankJob, spawnMobs, themeFor } from "./decorations.js";

/**
 * Builds one themed exhibit: a tank, its decoration, its mobs, a colored
 * accent trim identifying the zone from outside, and a sign facing the
 * viewing corridor.
 */
export function* createExhibitJob(dimension, opts) {
    const { x, y, z, width, depth, height, theme, rng, label } = opts;
    const themeDef = themeFor(theme);

    const tankOpts = { x, y, z, width, depth, height, floor: themeDef.floor };
    yield* createTankJob(dimension, tankOpts);

    yield* decorateTankJob(dimension, tankOpts.interior, theme, rng);
    spawnMobs(dimension, tankOpts.interior, theme, rng);

    // Zone-color accent stripe along the bottom of the corridor-facing wall.
    yield* fillBoxJob(dimension, x, y, z - 1, x + width - 1, y, z - 1, themeDef.accent);

    placeLabel(dimension, x, y, z, width, label ?? themeDef.label ?? titleCase(theme));

    return tankOpts.interior;
}

// Standing signs use a 16-step "ground_sign_direction" state (0-15, same
// scale as player yaw/entity rotation). The sign sits just south of the
// tank, so its text needs to face south (toward smaller Z) to be readable
// by someone walking the corridor and looking north at the exhibit.
const SIGN_DIRECTION_SOUTH = 0;

function placeLabel(dimension, x, y, z, width, text) {
    const signX = x + Math.floor(width / 2);
    const signY = y + 1;
    const signZ = z - 1;
    try {
        dimension.runCommand(
            `setblock ${signX} ${signY} ${signZ} standing_sign ["ground_sign_direction"=${SIGN_DIRECTION_SOUTH}]`
        );
        const sign = dimension.getBlock({ x: signX, y: signY, z: signZ })?.getComponent("minecraft:sign");
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

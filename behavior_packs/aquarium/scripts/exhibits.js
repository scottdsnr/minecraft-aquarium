import { fillBoxJob } from "./blocks.js";
import { decorateTankJob, spawnMobs, themeFor } from "./decorations.js";

/**
 * Furnishes one zone: a sub-region (x-slice) of a single shared tank
 * interior, so the whole aquarium is one continuous body of water fish
 * can swim through, not separate walled-off tanks. Overwrites the zone's
 * floor with its substrate, scatters themed decoration, spawns mobs,
 * paints an accent trim on the exterior, and labels it with a sign facing
 * the viewing corridor.
 */
export function* furnishZoneJob(dimension, opts) {
    const { interior, tankZ1, floorY, signY, theme, rng, label } = opts;
    const themeDef = themeFor(theme);

    yield* fillBoxJob(
        dimension,
        interior.x1, interior.y1, interior.z1,
        interior.x2, interior.y1, interior.z2,
        themeDef.floor
    );

    yield* decorateTankJob(dimension, interior, theme, rng);
    spawnMobs(dimension, interior, theme, rng);

    const trimZ = tankZ1 - 1;
    yield* fillBoxJob(dimension, interior.x1, floorY, trimZ, interior.x2, floorY, trimZ, themeDef.accent);

    placeLabel(
        dimension,
        interior.x1, signY, trimZ,
        interior.x2 - interior.x1 + 1,
        label ?? themeDef.label ?? titleCase(theme)
    );

    return interior;
}

// Standing signs use a 16-step "ground_sign_direction" state (0-15, same
// scale as player yaw/entity rotation). The sign sits just south of the
// tank, so its text needs to face south (toward smaller Z) to be readable
// by someone walking the corridor and looking north at the exhibit.
const SIGN_DIRECTION_SOUTH = 0;

function placeLabel(dimension, x1, signY, signZ, width, text) {
    const signX = x1 + Math.floor(width / 2);
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

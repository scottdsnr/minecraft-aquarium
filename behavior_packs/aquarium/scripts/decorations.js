import { setBlock } from "./blocks.js";
import { pick } from "./rng.js";

export const THEMES = {
    tropical_reef: {
        floor: "minecraft:sand",
        coral: [
            "minecraft:brain_coral_block",
            "minecraft:tube_coral_block",
            "minecraft:fire_coral_block",
            "minecraft:horn_coral_block",
            "minecraft:bubble_coral_block",
        ],
        extras: ["minecraft:sea_pickle", "minecraft:kelp"],
        mobs: ["minecraft:tropicalfish", "minecraft:pufferfish"],
    },
    kelp_forest: {
        floor: "minecraft:gravel",
        coral: [],
        extras: ["minecraft:kelp", "minecraft:seagrass", "minecraft:stone"],
        mobs: ["minecraft:cod", "minecraft:salmon", "minecraft:turtle"],
    },
    deep_ocean: {
        floor: "minecraft:clay",
        coral: [],
        extras: ["minecraft:prismarine", "minecraft:sea_lantern", "minecraft:deepslate"],
        mobs: ["minecraft:squid", "minecraft:guardian"],
    },
    jellyfish: {
        floor: "minecraft:soul_sand",
        coral: [],
        extras: ["minecraft:sea_lantern"],
        mobs: ["minecraft:glow_squid"],
    },
    arctic: {
        floor: "minecraft:packed_ice",
        coral: [],
        extras: ["minecraft:packed_ice", "minecraft:blue_ice", "minecraft:snow_block"],
        mobs: ["minecraft:salmon", "minecraft:polar_bear"],
    },
};

export function themeFor(name) {
    return THEMES[name] ?? THEMES.tropical_reef;
}

/** Scatters coral/kelp/rock decoration across the tank's floor layer. */
export function* decorateTankJob(dimension, interior, themeName, rng) {
    const theme = themeFor(themeName);
    let count = 0;

    for (let x = interior.x1; x <= interior.x2; x++) {
        for (let z = interior.z1; z <= interior.z2; z++) {
            const roll = rng();
            if (roll < 0.10 && theme.coral.length) {
                setBlock(dimension, x, interior.y1, z, pick(rng, theme.coral));
            } else if (roll < 0.22 && theme.extras.length) {
                setBlock(dimension, x, interior.y1, z, pick(rng, theme.extras));
            }
            if (++count % 128 === 0) yield;
        }
    }
}

export function spawnMobs(dimension, interior, themeName, rng, count = 6) {
    const theme = themeFor(themeName);
    if (!theme.mobs.length) return;

    for (let i = 0; i < count; i++) {
        const x = interior.x1 + rng() * (interior.x2 - interior.x1);
        const y = interior.y1 + 1 + rng() * Math.max(1, interior.y2 - interior.y1 - 2);
        const z = interior.z1 + rng() * (interior.z2 - interior.z1);
        try {
            dimension.spawnEntity(pick(rng, theme.mobs), { x, y, z });
        } catch {
            // Entity may be unavailable in this version; skip it.
        }
    }
}

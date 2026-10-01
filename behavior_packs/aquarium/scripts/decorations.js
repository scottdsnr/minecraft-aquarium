import { setBlock } from "./blocks.js";
import { pick } from "./rng.js";

// Four zones, matching the rescue-aquarium concept: Icy, Kelp Forest,
// Coral Reef, Deep Ocean. `accent` is a colored concrete used as a trim
// stripe on each zone's exterior so zones are visually distinguishable
// from outside the building, matching the reference's per-zone color coding.
//
// Penguins, reef dolphins, and crabs aren't vanilla Bedrock mobs as of this
// add-on's target engine version — substituted with the closest vanilla
// equivalent below. Swap these for a mob add-on's entity IDs if you have one.
export const THEMES = {
    icy: {
        label: "Icy Zone",
        accent: "minecraft:light_blue_concrete",
        floor: "minecraft:packed_ice",
        coral: [],
        extras: ["minecraft:snow_block", "minecraft:blue_ice", "minecraft:packed_ice"],
        pillar: "minecraft:packed_ice", // iceberg
        mobs: ["minecraft:squid", "minecraft:polar_bear"], // penguin: no vanilla equivalent
    },
    kelp_forest: {
        label: "Kelp Forest",
        accent: "minecraft:lime_concrete",
        floor: "minecraft:gravel",
        coral: [],
        extras: ["minecraft:kelp", "minecraft:seagrass", "minecraft:big_dripleaf", "minecraft:small_dripleaf"],
        pillar: "minecraft:kelp", // kelp tower
        mobs: ["minecraft:cod", "minecraft:salmon", "minecraft:turtle"], // crab: no vanilla equivalent
    },
    coral_reef: {
        label: "Coral Reef",
        accent: "minecraft:pink_concrete",
        floor: "minecraft:sand",
        coral: [
            "minecraft:brain_coral_block",
            "minecraft:tube_coral_block",
            "minecraft:fire_coral_block",
            "minecraft:horn_coral_block",
            "minecraft:bubble_coral_block",
        ],
        extras: ["minecraft:sea_pickle"],
        pillar: "minecraft:tube_coral_block",
        mobs: ["minecraft:tropicalfish", "minecraft:dolphin"],
    },
    deep_ocean: {
        label: "Deep Ocean Zone",
        accent: "minecraft:black_concrete",
        floor: "minecraft:deepslate",
        coral: [],
        extras: ["minecraft:deepslate", "minecraft:amethyst_block", "minecraft:budding_amethyst", "minecraft:deepslate_gold_ore"],
        pillar: "minecraft:amethyst_block", // trench crystal formation
        mobs: ["minecraft:glow_squid", "minecraft:axolotl"],
    },
};

export function themeFor(name) {
    return THEMES[name] ?? THEMES.coral_reef;
}

/**
 * Scatters themed decoration across the tank's floor layer, plus the
 * occasional short pillar/iceberg/crystal cluster so the tank reads as
 * furnished rather than an empty box with a colored floor.
 */
export function* decorateTankJob(dimension, interior, themeName, rng) {
    const theme = themeFor(themeName);
    const maxPillarHeight = Math.max(1, Math.min(4, interior.y2 - interior.y1 - 1));
    let count = 0;

    for (let x = interior.x1; x <= interior.x2; x++) {
        for (let z = interior.z1; z <= interior.z2; z++) {
            const roll = rng();
            if (roll < 0.12 && theme.pillar) {
                const pillarHeight = 1 + Math.floor(rng() * maxPillarHeight);
                for (let dy = 0; dy < pillarHeight; dy++) {
                    setBlock(dimension, x, interior.y1 + dy, z, theme.pillar);
                }
            } else if (roll < 0.30 && theme.coral.length) {
                setBlock(dimension, x, interior.y1, z, pick(rng, theme.coral));
            } else if (roll < 0.55 && theme.extras.length) {
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

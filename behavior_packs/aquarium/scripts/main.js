import { system, world } from "@minecraft/server";
import { generateAquariumJob } from "./generator.js";

/**
 * Entry point. Trigger generation in-game with:
 *   /scriptevent aqua:generate
 *   /scriptevent aqua:generate {"seed":"reef-1","origin":{"x":100,"y":64,"z":100}}
 * or via functions/generate.mcfunction (/function aquarium/generate).
 */
system.afterEvents.scriptEventReceive.subscribe(
    (event) => {
        const player = event.sourceEntity;
        const dimension = player?.dimension ?? world.getDimension("overworld");

        let options = {};
        if (event.message) {
            try {
                options = JSON.parse(event.message);
            } catch {
                world.sendMessage(`§caquarium: could not parse options, using defaults (${event.message})`);
            }
        }

        if (!options.origin && player) {
            const loc = player.location;
            options.origin = { x: Math.floor(loc.x), y: Math.floor(loc.y), z: Math.floor(loc.z) };
        }

        world.sendMessage(`§baquarium: generating (seed=${options.seed ?? "random"})...`);
        system.runJob(
            (function* () {
                yield* generateAquariumJob(dimension, options);
                world.sendMessage("§aaquarium: generation complete.");
            })()
        );
    },
    { namespaces: ["aqua"] }
);

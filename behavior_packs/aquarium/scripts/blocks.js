// Block placement helpers, written as generators so callers can `yield*`
// them into a system.runJob and spread work across ticks.
//
// These shell out to the /fill command rather than looping individual
// Block.setType calls: it's both much faster for large volumes and more
// reliable for liquids (a looped setType on "minecraft:water" can silently
// no-op on some engine versions).

export function setBlock(dimension, x, y, z, blockType) {
    try {
        dimension.getBlock({ x, y, z })?.setType(blockType);
    } catch {
        // Chunk not loaded/generated; skip rather than fail the whole job.
    }
}

/** mode: undefined (solid fill), "hollow" (shell only, air inside), "keep" (only replace air). */
export function* fillBoxJob(dimension, x1, y1, z1, x2, y2, z2, blockType, mode) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);
    const block = blockType.replace(/^minecraft:/, "");

    const cmd = `fill ${minX} ${minY} ${minZ} ${maxX} ${maxY} ${maxZ} ${block}${mode ? " " + mode : ""}`;
    try {
        dimension.runCommand(cmd);
    } catch {
        // Volume too large for one /fill call, or area unloaded; skip.
    }
    yield;
}

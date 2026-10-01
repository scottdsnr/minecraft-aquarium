// Low-level block placement helpers, written as generators so callers can
// `yield*` them into a system.runJob and spread heavy fills across ticks.

const YIELD_EVERY = 256;

export function setBlock(dimension, x, y, z, blockType) {
    try {
        dimension.getBlock({ x, y, z })?.setType(blockType);
    } catch {
        // Chunk not loaded/generated; skip rather than fail the whole job.
    }
}

export function* fillBoxJob(dimension, x1, y1, z1, x2, y2, z2, blockType) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

    let count = 0;
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                setBlock(dimension, x, y, z, blockType);
                if (++count % YIELD_EVERY === 0) yield;
            }
        }
    }
}

export function* hollowBoxJob(dimension, x1, y1, z1, x2, y2, z2, blockType) {
    const minX = Math.min(x1, x2), maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2), maxY = Math.max(y1, y2);
    const minZ = Math.min(z1, z2), maxZ = Math.max(z1, z2);

    let count = 0;
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            for (let z = minZ; z <= maxZ; z++) {
                const onShell =
                    x === minX || x === maxX ||
                    y === minY || y === maxY ||
                    z === minZ || z === maxZ;
                if (onShell) setBlock(dimension, x, y, z, blockType);
                if (++count % YIELD_EVERY === 0) yield;
            }
        }
    }
}

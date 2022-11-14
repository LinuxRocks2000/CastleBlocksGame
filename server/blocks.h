#pragma once
// Defining block types.

enum BlockTypes { // Propagate as necessary
    // In no real order, but more complex blocks should generally be lower
    BASIC_DIRT   = 0, // Explicit is better than implicit. Don't want to be screwed over by compiler differences
    BASIC_SAND   = 1,
    BASIC_FENCE  = 2,
    BASIC_GRASS  = 3,
    BASIC_SHRUBS = 4
};

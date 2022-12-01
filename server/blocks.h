#pragma once
// Defining block types.

enum BlockTypes { // Propagate as necessary
    // In no real order, but more complex blocks should generally be lower
    BASIC_DIRT   = 0, // Explicit is better than implicit. Don't want to be screwed over by compiler differences
    BASIC_SAND   = 1,
    CASTLEBLOCK  = 2,
    BASIC_FENCE  = 3,
    BASIC_GRASS  = 4,
    BASIC_SHRUBS = 5
};

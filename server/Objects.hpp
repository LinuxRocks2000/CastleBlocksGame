#pragma once
#include "blocks.h"

// Performance notes:
// Since there's gonna be a *lot* more bricks than other objects, bricks don't get run. They exist in memory and that is ALL.
// Logic should not be done on bricks, it should be done on dynamic things using bricks as inputs. Bricks are dataclasses only.

// We don't want to iterate over an array of 10 million objects every tick.
// The idea is that the bricks will all be allocated in an orderly fashion so we can just use index math.

// The below function will convert X and Y to an index in any given properly-formatted brick array:
long long brick_indexFromXY(long long x, long long y, long long worldWidth){
    return y * worldWidth + x;
}

struct Brick{
    uint8_t type; // As in, the type of brick. Changes logic.
    long long x; // Guaranteed to be 64 bits IIRC
    long long y; // ditto.
};

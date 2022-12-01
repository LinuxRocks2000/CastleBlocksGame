#pragma once
#include "blocks.h"

// Performance notes:
// Since there's gonna be a *lot* more bricks than other objects, bricks don't get run. They exist in memory and that is ALL.
// Logic should not be done on bricks, it should be done on dynamic things using bricks as inputs. Bricks are dataclasses only.

// We don't want to iterate over an array of 10 million objects every tick.
// The idea is that the bricks will all be allocated in an orderly fashion so we can just use index math.

struct Brick;


struct CastleBlock{ // Controls most of a client.
    long money = 0;
    Brick* physical = 0; // A physical brick in the Mass Brick Array. If 0, you can ONLY place a castle block.
    long long id = 0;
    ~CastleBlock();
};


struct Brick{
    uint8_t type; // As in, the type of brick. Changes logic.
    long long x; // Guaranteed to be 64 bits IIRC
    long long y; // ditto.
    CastleBlock* owner = 0; // If the owner is 0, it can be mutated by *any* Castle Block
    float durability = 100; // Might restructure this later; for now, max is ALWAYS 100 and different types respond differently to damage
};


CastleBlock::~CastleBlock(){
    app.setBlock(physical -> x, physical -> y, 0); // this is bad. fix later when i'm not in an sshed nano.
}

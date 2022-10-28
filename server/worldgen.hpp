#pragma once
#include "Objects.hpp"


namespace worldgen{
    // If you don't want the list as a pointer, it's a matter of removing a single * in Game.hpp to get the raw values.
    void generate(std::vector<Brick*>* bricks, long long worldWidth, long long worldHeight){ // Pointer to the bricks vector. It'll be empty when you use it, I promise. (It'll be spliced into the world array; the vector is for niceness).
        // Worldgen people: this is the function
        // Do whatever else you want in the namespace but please don't change this function profile as it's set up to be C++ey.
    }
}

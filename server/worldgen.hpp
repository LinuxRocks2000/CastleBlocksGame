#pragma once
#include "Objects.hpp"


namespace worldgen{
    // If you don't want the list as a pointer, it's a matter of removing a single * in Game.hpp to get the raw values.
    void generate(Brick bricks[WORLD_WIDTH][WORLD_HEIGHT]){
        // Worldgen people: this is the function
        // Do whatever else you want in the namespace but please don't change this function profile as it's set up to be C++ey.
        for (long long x = 0; x < WORLD_WIDTH; x ++){
            for (long long y = 0; y < WORLD_HEIGHT; y ++){
                int squareX = x % 10;
                int squareY = y % 10;
                if (squareX > 3 && squareX < 7 && squareY > 3 && squareY < 7){
                    bricks[x][y].type = BlockTypes::BASIC_SAND;
                }
            }
        }
    }
}

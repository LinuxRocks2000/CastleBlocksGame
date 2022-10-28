#pragma once
#include <vector>
#include "worldgen.hpp"

// Performance notes:
// Since there's gonna be a *lot* more bricks than other objects, bricks don't get run. They exist in memory and that is ALL.
// Logic should not be done on bricks, it should be done on dynamic things using bricks as inputs. Bricks are dataclasses only.


class Game { // Game logic.
    std::vector<Brick*> tileset;
public:
    Game(){

    }

    void run(){

    }

    void init(){
        worldgen::generate(&tileset);
    }
};

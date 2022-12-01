// The castle blocks main server file. The primary compilation target.
#define CASTLE_BLOCKS_DB_VERSION "1.0" // Version of the database formatting. HAVE TO UPDATE THIS WITH EVERY DATABASE UPDATE!
#define WORLD_WIDTH  500
#define WORLD_HEIGHT 500


#define CROW_ENFORCE_WS_SPEC
#include "crow_all.h"

#include <httplib.h>

#include "blocks.h"
#include "Objects.hpp"
#include "StringStream.hpp"

#include <thread>
#include <iostream>

#include "typedefs.h"
#include "worldgen.hpp"


class GameClient {
public:
    WebsocketConnectionPointer conn;
    unsigned long id;
    CastleBlock meinBlock;

    ~GameClient() = default;

    void onClientMessage(char verb, StringStream data){
        if (verb == 's'){ // Requesting a current client state. Should always be sent after metadata is loaded.
            updateStatus();
        }
    }

    void updateStatus(){
        char state = 0; // Don't want to send string termination characters
        /* Bits and what they mean:
            bit 0 (base 10 =1): Whether the castle block has been placed or not (if it has, expect some bytes of block metadata)
        */
        if (meinBlock.physical != 0){
            state = state || 1;
        }
        std::string message = "s";
        message += state;
        std::cout << (long)state << std::endl;
        conn -> send_binary(message);
    }
};


Brick tileset[WORLD_WIDTH][WORLD_HEIGHT]; // Hush. C++ weirdery.


class Application {
    std::map <WebsocketConnectionPointer, GameClient*> clients;
    unsigned long long rID = 0; // unsigned longs ftw

public:
    Application(){
        // Probably gonna move this eventually
        for (long long x = 0; x < WORLD_WIDTH; x ++){
            for (long long y = 0; y < WORLD_HEIGHT; y ++){
                tileset[x][y].type = BlockTypes::BASIC_DIRT;
                tileset[x][y].x = x;
                tileset[x][y].y = y;
            }
        }
        worldgen::generate(tileset);
    }

    void setData(std::string name, std::string value, WebsocketConnectionPointer conn){
        conn -> send_text("r" + std::to_string(value.size()) + name + " " + value);
    }

    void clientEnter(WebsocketConnectionPointer conn){
        GameClient* cl = new GameClient {conn, rID};
        clients[conn] = cl;
        conn -> send_text(std::to_string(rID));
        rID ++;
    }

    void clientLeave(WebsocketConnectionPointer conn, std::string reason){
        GameClient* cl = clients[conn];
        clients.erase(conn);
        delete cl;
    }

    void sendBrick(WebsocketConnectionPointer conn, Brick brick){
        conn -> send_text("b" + std::to_string(brick.x) + " " + std::to_string(brick.y) + " " + std::to_string(brick.type));
    }

    void clientMessage(WebsocketConnectionPointer conn, std::string message, bool is_binary){
        StringStream data(message);
        char verb = data.read();
        if (verb == 'b'){
            std::cout << data.buffer << std::endl;
            long long x = data.readNumber();
            data.read(); // Purge a space
            long long y = data.readNumber();
            data.read(); // Ditto
            long long width = data.readNumber();
            data.read(); // Yo.
            long long height = data.readNumber();
            if (x < 0){
                width += x;
                x = 0;
            }
            if (y < 0){
                height += y;
                y = 0;
            }
            if (x + width > WORLD_WIDTH){ // note that this won't catch x > WORLD_WIDTH.
                width -= (x + width) - WORLD_WIDTH;
            }
            if (y + height > WORLD_HEIGHT){
                height -= (y + height) - WORLD_WIDTH;
            }
            for (long long _x = 0; _x < width; _x ++){
                for (long long _y = 0; _y < height; _y ++){
                    sendBrick(conn, tileset[x + _x][y + _y]);
                }
            }
            conn -> send_text("D"); // Done preloading
            std::cout << "Done sending bricks" << std::endl;
        }
        else if (verb == 'B'){
            long long x = data.readNumber();
            data.read(); // Purge the space
            long long y = data.readNumber();
            sendBrick(conn, tileset[x][y]);
        }
        else if (verb == 'm'){
            conn -> send_text("m" + std::to_string(WORLD_WIDTH) + " " + std::to_string(WORLD_HEIGHT)); // add more params later
        }
        else if (verb == 'p'){ // All "place" does is change type.
            uint8_t type = data.readNumber();
            data.read();
            long long x = data.readNumber();
            data.read();
            long long y = data.readNumber();
            GameClient* cli = clients[conn];
            if (isPlaceable(x, y, type, cli)){
                tileset[x][y].owner = &cli -> meinBlock; // Set type to whatever you're placing and set ownership
                setBlock(x, y, type); // Other routines
                if (type == BlockTypes::CASTLEBLOCK){
                    cli -> meinBlock.physical = &(tileset[x][y]);
                }
            }
            cli -> updateStatus();
        }
        else { /* Server commands over. Client-specific block time. */
            clients[conn] -> onClientMessage(verb, data);
        }
    }

    void setBlock(long long x, long long y, uint8_t type){ // Notably we might eventually have more than 256 types. We'll cross that bridge.
        // Leave room for other routines here
        tileset[x][y].type = type;
        tileset[x][y].durability = 100;
        updateBrick(x, y);
    }

    void updateBrick(long long x, long long y){
        for (auto const& it : clients){
            sendBrick(&(*it.second -> conn), tileset[x][y]);
        }
    }

    bool isPlaceable(long long x, long long y, long long type, GameClient* client){
        if (type == BlockTypes::CASTLEBLOCK && client -> meinBlock.physical){ // The client's castle block has an owned physical representation AND you're placing a castle block
            return false;
        }
        else if (tileset[x][y].owner && tileset[x][y].owner != &client -> meinBlock){ // If it has an owner that is not the client, return false
            return false;
        }
        return true;
    }
};


void staticServerThread(httplib::Server* srv){
    std::cout << "Statically serving HTTP on 0.0.0.0:8080" << std::endl;
    srv -> listen("0.0.0.0", 8080);
}


int main(){
    httplib::Server svr;
    svr.set_mount_point("/", "../pub");
    std::thread serverThread(&staticServerThread, &svr);
    serverThread.detach();

    Application app;

    crow::SimpleApp websockets;
    CROW_ROUTE(websockets, "/")
    .websocket()
    .onopen([&](WebsocketConnection conn) {
        app.clientEnter(&conn);
    }).onclose([&](WebsocketConnection conn, std::string reason) {
        app.clientLeave(&conn, reason);
    }).onmessage([&](WebsocketConnection conn, std::string data, bool is_binary) {
        app.clientMessage(&conn, data, is_binary);
    });
    websockets.port(9002).multithreaded().run();
    return 0;
}

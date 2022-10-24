// The castle blocks main server file. The primary compilation target.
#define CASTLE_BLOCKS_DB_VERSION "1.0" // Version of the database formatting. HAVE TO UPDATE THIS WITH EVERY DATABASE UPDATE!


#define CROW_ENFORCE_WS_SPEC
#include "crow_all.h"

#include <httplib.h>

#include "blocks.h"
#include "StringStream.hpp"
#include "Database.hpp"

#include <thread>
#include <iostream>

#include "typedefs.h"


class GameClient {
public:
    WebsocketConnection conn;
    unsigned long id;
};


class Application {
    Database database;
    unsigned long ticket = 0;
    std::map <WebsocketConnection, GameClient*> clients;

public:
    Application(){

    }

    void setData(std::string name, std::string value, WebsocketConnection conn){
        conn.send_text("r" + std::to_string(value.size()) + name + " " + value);
    }

    void clientEnter(WebsocketConnection conn){
        ticket ++;
        GameClient* cl = new GameClient();
        clients[conn] = cl;
    }

    void clientLeave(WebsocketConnection conn, std::string reason){
        GameClient* cl = clients[conn];
    }

    void clientMessage(WebsocketConnection conn, std::string message, bool is_binary){
        StringStream data(message);
    }
};


void staticServerThread(httplib::Server* srv){
    std::cout << "Statically serving HTTP on 0.0.0.0:8080" << std::endl;
    srv -> listen("0.0.0.0", 8080);
}


int main(){
    StringStream stream("Hello");
    httplib::Server svr;
    svr.set_mount_point("/", "../pub");
    std::thread serverThread(&staticServerThread, &svr);
    serverThread.detach();

    Application app;

    crow::SimpleApp websockets;
    CROW_ROUTE(websockets, "/")
    .websocket()
    .onopen([&](WebsocketConnection conn) {
        app.clientEnter(conn);
    }).onclose([&](WebsocketConnection conn, std::string reason) {
        app.clientLeave(conn, reason);
    }).onmessage([&](WebsocketConnection conn, std::string data, bool is_binary) {
        app.clientMessage(conn, data, is_binary);
    });
    websockets.port(9002).multithreaded().run();
    return 0;
}

#include <httplib.h>
#define CROW_ENFORCE_WS_SPEC
#include "crow_all.h"

#include <iostream>

#include <mysqlx/xdevapi.h>
#include "configreader.hpp"
#include <thread>
using namespace mysqlx::abi2::r0;

typedef crow::websocket::connection WebsocketConnection;


class Client {
    
};


class Application {
    ConfigReader cnf;
    Session* session;
    Schema* database;

public:
    Application(){
        cnf.readFile("config.cnf");
        session = new Session("localhost", 33060, cnf.get("SQLuser", "null"), cnf.get("SQLpassword"));
        Schema db = (session -> getSchema(cnf.get("SQLdatabase", "testDatabase")));
        database = &db;
    }

    clientEnter(WebsocketConnection conn){

    }

    clientLeave(WebsocketConnection conn, std::string reason){

    }

    clientMessage(WebsocketConnection conn, std::string data, bool is_binary){

    }
};


void staticServerThread(httplib::Server* srv){
    std::cout << "Statically serving HTTP on 0.0.0.0:8080" << std::endl;
    srv -> listen("0.0.0.0", 8080);
}


int main(){
    httplib::Server svr;
    svr.set_mount_point("/", "./pub");
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

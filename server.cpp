#include <httplib.h>
#define CROW_ENFORCE_WS_SPEC
#include "crow_all.h"

#include <iostream>

#include <mysqlx/xdevapi.h>
#include "configreader.hpp"
#include "StringStream.hpp"
#include <thread>
using namespace mysqlx::abi2::r0;

typedef crow::websocket::connection& WebsocketConnection;

#define CASTLE_BLOCKS_DB_VERSION "1.0" // Version of the database formatting. HAVE TO UPDATE THIS WITH EVERY DATABASE UPDATE!


class Client {
    WebsocketConnection conn;
    unsigned long id;
};


class Application {
    ConfigReader cnf;
    Session* session;
    Schema* database;
    unsigned long ticket = 0;
    std::map <WebsocketConnection, Client*> clients;

public:
    Application(){
        cnf.readFile("config.cnf");
        //session = new Session("localhost", 33060, cnf.get("SQLuser", "null"), cnf.get("SQLpassword"));
        //Schema db = (session -> getSchema(cnf.get("SQLdatabase", "testDatabase")));
        //database = &db;
        //Collection collection = db.getCollection("base", true);
        //DbDoc document = collection.find("VERSION = " CASTLE_BLOCKS_DB_VERSION).execute().fetchOne();
        //if (!document){
            //document = collection.add
        //}

    }

    void setData(std::string name, std::string value, WebsocketConnection conn){
        conn.send_text("r" + std::to_string(value.size()) + name + " " + value);
    }

    void clientEnter(WebsocketConnection conn){
        ticket ++;
        Client* cl = new Client();
        clients[conn] = cl;
    }

    void clientLeave(WebsocketConnection conn, std::string reason){
        Client* cl = clients[conn];
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

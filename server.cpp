#include <httplib.h>
#define CROW_ENFORCE_WS_SPEC
#include "crow_all.h"


int main(){
    crow::SimpleApp app;
    CROW_ROUTE(app, "/")
    .websocket()
    .onopen([&](crow::websocket::connection& conn){

    }).onclose([&](crow::websocket::connection& conn, std::string reason){

    }).onmessage([&](crow::websocket::connection& conn, std::string data, bool is_binary){
        conn.send_text(data);
    });
    app.port(9002).multithreaded().run();
    httplib::Server svr;
    svr.set_mount_point("/", "./pub");
    svr.listen("0.0.0.0", 8080);
    return 0;
}

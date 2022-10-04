#include <httplib.h>

/*
void respondFile(httplib::Response* res, std::string filename, std::string type = "text/html"){
    std::ifstream file;
    file.open(filename);
    std::stringstream buffer;
    buffer << file.rdbuf();
    std::string fileData = buffer.str();
    res -> set_content(buffer.str(), type);
}*/


int main(){
    httplib::Server svr;/*
    svr.Get("/", [](const httplib::Request &, httplib::Response &res) {
        respondFile(&res, "index.html");
    });
    svr.Get("/index.html", [](const httplib::Request &, httplib::Response &res) {
        respondFile(&res, "index.html");
    });
    svr.Get("/main.css", [](const httplib::Request &, httplib::Response &res){
        respondFile(&res, "main.css", "text/css");
    });
    svr.Get("/main.js", [](const httplib::Request &, httplib::Response &res){
        respondFile(&res, "main.js", "application/javascript");
    });
    svr.Get("/README.md", [](const httplib::Request &, httplib::Response &res){
        res.set_content("Stop it. Just stop it.", "text/plain");
    });
    svr.Get("/admin", [](const httplib::Request &, httplib::Response &res) {
        respondFile(&res, "face.txt");
    });*/

    svr.set_mount_point("/", "pub");

    svr.listen("0.0.0.0", 8080);
    return 0;
}

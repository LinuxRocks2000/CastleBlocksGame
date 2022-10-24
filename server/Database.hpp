// Controls the database and stuff
#include "configreader.hpp"
#include <mysqlx/xdevapi.h>

using namespace mysqlx::abi2::r0; // Disgusting. I'll typedef later.
// (I wrote that and am thus allowed to insult it :D)


class Database{
public:
    ConfigReader cnf;
    Session* session;
    Schema* database;
    Database(){
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
};

/* Read cnf files */
#include <string>
#include <functional>
#include <iostream>


class ConfigReader {
    std::map<std::string, std::function<void(std::string)>> callbacks;
    std::map<std::string, std::string> pairs;

public:
    void on(std::string event, std::function<void(std::string)> callback){
        callbacks[event] = callback;
    }

    void readFile(std::string filename){
        std::ifstream file;
        char chr;
        file.open(filename);
        std::string name;
        std::string value;
        bool cont = true;
        while (file.peek() != EOF){
            while (true){
                file.get(chr);
                if (chr == '=' || chr == '\n'){
                    break;
                }
                name += chr;
            }
            while (true){
                file.get(chr);
                if (chr == '\n'){
                    break;
                }
                value += chr;
            }
            std::cout << name << ": " << value << std::endl;
            pairs[name] = value;
            if (callbacks.find(name) != callbacks.end()) {
                callbacks[name](value);
            }
            name = "";
            value = "";
        }
    }

    std::string get(std::string key, std::string df = ""){
	std::cout << pairs[key] << std::endl;
        if (pairs.find(key) == pairs.end()){
            return df;
        }
        else{
            return pairs[key];
        }
    }
};

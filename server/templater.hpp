// I'm writing this in Nano on my ssh server. It's absolutely gonna need a redo.
#include <stdio.h>


int TeMpLATER_COUNT = 0;


std::string genTemplate(std::string filename, std::map<std::string, std::string> variables){
    FILE* file = fopen(filename.c_str(), "r"); // Would it kill the C++ library writers to stop remaking good APIs? I always use C style threading and file I/O - it's easier and more efficient. Crazy, right?
    filename = filename.substr(filename.find_last_of("/"));
    std::string outFname = "templates" + filename;
    TeMpLATER_COUNT ++;
    FILE* out = fopen(outFname.c_str(), "w+");
    while (!feof(file)){
        char chr = fgetc(file);
        if (chr == EOF){
            break;
	}
        if (chr == '{'){
            chr = fgetc(file);
            if (chr == '{'){
                std::string name;
                while (true){
                    chr = fgetc(file);
                    if (chr == '}'){
                        if (fgetc(file) == '}'){
                            if (variables.find(name) != variables.end()){
                                for (int i = 0; i < variables[name].size(); i ++){
                                    fputc(variables[name].c_str()[i], out);
                                }
                            }
                            break;
                        }
                        else{
                            std::cerr << "ERROR: " << filename << " has an invalid template variable.";
                        }
                    }
                    name += chr;
                }
            }
            else{
                fputc('}', out);
                fputc(chr, out);
            }
        }
        else{
           fputc(chr, out);
        }
    }
    return outFname;
}

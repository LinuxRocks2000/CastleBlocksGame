// Not to be confused with std::stringstream. Wraps an std::string and provides file-io like functions.
#include <string>


class StringStream{
    std::string buffer;
    unsigned long position = 0;

    char _read(){
        if (isEmpty()){
            return EOF;
        }
        position ++;
        return buffer[position - 1];
    }

public:
    StringStream(){

    }

    StringStream(std::string initial){
        buffer = initial;
    }

    bool isEmpty(){
        return position >= buffer.size();
    }

    char read(){
        return _read();
    }

    std::string read(unsigned int length){
        std::string ret;
        for (unsigned int i = 0; i < length; i ++){
            ret += _read();
        }
        return ret;
    }

    std::string readUntil(char stopChr){
        std::string ret;
        char chr = _read();
        while (chr != stopChr && chr != EOF){
            ret += chr;
            chr = _read();
        }
        return ret;
    }
};

class SerialConsole{
    constructor(serial, historySize = 100){
        this.#serial = serial;
        this.#con = new Console(historySize);
    }

    async start(){
        if(!this.#serial.opend()){
            try{
                await this.#serial.open({baudRate: this.#baud});
            }catch(error){
                this.logError(error.message);
            }
        }

        try{
            await this.#serial.poll(msg => this.logRecv(this.#decoder.decode(msg)));
        }catch(error){
            this.logError(error.message);
        }
    }

    async stop(){
        try{
            await this.#serial.close();
        }catch(error){
            this.logError(error.message);
        }
    }

    async send(msg){
        this.#con.push(msg);
        this.logSend(msg);
        try{
            await this.#serial.write(this.#encoder.encode(msg));
        }catch(error){
            this.logError(error.message);
        }
    }

    move(step){
        return this.#con.move(step);
    }

    set txEncoding(encoding){
        if(encoding == 0){
            this.#encoder = new TextEncoder();
        }else{
            this.#encoder = new BinEncoder(encoding);
        }
    }

    set rxEncoding(encoding){
        if(encoding == 0){
            this.#decoder = new TextDecoder();
        }else{
            this.#decoder = new BinDecoder(encoding);
        }
    }

    set baudRate(baud){
        this.#baud = baud;
    }

    logRecv = msg => {};
    logSend = msg => {};
    logError = msg => {};

    #baud = 9600;

    #serial = null;

    #con = null;

    #encoder = new TextEncoder();
    #decoder = new TextDecoder();
}
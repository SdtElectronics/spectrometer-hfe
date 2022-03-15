class SerialConsole{
    constructor(serial, historySize = 100, memorySize = 100){
        this.#serial = serial;
        this.#con = new Console(memorySize);
        this.#historyMax = historySize;
    }

    async start(){
        try{
            await this.#serial.init({baudRate: this.#baud});
        }catch(error){
            this.logError(error.message);
            this.#logRotate();
        }

        try{
            this.run = true;
            await this.#serial.poll(msg => {
                this.logRecv(this.#decoder.decode(msg), msg.length);
                this.#logRotate();
            }, this);
        }catch(error){
            this.logError(error.message);
            this.#logRotate();
            if(error.message == "The device has been lost."){
                await this.stop();
                this.#serial.deinit();
                throw error;
            }
        }
    }

    pause(){
        this.run = false;
    }

    async stop(){
        try{
            await this.#serial.close();
            this.run = false;
        }catch(error){
            this.logError(error.message);
            this.#logRotate();
        }
    }

    async send(msg){
        this.#con.push(msg);
        const data = this.#encoder.encode(msg);
        this.logSend(msg, data.length);
        this.#logRotate();
        try{
            await this.#serial.write(data);
        }catch(error){
            this.logError(error.message);
        }
    }

    echo(msg){
        const data = this.#encoder.encode(msg);
        this.logSend(msg, data.length);
        this.#logRotate();
    }

    move(step){
        return this.#con.move(step);
    }

    clear(){
        this.#historyCur = 0;
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

    #logRotate(){
        if(this.#historyMax == this.#historyCur){
            this.shiftHist();
        }else{
            ++(this.#historyCur);
        }
    }

    logRecv = msg => {};
    logSend = msg => {};
    logError = msg => {};

    shiftHist = () => {};

    #baud = 9600;

    #serial = null;

    #con = null;

    #encoder = new TextEncoder();
    #decoder = new TextDecoder();

    run = false;

    #historyMax = 100;
    #historyCur = 0;
}
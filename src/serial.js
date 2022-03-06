class SerialCom{
    constructor(){
    }

    async require(filters){
        this.#port = await navigator.serial.requestPort(filters);
    }

    async open(options){
        if(!this.inited()){

        }

        if(this.opend()){

        }

        await this.#port.open(options);
        this.#init();
    }

    async init(options, filters = {}){
        if(!this.inited()){
            await this.require(filters);
        } 
        if(!this.opend()){
            await this.open(options);
        }
    }

    async read(){
        if(this.opend()){
            try{
                return await this.#reader.read();
            }catch(error){
                this.#reader = this.#readStream.getReader();
                throw error;
            }
        }

        return false;
    }

    async write(data){
        if(this.#port.writable){
            try{
                return await this.#writer.write(data);
            }catch(error){
                this.#writer = this.#port.writable.getWriter();
                throw error;
            }
        }

        return false;
    }

    async poll(callback){
        while(true){
            const { value, done } = await this.read();
            if(value){
                callback(value);
            }else{
                break;
            }

            if(done) break;
        }
    }

    async close(){
        if(!this.inited()){

        }

        if(!this.#port.readable){

        }

        this.#reader.releaseLock();
        this.#writer.releaseLock();
        await this.#port.close();
    }

    tee(){
        this.#reader.releaseLock();
        const rdStreams = this.#port.readable.tee();
        this.#readStream = rdStreams[0];
        this.#reader = this.#readStream.getReader();

        const ret = new SerialCom();
        ret.#port = this.#port;
        ret.#readStream = rdStreams[1];
        ret.#reader = rdStreams[1].getReader();
        ret.#writer = this.#writer;
        return ret;
    }

    opend(){
        return !!this.#port.readable;
    }

    inited(){
        return !!this.#port;
    }

    #init(){
        this.#readStream = this.#port.readable;
        this.#reader = this.#readStream.getReader();
        this.#writer = this.#port.writable.getWriter();
    }
    
    #readStream = null;
    #reader = null;
    #writer = null;
    #port = null;
}
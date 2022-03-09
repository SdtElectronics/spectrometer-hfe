class Spectrograph{
    constructor(){

    }

    async single(timeout){
        while(true){
            await this.acquire();
            const id = setTimeout(_ => this.acquire(), timeout);
            const arr = await this.fetch();
            clearTimeout(id);
            return this.transform(Array.from(arr));
        }
    }

    async continuous(timeout, callback){
        this.#run = true;
        while(this.#run){
            callback(await this.single(timeout));
        }
    }

    pause(){
        this.#run = false;
    }

    acquire = async ({ signal } = {})=>{};

    fetch = async () => {};

    transform = x => x;

    #run = false;
}
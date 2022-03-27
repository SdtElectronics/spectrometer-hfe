class Spectrograph{
    constructor(){

    }

    async single(timeout){
        while(true){
            await this.acquire();
            let id = 0;
            const retry = timeOut => id = setTimeout(() => {
                this.acquire();
                retry(timeOut);
            }, timeOut);
            retry(timeout);
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
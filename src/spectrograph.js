const { urlToHttpOptions } = require("url");

class Spectrograph{
    constructor(){

    }

    setRange(lower, upper){
        this.#lBound = lower;
        this.#uBound = upper;
    }

    calibrate(k, b){
        this.#k = k;
        this.#b = b;
    }

    getXscale(){
        const scale = [];
        let x;
        const end = this.#k > 0 ? (x = this.#lBound, this.#uBound) 
                                : (x = this.#uBound, this.#lBound);

        while(x != end){
            scale.push(x);
            x += this.#k;
        }
        return scale;
    }

    async #sample(timeout){
        await this.acquire();
        let id = 0;
        const retry = timeOut => id = setTimeout(() => {
            //this.acquire();
            retry(timeOut);
        }, timeOut);
        retry(timeout);
        const arr = await this.fetch();
        clearTimeout(id);
        //return this.transform(Array.from(arr));
        return Array.from(arr);
    }

    async #getClip(){
        const lb = (this.#lBound - this.#b)/this.#k;
        const ub = (this.#uBound - this.#b)/this.#k;
        return [lb, ub].sort();
    }

    async single(timeout){
        return (await this.#sample(timeout)).slice(...(this.#getClip()));
    }

    async continuous(timeout, callback, length){
        this.#run = true;

        const clip = this.#getClip();

        while(this.#run){
            const result = (await this.#sample(timeout)).slice(clip[0], clip[1]);
            callback(result);
        }
        /*
        const buf = [];
        const result = (await this.single(timeout)).map(e => e/length);
        buf.push([...result])

        for(let i = 1; i != length; ++i){
            const cur = (await this.single(timeout)).map(e => e/length);
            buf.push(cur);
            result.forEach((e, i) => result[i] += cur[i]);
        }

        while(this.#run){
            callback(result);
            const prev = buf.shift();
            result.forEach((e, i) => result[i] -= prev[i]);
            const cur = (await this.single(timeout)).map(e => e/length);
            result.forEach((e, i) => result[i] += cur[i]);
            buf.push(cur);
        }
        */
    }

    pause(){
        this.#run = false;
    }

    acquire = async function(){};

    fetch = async function(){};

    transform = x => x;

    #run = false;

    #lBound = 0;
    #uBound = 0;

    #k = 0;
    #b = 0;
}

class Console{
    constructor(historySize = 100){
        this.#historySize = historySize;
    }

    push(msg){
        if(this.#history.length == this.#historySize){
            this.#history = [];
        }

        this.#cur = 0;
        this.#history.push(msg);
    }

    move(step){
        const tmp = this.#cur + step;
        if(tmp <= this.#history.length && tmp >= 0){
            this.#cur = tmp;
        }

        if(this.#cur == 0){
            return "";
        }
        return this.#history[this.#history.length - this.#cur];
    }

    #cur = 0;
    #historySize = 100;
    #history = [];
}
class LinearFit{
    constructor(){
    }

    push(x, y){
        this.#x.push(x);
        this.#y.push(y);
    }

    fit(){
        const n = this.#y.length;
        let sum_x = 0;
        let sum_y = 0;
        let sum_xy = 0;
        let sum_xx = 0;

        for (let i = 0; i < n; ++i) {
            sum_x += this.#x[i];
            sum_y += this.#y[i];
            sum_xy += (this.#x[i]*this.#y[i]);
            sum_xx += (this.#x[i]**2);
        } 

        this.#k = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
        this.#b = (sum_y - this.#k * sum_x)/n;
    }

    get k(){
        return this.#k;
    }

    get b(){
        return this.#b;
    }

    #x = [];
    #y = [];

    #k = 0;
    #b = 0;
}
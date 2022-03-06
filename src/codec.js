class BinEncoder{
    constructor(radix){
        this.radix = radix;
    }

    encode(str){
        return new Uint8Array(str.split(' ').map(e => parseInt(this.radix)));
    }
}

class BinDecoder{
    constructor(radix){
        this.radix = radix;
    }

    decode(arr){
        return Array.prototype.map.call(arr, e => Number(e).toString(this.radix).padStart(2, '0'))
                                    .join(' ');
    }
}
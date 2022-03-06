
function derivative(arr){
    const ret = Array(arr.length);
    arr.reduce((prev, curr, ind)=>{
        ret[ind] = curr - prev;
        return curr;
    });
    return ret;
}

function spike(arr, threshold){
    const derv1st = derivative(arr);
    const derv2nd = derivative(derv1st);
    const ret = [];
    for(i = 1; i != arr.length - 1; ++i){
        if(derv2nd[i] > threshold && derv1st[i - 1] > 0 && derv1st[i + 1] < 0){
            ret.push(i);
        }
    }
    return ret;
}
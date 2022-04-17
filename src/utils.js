const timeoutSync = ms => new Promise(resolve => setTimeout(resolve, ms));

const ser2csv = obj => {
    let ret = Object.keys(obj).join(',');
    const vals = Object.values(obj);
    const length = Math.max(...vals.map(e => e.length));
    for(let i = 0; i != length; ++i){
        ret += '\n';
        ret += vals.map(e => e[i] || "").join(',');
    }
    return ret;
};

const dlText = (text, filename, type = "text/plain") => {
    const blob = new Blob([text], {type: type});
    const elem = document.createElement('a');
    elem.href = URL.createObjectURL(blob, { oneTimeOnly: true });
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
};

function stdDev(array){
    const n = array.length
    const mean = array.reduce((a, b) => a + b) / n
    return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
}

const hist = document.getElementById("history");
const pushHistory = (msg, className) => {
    const line = document.createElement('li');
    line.className = className;
    line.textContent = msg;
    hist.appendChild(line);
    return line;
};

const pushMessage = className => {
    let i = 0;
    return (msg, cnt) => {
        const line = pushHistory(msg, className);
        const count = document.createElement('span');
        count.className = "console-cnt";
        count.textContent = `${cnt}B/${i += cnt}B`;
        line.appendChild(count);
    }
};

/****** Graph ******/
const data = {
    //labels: Array(870-350).fill().map((_, i)=> i + 350),
    labels: Array(3500).fill().map((_, i)=> i),
    datasets: [{
      backgroundColor: '#0099ff',
      borderColor: '#0099ff',
      data: []
    }]
};

const config = {
    type: 'line',
    data: data,

    options: {
        maintainAspectRatio: false,

        elements: {
            line: {
                borderWidth: 2.1
            },

            point: {
                radius: 0.9
            }
        },

        plugins: {
            legend: {
                display: false,
            }
        },
        
        scales: {
            x: {
                type: 'linear',
                //min: 350,
                //max: 870,
                
                ticks: {
                    stepSize: 50
                }
            },

            y: {
                min: 0
            }
        }
        
    }
};

const graph = new Chart(
    document.getElementById('graph'),
    config
);

/****** Analyzer ******/
const spectro = new Spectrograph();
let serConsole = null;
const scom = new SerialCom();

const sendText = async msg => {
    const encoder = new TextEncoder();
    try{
        await scom.write(encoder.encode(msg));
    }catch(error){
        pushHistory(error.message, "console-err");
    }
    serConsole?.echo(msg);
}

const exposure = document.getElementById("exposure");
exposure.onchange = async e => {
    if(scom.inited() && scom.opend()){
        await sendText(`@c00${exposure.value}#@`);
    }
};

spectro.acquire = () => sendText("@c0080#@");

spectro.fetch = async () => {
    let length = 0;
    let frame = [];
    while(true){
        try{
            const { value, done } = await scom.read();
            frame.push(...value);
            const len = value.length;
            length += len;
            if(value[len - 1] == 0x4b && value[len - 2] == 0x4f){
                if(length >= 7302){
                    const ret = Array(7296);
                    let j = 0;
                    for(let i = length - 7302 + 4; i < length - 2; i += 2){
                        ret[j++] = (frame[i] << 8) + frame[i + 1];
                    }
                    return ret;
                }
                frame = [];
                length = 0;
            }
        }catch(error){
            pushHistory(error.message, "console-err");
        }
    }
};

spectro.transform = arr => arr//.slice(100, 1520);

const asMode = document.getElementById("as-single");
const asStartBtn = document.getElementById("as-start");
const asStart = async e => {
    const timeout = 3000; // ms
    try{
        await scom.init({ baudRate: 256000 });
        scom.onDisconnect = e => pushHistory("The device has been lost.", "console-err");
        await exposure.onchange();
        if(asMode.checked){
            graph.data.datasets[0].data = await spectro.single(timeout);
            graph.update();
        }else{
            asStartBtn.onclick = asPause;
            asStartBtn.textContent = "❚❚";
            await spectro.continuous(timeout, arr => {
                graph.data.datasets[0].data = arr;
                graph.update();
            });
        }
    }catch(error){
        pushHistory(error.message, "console-err");
        asStartBtn.onclick = asStart;
        asStartBtn.textContent = "▶";
    }
};

const asPause = () => {
    spectro.pause();
    asStartBtn.onclick = asStart;
    asStartBtn.textContent = "▶";
};

asStartBtn.onclick = asStart;

document.getElementById("as-stop").onclick = async e => {
    try{
        spectro.pause();
        await scom.close();
    }catch(error){
        pushHistory(error.message, "console-err");
    }
};

/****** Console ******/
const rxRep = document.getElementById("rxRep");
rxRep.onchange = e => {
    if(serConsole)serConsole.rxEncoding = parseInt(rxRep.value);
}

const txRep = document.getElementById("txRep");
txRep.onchange = e => {
    if(serConsole)serConsole.txEncoding = parseInt(txRep.value);
}

const csStartBtn = document.getElementById("cs-start");
const csStart = async e => {
    if(!serConsole){
        try{    
            await scom.init({ baudRate: 256000 });
        }catch(error){
            pushHistory(error.message, "console-err");
        }
        serConsole = new SerialConsole(scom.tee());
        scom.onDisconnect = e => {
            pushHistory("The device has been lost.", "console-err");
            serConsole = null;
        };

        serConsole.logRecv = pushMessage("console-recv");
        serConsole.logSend = pushMessage("console-send");
        serConsole.logError = msg => pushHistory(msg, "console-err");

        serConsole.shiftHist = () => hist.removeChild(hist.children[0]);
    }

    rxRep.onchange();
    txRep.onchange();

    csStartBtn.textContent = "❚❚";
    csStartBtn.onclick = csPause;
    try{    
        await serConsole.start();
    }catch(error){
        if(error.message == "The device has been lost."){
            serConsole = null;
        }
        pushHistory(error.message, "console-err");
        csStartBtn.onclick = csStart;
        csStartBtn.textContent = "▶";
    }
};

const csPause = () => {
    serConsole.pause();
    csStartBtn.onclick = csStart;
    csStartBtn.textContent = "▶";
};

csStartBtn.onclick = csStart;

document.getElementById("cs-stop").onclick = async e => {
    try{
        serConsole.pause();
        await serConsole.stop();
    }catch(error){
        pushHistory(error.message, "console-err");
    }
};

const cmd = document.getElementById("cmd");

document.getElementById("input").onsubmit = e => {
    e.preventDefault();
    serConsole?.send(cmd.value);
    cmd.value = "";
};

// Navigating history
cmd.onkeyup= e => {
    if(e.keyCode == 38){
        // up key released
        cmd.value = serConsole?.move(1);
    }else if(e.keyCode == 40){
        // down key released
        cmd.value = serConsole?.move(-1);
    }
};


const hist = document.getElementById("history");
const pushHistory = (msg, className) => {
    const line = document.createElement('li');
    line.className = className;
    line.textContent = msg;
    hist.appendChild(line);
};

/****** Analyzer ******/
const scom = new SerialCom();

const asStartBtn = document.getElementById("as-start");
asStartBtn.onclick = async e => {
    scom.init({ baudRate: 256000 });
};


/****** Console ******/

let serConsole = null;

const csStartBtn = document.getElementById("cs-start");
csStartBtn.onclick = async e => {
    if(!serConsole){
        await scom.init({ baudRate: 256000 });
        serConsole = new SerialConsole(scom.tee());

        serConsole.logRecv = msg => pushHistory(msg, "console-recv");
        serConsole.logSend = msg => pushHistory(msg, "console-send");
        serConsole.logError = msg => pushHistory(msg, "console-err");
    }

    serConsole.rxEncoding = 16;
    await serConsole.start();
};

document.getElementById("rxRep").onchange = e => {
    if(serConsole)serConsole.rxEncoding = parseInt(e.target.value);
}

document.getElementById("txRep").onchange = e => {
    if(serConsole)serConsole.txEncoding = parseInt(e.target.value);
}

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

/****** Graph ******/
const data = {
    //labels: Array(870-350).map((_, i)=> i + 350),
    labels: Array(870-350).fill().map((_, i)=> i + 350),
    datasets: [{
      backgroundColor: '#0099ff',
      borderColor: '#0099ff',
      //data: Array(870-350).fill(10),
      data: Array(870-350).fill().map((_, i)=> i + 350)
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
                min: 350,
                max: 870,
                
                ticks: {
                    stepSize: 20
                }
            }
        }
        
    }
};

const graph = new Chart(
    document.getElementById('graph'),
    config
);

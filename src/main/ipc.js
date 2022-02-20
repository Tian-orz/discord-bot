const { ipcMain } = require("electron");
const fs = require('fs');
const { fork } = require('child_process');
const getChatRecord = require('./getChatRecord')
const path = require("path");
const isDev = process.env.NODE_ENV !== 'production';
ipcMain.on("button:control", async (event, action, data) => {
    console.log(action)
    try {
        switch (action) {
            case 'loadTxt':
                loadTxtFn(event,data)
                break;
            case 'getChatRecord':
                getChatRecordFn(event,data)
                break;
            case 'startChat':
                startChatFn(event,data)
                break;
            case 'stopChat':
                stopChatFn(event,data)
                break;
            case 'loadDialogueTxt':
                loadTxtFn(event,data)
                break;
            case 'startDialogue':
                startDialogueFn(event,data)
                break;
            case 'stopDialogue':
                stopDialogueFn(event,data)
                break;
            case 'loadAccountIdTxt':
                loadTxtFn(event,data)
                break;
            case 'loadKeywordTxt':
                loadTxtFn(event,data)
                break;
            case 'startMonitor':
                startMonitorFn(event,data)
                break;
            case 'stopMonitor':
                stopMonitorFn(event,data)
                break;
            default:
                break;
        }
    } catch (error) {
    //   logger.error(error);
    }
});
const getChatRecordFn = async (event, data) => {
    getChatRecord(data).then(res => {
        event.sender.send("getChatRecord",{
            code: 0,
            data: res
        })
    }).catch(e => {
        event.sender.send("getChatRecord",{
            code: -1,
            data: e.message
        })
    })
}
const loadTxtFn = (event, path) => {
    fs.readFile(path, (err,data) => {
        if(err){
            event.returnValue = {
                code: -1,
                data: err
            }
            return
        }
        data = data.toString().split('\n')
        data.forEach((v,i) => {
            data[i] = v.replace('\r','')
        })
        event.returnValue = {
            code: 0,
            data: data
        }
    })
}

const startChatFn = (event, data) => {
    try {
        const scriptPath = isDev ? path.join(__dirname, 'chat.js') : path.join(process.resourcesPath, 'app.asar.unpacked/download/chat.js');
        const chatChild = fork(scriptPath)
        global.chatChild = chatChild
        chatChild.on('message', function(m) {
            // 收到子进程发来的消息
            if(m.action === 'stopChat'){
                event.sender.send("stopChat",{
                    code: 0,
                    data: null
                })
            }
        });
        //发送消息到子进程
        chatChild.send(data);
    } catch (error) {
        global.mainWindow.webContents.send("logger:log", error);
    }
}

const stopChatFn = () => {
    global.chatChild&&global.chatChild.kill();
}

const startDialogueFn = (event, data) => {
    const scriptPath = isDev ? path.join(__dirname, 'dialogue.js') : path.join(process.resourcesPath, 'app.asar.unpacked/download/dialogue.js');
    const gialogueChild = fork(scriptPath)
    global.gialogueChild = gialogueChild
    gialogueChild.on('message', function(m) {
        // 收到子进程发来的消息
        if(m.action === 'stopDialogue'){
            event.sender.send("stopDialogue",{
                code: 0,
                data: null
            })
        }
    });
    //发送消息到子进程
    gialogueChild.send(data);
}

const stopDialogueFn = (event, data) => {
    global.gialogueChild&&global.gialogueChild.kill();
}

const startMonitorFn = (event, data) => {
    const scriptPath = isDev ? path.join(__dirname, 'monitor.js') : path.join(process.resourcesPath, 'app.asar.unpacked/download/monitor.js');
    const monitorChild = fork(scriptPath)
    global.monitorChild = monitorChild
    monitorChild.on('message', function(m) {
        // 收到子进程发来的消息
        if(m.action === 'stopChat'){
            event.sender.send("stopChat",{
                code: 0,
                data: null
            })
            stopChatFn()
        }else if(m.action === 'stopDialogue'){
            event.sender.send("stopDialogue",{
                code: 0,
                data: null
            })
            stopDialogueFn()
        }
    });
    //发送消息到子进程
    monitorChild.send(data);
}

const stopMonitorFn = (event, data) => {
    global.monitorChild&&global.monitorChild.kill();
}
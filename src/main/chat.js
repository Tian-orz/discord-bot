const axios = require("axios");

let proxyHost = ''
let proxyPort = ''
let channelId = ''
let authorization = ''
let counter = 0 // 计数器

/**
 * 开聊
 */
const chat_star = (content) => {

    let header = {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
    }
    let msg = {
        "content": content,
        "nonce": `94158662701${Math.ceil(Math.random()*1000)}213056`,
        "tts": false
    }
    console.log(msg)
    axios({
        method: 'POST',
        url: `https://discord.com/api/v9/channels/${channelId}/messages`,
        headers: header,
        proxy: (proxyHost && proxyPort)?{
            host: proxyHost,
            port: proxyPort
        }: null,
        data: msg
    }).then(res => {
        let data = res.data
        console.log(`[${data.author.username}]发送成功: ${data.content}`)
        counter++
    })
}


const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};


const main = async (data) =>{
    authorization = data.authorization
    proxyHost = data.proxyHost
    proxyPort = data.proxyPort
    channelId = data.channelId
    timeInterval = data.timeInterval
    txtList = data.txtList
    model = data.model
    if(data.model === 'xh'){
        while (true) {
            for(let i=0;i<txtList.length;i++){
                chat_star(txtList[i])
                await sleep(timeInterval*1000)
            }
        }
    }else{
        while (true) {
            for(let i=0;i<txtList.length;i++){
                chat_star(txtList[i])
                await sleep(timeInterval*1000)
                if(counter === Number(data.chatNum)){
                    console.log('水群任务结束')
                    process.send({
                        action: 'stopChat'
                    });
                    process.exit()
                }
            }
        }
    }
}
process.on('message', function(m) {
    console.log('子进程收到了消息:', m);
    main(m)
});
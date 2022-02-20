const fs = require('fs');
const axios = require("axios");

let proxyHost = ''
let proxyPort = ''
let channelId = ''
let authorization = ''
let counter = 0 // 计数器

/**
 * 开聊
 */
const chat_star = () => {
    let header = {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
    }
    let msg = {
        "content": text_list[counter],
        "nonce": `94158662701${Math.ceil(Math.random()*1000)}213056`,
        "tts": false
    }
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


const chat = async (data) =>{
    authorization = data.authorization
        proxyHost = data.proxyHost
        proxyPort = data.proxyPort
        channelId = data.channelId
        timeInterval = data.timeInterval
        txtList = data.txtList
        model = data.model
        if(data.model === 'xh'){
            while (true) {
                for(let i=0;i++;i<txtList.length){
                    chat_star(txtList[i])
                    await sleep(timeInterval*1000)
                }
            }
        }else{
            while (true) {
                for(let i=0;i++;i<txtList.length){
                    chat_star(txtList[i])
                    await sleep(timeInterval*1000)
                    if(counter === data.chatNum){
                        process.exit() 
                        // tingzhi
                    }
                }
            }
        }
    
}
module.exports = chat
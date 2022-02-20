const axios = require("axios");

let proxyHost = '' // 代理ip
let proxyPort = '' // 代理端口号
let guild_id = '' // 群id
let channel_id = '' // 频道id
let account1 = '' // 账号1的authorization
let account2 = '' // 账号2的authorization
let message_id = '' // 回复的消息id
let timeInterval = '' // 聊天间隔 单位:秒
let responseAt = 0 // 1 开启对话@ 0关闭对话@ 0.1-0.9 概率@
let counter = 0 // 计数器
let text_list = []

/**
 * 开聊
 */
const chat_star = () => {
    // 用计数器判断当前使用账号1还是账号2发送消息
    let authorization = counter % 2 === 0 ? account1 : account2
    
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
    if(isResponeAt() && !!message_id){
        msg.message_reference = {
            channel_id: channel_id,
            guild_id: guild_id,
            message_id: message_id
        }
    }
    axios({
        method: 'POST',
        url: `https://discord.com/api/v9/channels/${channel_id}/messages`,
        headers: header,
        proxy: (proxyHost && proxyPort)?{
            host: proxyHost,
            port: proxyPort
        }: null,
        data: msg
    }).then(res => {
        let data = res.data
        message_id = data.id
        console.log(`[${data.author.username}]发送成功: ${data.content}`)
        counter++
    })
}

/**
 * 是否为回复消息
 */
const isResponeAt = () => {
    if(responseAt === 1){
        return true
    }else if(responseAt === 0){
        return false
    }else{
        return Math.round(Math.random()*10) < responseAt*10
    }
}

const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

const main = async (data) =>{
    account1 = data.authorization1
    account2 = data.authorization2
    proxyHost = data.proxyHost
    proxyPort = data.proxyPort
    guild_id = data.guildId
    channel_id = data.channelId
    timeInterval = data.timeInterval
    text_list = data.txtList
    model = data.model
    responseAt = data.responseAt
    if(data.model === 'xh'){
        while (true) {
            chat_star()
            await sleep(timeInterval*1000)
            if(counter === text_list.length){
                counter = 0
            }
        }
    }else{
        while (true) {
            chat_star()
            await sleep(timeInterval*1000)
            if(counter === Number(data.chatNum)){
                console.log('互聊任务结束')
                process.send({
                    action: 'stopDialogue'
                });
                process.exit() 
            }
        }
    }
}

process.on('message', function(m) {
    console.log('子进程收到了消息:', m);
    main(m)
});
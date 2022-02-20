const axios = require("axios");
require('dotenv').config()

const proxyHost = process.env.PROXY_HOST // 代理ip
const proxyPort = process.env.PROXY_PORT // 代理端口号
const authorization = process.env.ACCOUNT1 // 自己账号的authorization
const account_id = '' // 自己账号的id
const channel_id = '' // 监听的频道id

// 监听的用户的id
const mods = [
    '9336253567898xxxx'
]
// 关键词
const keywords = [
    '停止说话','禁止发言','123木头人'
]

let monitortTime = new Date().getTime()
const monitor = () => {
    let header = {
        "Authorization": authorization,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
    }
    axios({
        method: 'GET',
        url: `https://discord.com/api/v9/channels/${channel_id}/messages?limit=50`,
        headers: header,
        proxy: (proxyHost && proxyPort)?{
            host: proxyHost,
            port: proxyPort
        }: null,
    }).then(res => {
        messageParse(res.data)
        monitortTime = new Date().getTime()
    }).catch(e => {
        console.log(e.message)
    })
}

/**
 * 判断消息是否含关键字
 */
const isIncludeKeywords = (message) => {
    let flag = false
    keywords.forEach(keyword => {
        if(message.includes(keyword)){// 含关键字的消息
            flag = true
        }
    })
    return flag
}

// 消息信息解析
const messageParse = (data) => {
    // 优先级 @全员 > @自己 > mod发言+含关键字 > 含关键字 > mod发言
    data.forEach(item => {
        if(new Date(item.timestamp).getTime() < monitortTime){// 时间筛选,避免重新识别老消息
            return
        }
        if(item.mention_everyone){// @全体成员的消息
            console.log(`监听到一条@全员的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
        }else if(item.content.includes(account_id)){// @自己的消息
            console.log(`监听到一条@你的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
        }else if(mods.includes(item.author.id) && isIncludeKeywords(item.content)){// mod发言+含关键字
            console.log(`监听到一条mod发言+含关键字的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
        }else if(isIncludeKeywords(item.content)){
            console.log(`监听到含关键字的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
        }else if(mods.includes(item.author.id)){
            console.log(`监听到一条mod发言的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
        }
    })

}


setInterval(function () {// 监听器,每60s执行一次
    monitor()
},10*1000);
const axios = require("axios");
const sound = require("sound-play");
const path = require("path");
const MP3 = path.join(__dirname, "./static/14893.mp3");

let proxyHost = '' // 代理ip
let proxyPort = '' // 代理端口号
let authorization = '' // 账号1的authorization
let account_id = ''
let channel_id = ''
let mods = [] // 管理员用户的id
let keywords = [] // 关键词
let items = [] // 监听项
let operate = [] // 监听后操作

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
        console.log(new Date(item.timestamp).getTime(), monitortTime)
        console.log(mods.includes(item.author.id), isIncludeKeywords(item.content), items.includes('监听人发言+含关键字'))
        if(item.mention_everyone && items.includes('@全员')){// @全体成员的消息
            console.log(`监听到一条@全员的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
            respondOperate()
        }else if(item.content.includes(account_id) && items.includes('@自己')){// @自己的消息
            console.log(`监听到一条@你的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
            respondOperate()
        }else if(mods.includes(item.author.id) && isIncludeKeywords(item.content) && items.includes('监听人发言+含关键字')){// mod发言+含关键字
            console.log(`监听到一条mod发言+含关键字的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
            respondOperate()
        }else if(isIncludeKeywords(item.content) && items.includes('含关键字')){
            console.log(`监听到含关键字的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
            respondOperate()
        }else if(mods.includes(item.author.id) && items.includes('监听人发言')){
            console.log(`监听到一条mod发言的消息:`)
            console.log('-------------------')
            console.log(`消息: ${item.content}`)
            console.log('-------------------')
            // 执行你自己的应对策略
            respondOperate()
        }
    })

}

const respondOperate = () => {
    if(operate.includes('停止单聊')){
        process.send({
            action: 'stopChat'
        });
    }
    if(operate.includes('停止互聊')){
        process.send({
            action: 'stopDialogue'
        });
    }
    if(operate.includes('提示音报警')){
        sound.play(MP3, 1);
    }
}
// setInterval(function () {// 监听器,每60s执行一次
//     monitor()
// },60*1000);

const main = async (data) =>{
    authorization = data.authorization
    account_id = data.accountId
    proxyHost = data.proxyHost
    proxyPort = data.proxyPort
    channel_id = data.channelId
    mods = data.accountIdTxtList
    keywords = data.keywordTxtList
    items = data.items
    operate = data.operate
    setInterval(function () {// 监听器,每60s执行一次
        monitor()
    },10*1000);
}
process.on('message', function(m) {
    console.log('子进程收到了消息:', m);
    main(m)
    //向父进程发送消息
    // process.send({ foo: 'bar' });
});
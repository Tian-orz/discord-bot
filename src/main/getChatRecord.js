const axios = require("axios");
const fs = require('fs');

let authorization = ''
let proxyHost = '' // 代理ip
let proxyPort = '' // 代理端口号

/**
 * 爬取指定频道聊天记录（爬取话术）
 * @param {*} channel_id 频道id
 * @param {*} amount 抓取数量（50的倍数）
 */
 const getChatRecord = async (channel_id,amount=50,) => {
    return new Promise(async (resolve, reject) => {
        let recordList = []
        let beforeId = ''
        const getChatRecordLimit = () => {
            let beforeQuery = beforeId?`before=${beforeId}&`:''
            let header = {
                "Authorization": authorization,
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
            }
            axios({
                method: 'GET',
                url: `https://discord.com/api/v9/channels/${channel_id}/messages?${beforeQuery}limit=50`,
                headers: header,
                proxy: {
                    host: proxyHost,
                    port: proxyPort
                },
            }).then(res => {
                let data = res.data
                data.forEach(v => {
                    recordList.push(v.content)
                })
                if(recordList.length<amount){
                    beforeId = data[data.length-1].id
                    getChatRecordLimit()
                }else{
                    let timestamp = new Date().getTime()
                    recordList.forEach((v,i) => {
                        if(i === recordList.length-1){
                            writeOutput(timestamp,`${v}`);
                        }else{
                            writeOutput(timestamp,`${v}\n`);
                        }
                    })
                    console.log(`话术抓取成功,话术-${timestamp}.txt`)
                    resolve(`话术-${timestamp}.txt`)
                }
            }).catch(e => {
                reject(e)
                console.log(e.message)
            })
        }
        getChatRecordLimit()
    })
}

function writeOutput(timestamp,data) {
    let txtPath = process.env.PORTABLE_EXECUTABLE_DIR ? process.env.PORTABLE_EXECUTABLE_DIR : process.cwd()
    fs.appendFile(`${txtPath}/话术-${timestamp}.txt`, data, function (err) {
        if (err) throw err;
    });
}

const main = (data) =>{
    return new Promise(async (resolve, reject) => {
        authorization = data.authorization
        proxyHost = data.proxyHost
        proxyPort = data.proxyPort
        let channelId = data.channelId
        let channelNum = data.channelNum
        getChatRecord(channelId,channelNum).then(res => {
            resolve(res)
        }).catch(e =>{
            reject(e)
        })
    })
    
}
module.exports = main
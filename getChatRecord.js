const axios = require("axios");
const fs = require('fs');
require('dotenv').config()

const authorization = process.env.ACCOUNT1

const proxyHost = process.env.PROXY_HOST // 代理ip
const proxyPort = process.env.PROXY_PORT // 代理端口号

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
                proxy: (proxyHost && proxyPort)?{
                    host: proxyHost,
                    port: proxyPort
                }: null,
            }).then(res => {
                let data = res.data
                data.forEach(v => {
                    recordList.push(v.content)
                })
                if(recordList.length<amount){
                    beforeId = data[data.length-1].id
                    getChatRecordLimit()
                }else{
                    recordList.forEach(v => {
                        writeOutput(`${v}\n`);
                    })
                    console.log('话术抓取成功')
                    resolve()
                }
            }).catch(e => {
                reject(e)
                console.log(e.message)
            })
        }
        getChatRecordLimit()
    })
}
getChatRecord('933731641858338826',50)


function writeOutput(data) {
    fs.appendFile('话术.txt', data, function (err) {
        if (err) throw err;
    });
}
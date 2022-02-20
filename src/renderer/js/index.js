const Store = require("electron-store");
const { ipcRenderer,shell } = require("electron");

const store = new Store();
new Vue({
  el: "#app",
  data: function () {
    return {
      tab: 1,
      visible: false,
      currentMenu: 1,
      radio: 3,
      chat: {// 单聊
        authorization: '',
        proxyHost: '',
        proxyPort: '',
        recordChannelId: '',
        recordNum: '',
        channelId: '',
        timeInterval: 0,
        txtPath: '',
        txtList: [],
        txtLoadState: false,
        model: '',
        chatNum: '',
        runState: false
      },
      dialogue: {
        authorization1: '',
        authorization2: '',
        proxyHost: '',
        proxyPort: '',
        guildId: '',
        channelId: '',
        timeInterval: 0,
        txtPath: '',
        txtList: [],
        txtLoadState: false,
        responseAt: 0,
        model: '',
        chatNum: '',
        runState: false
      },
      monitor: {
        authorization: '',
        accountId: '',
        proxyHost: '',
        proxyPort: '',
        channelId: '',
        accountIdTxtPath: '',
        accountIdTxtList: [],
        accountIdTxtLoadState: false,
        keywordTxtPath: '',
        keywordTxtList: [],
        keywordTxtLoadState: false,
        items: [],
        operate: [],
        runState: false
      }
    };
  },
  created() {
    if(store.has('chat')){
      let chat = store.get('chat')
      this.chat = Object.assign(chat, {
        txtList: [],
        txtLoadState: false,
        runState: false
      })
    }
    if(store.has('dialogue')){
      let dialogue = store.get('dialogue')
      this.dialogue = Object.assign(dialogue, {
        txtList: [],
        txtLoadState: false,
        runState: false
      })
    }
    if(store.has('monitor')){
      let monitor = store.get('monitor')
      this.monitor = Object.assign(monitor, {
        accountIdTxtList: [],
        accountIdTxtLoadState: false,
        keywordTxtList: [],
        keywordTxtLoadState: false,
        runState: false
      })
    }
    ipcRenderer.on("logger:log", (event, data) => {
      console.log(data);
  });
  },
  methods: {
    changeMenu(index) {
      console.log('11')
      this.currentMenu = index;
    },
    getChatRecord() {
      store.set('chat', this.chat);
      let that = this
      if(!that.chat.authorization){
        that.$message.warning('请输入token')
        return
      }
      if(!that.chat.recordChannelId){
        that.$message.warning('请输入频道id')
        return
      }
      if(!that.chat.recordNum){
        that.$message.warning('请输入抓取数量')
        return
      }
      const loading = that.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      let data = {
        authorization:that.chat.authorization,
        proxyHost:that.chat.proxyHost,
        proxyPort:that.chat.proxyPort,
        channelId:that.chat.recordChannelId,
        channelNum:that.chat.recordNum
      }
      ipcRenderer.send("button:control", "getChatRecord", data);
      ipcRenderer.once("getChatRecord", (event, res) => {
        loading.close()
        if(res.code === 0){
          that.$message.success(`抓取成功,文件保存为${res.data}`)
        }else{
          that.$message.warning(`抓取失败: ${res.data}`)
        }
      });
    },
    loadTxt() {
      store.set('chat', this.chat);
      let res = ipcRenderer.sendSync("button:control", "loadTxt", this.chat.txtPath)
      if(res.code === 0){
        this.chat.txtLoadState = true
        this.chat.txtList = res.data
        this.$message.success(`文本读取成功,共读取${res.data.length}条`)
      }else{
        this.$message.error(res.data)
      }
    },
    startChat() {
      store.set('chat', this.chat);
      let chat = this.chat
      if(!chat.authorization){
        this.$message.warning('请输入用户Auth')
        return
      }
      if(!chat.channelId){
        this.$message.warning('请输入频道id')
        return
      }
      if(!chat.timeInterval){
        this.$message.warning('请输入发言间隔')
        return
      }
      if(!chat.txtList.length){
        this.$message.warning('请先读取话术文本')
        return
      }
      if(chat.model === 'zd' && !chat.chatNum){
        this.$message.warning('请输入指定数量')
        return
      }
      this.chat.runState = true
      let data = {
        authorization: chat.authorization,
        proxyHost: chat.proxyHost,
        proxyPort: chat.proxyPort,
        channelId: chat.channelId,
        timeInterval: chat.timeInterval,
        txtList: chat.txtList,
        model: chat.model,
        chatNum: chat.chatNum
      }
      ipcRenderer.send("button:control", "startChat", data);
      ipcRenderer.once("stopChat", (event, res) => {
        this.chat.runState = false
      });
    },
    stopChat() {
      ipcRenderer.send("button:control", "stopChat");
      this.chat.runState = false
    },
    loadDialogueTxt() {
      store.set('dialogue', this.dialogue);
      let res = ipcRenderer.sendSync("button:control", "loadTxt", this.dialogue.txtPath)
      if(res.code === 0){
        this.dialogue.txtLoadState = true
        this.dialogue.txtList = res.data
        this.$message.success(`文本读取成功,共读取${res.data.length}条`)
      }else{
        this.$message.error(res.data)
      }
    },
    startDialogue() {
      store.set('dialogue', this.dialogue);
      let dialogue = this.dialogue
      if(!dialogue.authorization1){
        this.$message.warning('请输入用户1Auth')
        return
      }
      if(!dialogue.authorization2){
        this.$message.warning('请输入用户2Auth')
        return
      }
      if(!dialogue.guildId){
        this.$message.warning('请输入服务器id')
        return
      }
      if(!dialogue.channelId){
        this.$message.warning('请输入频道id')
        return
      }
      if(!dialogue.timeInterval){
        this.$message.warning('请输入发言间隔')
        return
      }
      if(dialogue.responseAt === ''){
        this.$message.warning('请输入是否回复')
        return
      }
      if(!dialogue.txtList.length){
        this.$message.warning('请先读取话术文本')
        return
      }
      if(dialogue.model === 'zd' && !dialogue.chatNum){
        this.$message.warning('请输入指定数量')
        return
      }
      this.dialogue.runState = true
      ipcRenderer.send("button:control", "startDialogue", dialogue);
      ipcRenderer.once("stopDialogue", (event, res) => {
        this.dialogue.runState = false
      });
    },
    stopDialogue() {
      ipcRenderer.send("button:control", "stopDialogue");
      this.dialogue.runState = false
    },
    loadAccountIdTxt() {
      store.set('monitor', this.monitor);
      let res = ipcRenderer.sendSync("button:control", "loadTxt", this.monitor.accountIdTxtPath)
      if(res.code === 0){
        this.monitor.accountIdTxtLoadState = true
        this.monitor.accountIdTxtList = res.data
        this.$message.success(`文本读取成功,共读取${res.data.length}条`)
      }else{
        this.$message.error(res.data)
      }
    },
    loadKeywordTxt() {
      store.set('monitor', this.monitor);
      let res = ipcRenderer.sendSync("button:control", "loadTxt", this.monitor.keywordTxtPath)
      if(res.code === 0){
        this.monitor.keywordTxtLoadState = true
        this.monitor.keywordTxtList = res.data
        this.$message.success(`文本读取成功,共读取${res.data.length}条`)
      }else{
        this.$message.error(res.data)
      }
    },
    startMonitor() {
      store.set('monitor', this.monitor);
      let monitor = this.monitor
      if(!monitor.authorization){
        this.$message.warning('请输入用户Auth')
        return
      }
      if(!monitor.accountId){
        this.$message.warning('请输入用户id')
        return
      }
      if(!monitor.channelId){
        this.$message.warning('请输入频道id')
        return
      }
      if(!monitor.accountIdTxtList.length){
        this.$message.warning('请先读取监听用户id文本')
        return
      }
      if(!monitor.accountIdTxtList.length){
        this.$message.warning('请先读取关键词文本')
        return
      }
      if(!monitor.items.length){
        this.$message.warning('请选取监听项')
        return
      }
      if(!monitor.operate.length){
        this.$message.warning('请选取监听后操作')
        return
      }
      this.monitor.runState = true
      ipcRenderer.send("button:control", "startMonitor", monitor);
      ipcRenderer.once("stopMonitor", (event, res) => {
        this.monitor.runState = false
      });
    },
    stopMonitor() {
      ipcRenderer.send("button:control", "stopMonitor");
      this.monitor.runState = false
    },
    openUrl(url) {
      shell.openExternal(url);
    }
  },
});

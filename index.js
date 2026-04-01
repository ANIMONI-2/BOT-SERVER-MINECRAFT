const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const similarity = require('string-similarity')
const axios = require('axios')

let bot
let brain = []
let players = {}
let emotions = {}
let conversations = {}
let lastMessageTime = 0

// 📂 LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// 💾 SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// 🚫 FILTER (no commands)
function isRealPlayer(user, msg) {
  if (!user || user === bot.username) return false
  if (!msg) return false
  if (msg.startsWith('/')) return false // 🚫 block commands

  const blocked = ['joined','left','discord','lag']
  return !blocked.some(w => msg.toLowerCase().includes(w))
}

// 🧠 NORMALIZE
function normalize(text) {
  return text.toLowerCase().trim()
}

// 👤 PLAYER
function ensurePlayer(user) {
  if (!players[user]) {
    players[user] = { msgs: [], friend: null }
    emotions[user] = "normal"
    conversations[user] = []
  }
}

// 💬 CONTEXT MEMORY
function addToConversation(user, msg) {
  conversations[user].push(msg)
  if (conversations[user].length > 5) conversations[user].shift()
}

// 😈 EMOTIONS
function updateEmotion(user, msg) {
  if (msg.includes('merci')) emotions[user] = "happy"
  else if (msg.includes('zft')) emotions[user] = "angry"
  else if (msg.includes('hzint')) emotions[user] = "sad"
}

// 🤝 FRIEND
function setFriend(user, name) {
  players[user].friend = name
  saveAll()
}

// 🧠 LEARN
function learn(msg) {
  if (!brain.includes(msg)) {
    brain.push(msg)
    if (brain.length > 1000) brain.shift()
    saveAll()
  }
}

// 🌐 INTERNET
async function searchWiki(q) {
  try {
    const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`)
    return r.data.extract
  } catch { return null }
}

// 🤖 LONG HUMAN REPLY
function humanReply(text, user) {
  return `${text}

ana kanhder m3ak b7al chi wa7ed 7a9i9i 😎 w kan7اawl nfham context dyal lhdra dyalna، ila bghiti n3awnk f ay 7aja goli 👍`
}

// 😈 STYLE
function style(text, mood) {
  if (mood === "happy") return text + " 😂"
  if (mood === "angry") return "safi baraka mn hadchi 😡"
  if (mood === "sad") return text + " 😢"
  return text + " 😎"
}

// 🤖 AI CONTEXT
async function smartAI(user, msg) {

  let mood = emotions[user] || "normal"
  let context = conversations[user].join(' ')

  // 🤝 friend
  if (msg.startsWith('sahbi')) {
    let f = msg.split(' ')[1]
    if (f) {
      setFriend(user, f)
      return style(`safi ${f} wla sahbek daba`, mood)
    }
  }

  if (msg.includes('chkoun sahbi')) {
    let f = players[user].friend
    return f ? style(`sahbek هو ${f}`, mood) : style(`mazal ma3ndk sahb`, mood)
  }

  // 🌐 internet
  if (msg.startsWith('chno')) {
    const info = await searchWiki(msg.replace('chno',''))
    if (info) return style(humanReply(info.slice(0,150), user), mood)
  }

  // 🧠 CONTEXT فهم
  if (context.includes('kidayr') && msg.includes('labas')) {
    return style(humanReply("zwin! far7tini daba 😎", user), mood)
  }

  // 🧠 similarity
  if (brain.length > 10) {
    const res = similarity.findBestMatch(msg, brain)
    if (res.bestMatch.rating > 0.55) {
      return style(humanReply(res.bestMatch.target, user), mood)
    }
  }

  // 💬 base
  if (msg.includes('salam')) return style(humanReply(`salam ${user} kif dayr?`, user), mood)

  return style(humanReply(randomTalk(user), user), mood)
}

// 💬 RANDOM
function randomTalk(user) {
  const arr = [
    `kidayr ${user}?`,
    `wach kolchi mzyan؟`,
    `ana hna m3ak`,
    `kanfham chwiya chwiya 😂`
  ]
  return arr[Math.floor(Math.random()*arr.length)]
}

// 🚫 ANTI SPAM
function sendMessage(msg) {
  if (msg.startsWith('/')) return // 🚫 double protection

  const now = Date.now()
  if (now - lastMessageTime < 3500) return

  bot.chat(msg)
  lastMessageTime = now
}

// 📢 SYSTEM
function systems() {
  setInterval(() => {
    sendMessage("mar7ba bik f server ")
  }, 90000)
}

// 🤖 BOT
function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('🔥 BOT CONNECTED')
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))
    systems()
  })

  bot.on('chat', async (user, msg) => {
    if (!isRealPlayer(user, msg)) return

    ensurePlayer(user)

    msg = normalize(msg)

    addToConversation(user, msg) // 🧠 context

    updateEmotion(user, msg)
    learn(msg)

    const reply = await smartAI(user, msg)

    if (reply) sendMessage(reply)
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const similarity = require('string-similarity')
const axios = require('axios')

const OWNER = "ANIMONI"

let bot
let brain = []
let players = {}
let emotions = {} // 😈 لكل لاعب mood
let lastMessageTime = 0

// 📂 load
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// 💾 save
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
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

    updateEmotion(user, msg)

    rememberMessage(user, msg)
    learn(msg)

    const reply = await smartAI(user, msg)

    if (reply) sendMessage(reply)
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

// 🧠 normalize
function normalize(text) {
  return text.toLowerCase()
}

// 👤 player
function ensurePlayer(user) {
  if (!players[user]) {
    players[user] = { msgs: [], lastSeen: Date.now() }
    emotions[user] = "normal"
  }
}

// 😈 emotions system
function updateEmotion(user, msg) {
  if (msg.includes('3afak') || msg.includes('merci')) {
    emotions[user] = "happy"
  } else if (msg.includes('khayb') || msg.includes('zft')) {
    emotions[user] = "angry"
  } else if (msg.includes('hzint') || msg.includes('machi mzyan')) {
    emotions[user] = "sad"
  }
}

// 🧠 learn
function learn(msg) {
  if (!brain.includes(msg)) {
    brain.push(msg)
    if (brain.length > 1000) brain.shift()
    saveAll()
  }
}

// 🌐 internet
async function searchWiki(q) {
  try {
    const r = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(q)}`)
    return r.data.extract
  } catch { return null }
}

// 🤖 AI
async function smartAI(user, msg) {

  let mood = emotions[user] || "normal"

  // 👑 owner
  if (user === OWNER) return style(`ana dayman m3ak a malik 👑`, mood)

  // 🌐 internet
  if (msg.startsWith('chno')) {
    const info = await searchWiki(msg.replace('chno',''))
    if (info) return style(info.slice(0,120), mood)
  }

  // 🧠 similarity
  if (brain.length > 10) {
    const res = similarity.findBestMatch(msg, brain)
    if (res.bestMatch.rating > 0.55) {
      return style(res.bestMatch.target, mood)
    }
  }

  // 💬 base replies
  if (msg.includes('salam')) return style(`salam ${user} kif dayr?`, mood)
  if (msg.includes('labas')) return style(`labas 3lik l7amdolah`, mood)

  return style(randomTalk(user), mood)
}

// 😈 style حسب mood
function style(text, mood) {
  if (mood === "happy") return text + " 😂🔥"
  if (mood === "angry") return "safi baraka mn tkhbi9 😡"
  if (mood === "sad") return text + " 😢"
  return text + " 😎"
}

// 💬 fallback
function randomTalk(user) {
  const arr = [
    `kidayr ${user}?`,
    `wach kolchi mzyan؟`,
    `ana hna m3ak 😂`,
    `ila bghiti chi haja golha`
  ]
  return arr[Math.floor(Math.random()*arr.length)]
}

// 🚫 anti spam
function sendMessage(msg) {
  const now = Date.now()
  if (now - lastMessageTime < 3500) return
  bot.chat(msg)
  lastMessageTime = now
}

// 📢 system
function systems() {
  setInterval(() => {
    sendMessage("§6ANIMONI » mar7ba bik 🇲🇦")
  }, 90000)
}

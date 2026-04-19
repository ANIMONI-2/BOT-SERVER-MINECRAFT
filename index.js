process.removeAllListeners('warning')

const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const axios = require('axios')
const similarity = require('string-similarity')

let bot

let brain = []
let players = {}
let conversations = {}
let emotions = {}
let reputation = {}
let warnings = {}

let lastMessage = ""
let lastTime = 0

let reconnecting = false
let afkInterval = null

// LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// PLAYER INIT
function ensurePlayer(user) {
  if (!players[user]) players[user] = {}
  if (!conversations[user]) conversations[user] = []
  if (!emotions[user]) emotions[user] = "normal"
  if (!reputation[user]) reputation[user] = 0
  if (!warnings[user]) warnings[user] = 0
}

// MEMORY
function addMemory(user, msg) {
  conversations[user].push(msg)
  if (conversations[user].length > 40) conversations[user].shift()
}

// LEARN
function learn(msg) {
  if (!brain.includes(msg) && msg.length > 5) {
    brain.push(msg)
    if (brain.length > 3000) brain.shift()
    saveAll()
  }
}

// ANALYZE
function analyze(user, msg) {
  if (msg.includes('merci')) {
    emotions[user] = "happy"
    reputation[user] += 2
  } else if (msg.includes('hmar') || msg.includes('skot')) {
    emotions[user] = "angry"
    reputation[user] -= 4
    warnings[user]++
  } else {
    emotions[user] = "normal"
  }
}

// CLEAN
function cleanText(text = "") {
  return text
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    .replace(/[^\x00-\x7F]/g, '')
}

// STYLE
function style(text, user) {
  if (user === "ANIMONI") return "ANIMONI HOWA MALIK"

  if (warnings[user] >= 3) return "khlfti l9awanin"
  if (reputation[user] > 8) return "OK " + text
  if (reputation[user] < -6) return "sir b3d"

  if (emotions[user] === "happy") return text
  if (emotions[user] === "angry") return "ma3ajbni hadchi"

  return text
}

// AI
async function askAI(msg) {
  try {
    const res = await axios.get(
      `https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(msg)}`
    )
    return cleanText(res.data.message)
  } catch {
    return null
  }
}

// LOCAL AI
function localAI(msg) {
  if (brain.length > 100) {
    const res = similarity.findBestMatch(msg, brain)
    if (res.bestMatch.rating > 0.7) return res.bestMatch.target
  }
  return null
}

// GENERATE
async function generateReply(user, msg) {
  let ai = await askAI(msg)
  if (ai) return style(ai, user)

  let local = localAI(msg)
  if (local) return style(local, user)

  return null
}

// SEND
function send(msg) {
  if (!msg || msg === lastMessage) return
  if (msg.startsWith('/')) return

  msg = cleanText(msg)

  const now = Date.now()
  if (now - lastTime < 2500) return

  if (bot) bot.chat(msg)

  lastMessage = msg
  lastTime = now
}

// AUTH
function handleAuth() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => bot.chat('/login Animoni123'), 2000)
    } catch {}
  }, 3000)
}

// ANTI AFK FIX (NO STACKING)
function antiAFK() {
  if (afkInterval) clearInterval(afkInterval)

  afkInterval = setInterval(() => {
    if (!bot || !bot.entity) return

    try {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.5,
        true
      )
    } catch {}
  }, 5000)
}

// BOT CREATE
function createBot() {
  if (reconnecting) return
  reconnecting = true

  console.log("connecting...")

  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: false
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    handleAuth()
    antiAFK()

    reconnecting = false
  })

  bot.on('chat', async (user, msg) => {
    msg = msg.toLowerCase()

    ensurePlayer(user)
    addMemory(user, msg)
    analyze(user, msg)
    learn(msg)

    const reply = await generateReply(user, msg)
    if (reply) send(reply)
  })

  bot.on('end', () => {
    console.log("disconnected")
    setTimeout(() => {
      reconnecting = false
      createBot()
    }, 10000)
  })

  bot.on('error', () => {})
}

createBot()

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const similarity = require('string-similarity')
const axios = require('axios')

let bot
let brain = []
let players = {}
let conversations = {}
let emotions = {}
let reputation = {}

let lastMessage = ""
let lastTime = 0

// LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// FILTER
function isRealPlayer(user, msg) {
  if (!user || user === bot.username) return false
  if (!msg || msg.startsWith('/')) return false
  return true
}

// PLAYER INIT
function ensurePlayer(user) {
  if (!players[user]) {
    players[user] = { friend: null }
    conversations[user] = []
    emotions[user] = "normal"
    reputation[user] = 0
  }
}

// MEMORY
function addMemory(user, msg) {
  conversations[user].push(msg)
  if (conversations[user].length > 25) conversations[user].shift()
}

// EMOTION
function updateEmotion(user, msg) {
  if (msg.includes('merci') || msg.includes('chokran')) emotions[user] = "happy"
  else if (msg.includes('sir') || msg.includes('skot')) emotions[user] = "angry"
  else emotions[user] = "normal"
}

// REPUTATION
function updateReputation(user, msg) {
  if (msg.includes('merci') || msg.includes('3afak')) reputation[user] += 1
  if (msg.includes('hmar') || msg.includes('skot')) reputation[user] -= 2
}

// LEARN
function learn(msg) {
  if (!brain.includes(msg) && msg.length > 4) {
    brain.push(msg)
    if (brain.length > 3000) brain.shift()
    saveAll()
  }
}

// STYLE
function style(text, user) {
  let mood = emotions[user]

  if (user === "ANIMONI") text = "a OWNER 👑 " + text

  if (reputation[user] < -3) return "sir b3d mni 😡"
  if (mood === "happy") return text + " 😂"
  if (mood === "angry") return "sir b3d mni chwya 😡"
  return text + " 😎"
}

// 🤖 FREE AI
async function askAI(msg) {
  try {
    const res = await axios.get(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(msg)}&botname=Animoni&ownername=ANIMONI`)
    return res.data.message
  } catch {
    return null
  }
}

// 🧠 GENERATE
async function generateReply(user, msg) {

  // FRIEND SYSTEM
  if (msg.startsWith("sahbi")) {
    let f = msg.split(" ")[1]
    if (f) {
      players[user].friend = f
      saveAll()
      return style(`safi ${f} wla sahbek daba`, user)
    }
  }

  if (msg.includes("chkoun sahbi")) {
    return style(players[user].friend || "mazal ma3ndk sahb", user)
  }

  // ROLEPLAY
  let entity = bot.players[user]?.entity
  if (entity) {
    let dist = bot.entity.position.distanceTo(entity.position)
    if (dist < 3) return style(`kanchofk 9rib lya 😂`, user)
    if (dist < 10) return style(`rak 9rib chwya`, user)
  }

  // AI
  let ai = await askAI(msg)
  if (ai) return style(ai, user)

  // FALLBACK
  const replies = [
    "fhemtk walakin 3tini details ktar",
    "kan7awl nfhemk mzyan",
    "hada su2al mzyan bss7 khasso twdi7",
    "ana hna n3awnk 😈"
  ]

  return style(replies[Math.floor(Math.random()*replies.length)], user)
}

// SEND
function send(msg) {
  if (!msg || msg === lastMessage) return

  const now = Date.now()
  if (now - lastTime < 2500) return

  bot.chat(msg)
  lastMessage = msg
  lastTime = now
}

// FOLLOW
function follow() {
  setInterval(() => {
    let list = Object.values(bot.players).filter(p => p.entity)
    if (!list.length) return

    let target = list[Math.floor(Math.random()*list.length)]

    bot.lookAt(target.entity.position.offset(0,1.6,0))
    bot.pathfinder.setGoal(new goals.GoalFollow(target.entity, 2), true)
  }, 4000)
}

// RANDOM TALK
function randomTalk() {
  setInterval(() => {
    let msgs = [
      "wach kayn chi wa7d hna 😏",
      "had server zwiiin 🔥",
      "fin ghadin daba 😈",
      "li bgha sahbi ygoli sahbi 😂"
    ]
    send(msgs[Math.floor(Math.random()*msgs.length)])
  }, 30000)
}

// 🔐 AUTH (Register + Login)
function handleAuth() {
  setTimeout(() => {
    bot.chat('/register Animoni123 Animoni123')

    setTimeout(() => {
      bot.chat('/login Animoni123')
    }, 2000)

  }, 3000)
}

// 🔐 Detect AuthMe messages
function autoAuthDetect() {
  bot.on('messagestr', (msg) => {
    let m = msg.toLowerCase()

    if (m.includes('register')) {
      bot.chat('/register Animoni123 Animoni123')
    }

    if (m.includes('login')) {
      bot.chat('/login Animoni123')
    }
  })
}

// BOT
function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    handleAuth()
    autoAuthDetect()

    follow()
    randomTalk()
  })

  bot.on('chat', async (user, msg) => {
    if (!isRealPlayer(user, msg)) return

    ensurePlayer(user)

    msg = msg.toLowerCase()

    addMemory(user, msg)
    updateEmotion(user, msg)
    updateReputation(user, msg)
    learn(msg)

    let reply = await generateReply(user, msg)

    if (reply && reply !== msg) send(reply)
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

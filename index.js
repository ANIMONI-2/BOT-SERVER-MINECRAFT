const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
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

// LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// INIT
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
  if (conversations[user].length > 60) conversations[user].shift()
}

// LEARN
function learn(msg) {
  if (!brain.includes(msg) && msg.length > 5) {
    brain.push(msg)
    if (brain.length > 6000) brain.shift()
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

// STYLE 😈
function style(text, user) {
  if (user === "ANIMONI") return "👑 ANIMONI HOWA MALIK 😈🔥"

  if (warnings[user] >= 3) return "🚨 khlfti l9awanin… ghadi tmchi l7bs 😈"
  if (reputation[user] > 8) return "🤝 " + text
  if (reputation[user] < -6) return "😡 sir b3d"

  if (emotions[user] === "happy") return text + " 😂"
  if (emotions[user] === "angry") return "😡 ma3ajbni hadchi"

  return text + " 😎"
}

// AI
async function askAI(msg) {
  try {
    const res = await axios.get(`https://api.affiliateplus.xyz/api/chatbot?message=${encodeURIComponent(msg)}`)
    return res.data.message
  } catch {
    return null
  }
}

// LOCAL AI
function localAI(msg) {
  if (brain.length > 150) {
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

  if (msg.includes("tree")) {
    return style("t9dar thsr shajra kamla b drba bl axe 🌳", user)
  }

  if (msg.includes("iron")) {
    return style("Vein Mining  kaykhdem m3a ga3 ores (iron, coal, gold, diamond, emerald, redstone, lapis, copper, quartz…) ila hrsty wa7ed b lbikax ga3 li7dah kaythrsso⛏️", user)
  }

  return style("kanfakar 😈", user)
}

// SEND
function send(msg) {
  if (!msg || msg === lastMessage) return
  if (msg.startsWith('/')) return

  const now = Date.now()
  if (now - lastTime < 2000) return

  bot.chat(msg)
  lastMessage = msg
  lastTime = now
}

// 🚨 JAIL
function jailCheck(user) {
  if (warnings[user] >= 3) {
    send(`🚨 ${user} ghadi tmchi l7bs 😈`)
    warnings[user] = 0
    reputation[user] = -5
  }
}

// 📢 FEATURES (UPDATED)
const features = [
  "t9dar thsr shajra kamla b drba bl axe 🌳",
  "Vein Mining  kaykhdem m3a ga3 ores (iron, coal, gold, diamond, emerald, redstone, lapis, copper, quartz…) ila hrsty wa7ed b lbikax ga3 li7dah kaythrsso⛏️",
  "ila mati kayban sandou9 dyal items 💀",
  "night vision dyma 🌙",
  "server khdam 24/7 ⏰",
  "katban l2i7datiyate 📍",
  "teams kaynin 🤝",
  "one sleep 🌞",
  "Bash tmchi 3and chi l3ab: /tpa <smiyat l3ab>",
  "Bash tdir chi l3ab yji 3andk: /tpahere <smiyat l3ab>",
  "Bash t9bl tpa li tssiftat lik: /tpaccept",
  "Bash trfd tpa li tssiftat lik: /tpdeny",
  "Bash trj3 l spawn: /spawn",
  "Bash trj3 l lobby: /lobby"
]

// 📜 RULES
const rules = [
  "mamnou3 hacks 🚫",
  "mamnou3 l’itiham b batil 🚫",
  "mamnou3 spam 🚫",
  "respect players 🛡️",
  "ila khelfti chi 9anon ghadi tmchi l7bs 😈"
]

// SMART ANNOUNCE
function smartTalk() {
  let i = 0
  let j = 0

  setInterval(() => {
    if (Math.random() < 0.6) {
      send("📢 " + features[i])
      i = (i + 1) % features.length
    } else {
      send("📜 " + rules[j])
      j = (j + 1) % rules.length
    }
  }, 20000)
}

// 🧠 SELF THINKING
function selfThinking() {
  setInterval(() => {
    let thoughts = [
      "had server fih features 9wiya bzaf 😈",
      "tree capitator + vein miner 🔥",
      "ANIMONI howa malik 👑",
      "ila chi wa7ed ghesh ghadi n3a9bo 🚨"
    ]
    send("🧠 " + thoughts[Math.floor(Math.random()*thoughts.length)])
  }, 40000)
}

// FOLLOW
function follow() {
  setInterval(() => {
    let list = Object.values(bot.players).filter(p => p.entity)
    if (!list.length) return

    let target = list[Math.floor(Math.random()*list.length)]
    bot.lookAt(target.entity.position.offset(0,1.6,0))
    bot.pathfinder.setGoal(new goals.GoalFollow(target.entity, 2), true)
  }, 5000)
}

// AUTH
function handleAuth() {
  setTimeout(() => {
    bot.chat('/register Animoni123 Animoni123')
    setTimeout(() => bot.chat('/login Animoni123'), 2000)
  }, 3000)
}

// FILTER
function isRealPlayer(user, msg) {
  if (!user || user === bot.username) return false
  if (!msg || msg.startsWith('/')) return false
  return true
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
    smartTalk()
    selfThinking()
    follow()
  })

  bot.on('chat', async (user, msg) => {
    if (!isRealPlayer(user, msg)) return

    msg = msg.toLowerCase()

    ensurePlayer(user)
    addMemory(user, msg)
    analyze(user, msg)
    learn(msg)

    jailCheck(user)

    let reply = await generateReply(user, msg)
    if (reply && reply !== msg) send(reply)
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

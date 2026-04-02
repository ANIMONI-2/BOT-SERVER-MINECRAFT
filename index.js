const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const fs = require('fs-extra')
const similarity = require('string-similarity')

let bot
let brain = []
let players = {}
let conversations = {}
let emotions = {}
let lastMessage = ""
let lastTime = 0

// 📂 LOAD
if (fs.existsSync('brain.json')) brain = fs.readJsonSync('brain.json')
if (fs.existsSync('players.json')) players = fs.readJsonSync('players.json')

// 💾 SAVE
function saveAll() {
  fs.writeJsonSync('brain.json', brain)
  fs.writeJsonSync('players.json', players)
}

// 🚫 FILTER
function isRealPlayer(user, msg) {
  if (!user || user === bot.username) return false
  if (!msg) return false
  if (msg.startsWith('/')) return false
  return true
}

// 👤 PLAYER
function ensurePlayer(user) {
  if (!players[user]) {
    players[user] = { friend: null, name: user, registered: false }
    conversations[user] = []
    emotions[user] = "normal"
  }
}

// 🧠 MEMORY
function addMemory(user, msg) {
  ensurePlayer(user)
  conversations[user].push(msg)
  if (conversations[user].length > 12) conversations[user].shift()
}

// 😈 EMOTION
function updateEmotion(user, msg) {
  if (msg.includes('merci') || msg.includes('chokran')) emotions[user] = "happy"
  else if (msg.includes('z3f') || msg.includes('skot')) emotions[user] = "angry"
  else if (msg.includes('hzint')) emotions[user] = "sad"
}

// 🧠 LEARN
function learn(msg) {
  if (!brain.includes(msg)) {
    brain.push(msg)
    if (brain.length > 2000) brain.shift()
    saveAll()
  }
}

// 🎭 PERSONALITY
function personality(user) {
  if (user === "ANIMONI") return "owner"
  return "normal"
}

// 😈 STYLE
function style(text, mood, user) {
  let base = text
  if (personality(user) === "owner") {
    base = "a khoya l OWNER 👑 " + text
  }
  if (mood === "happy") return base + " 😂"
  if (mood === "angry") return "sir b3d mni daba 😡"
  if (mood === "sad") return base + " 😢"
  return base + " 😎"
}

// 🤖 AI CORE
function smartReply(user, msg) {
  let mood = emotions[user] || "normal"
  let context = conversations[user].join(" ")

  // 🤝 friend system
  if (msg.startsWith("sahbi")) {
    let f = msg.split(" ")[1]
    if (f) {
      players[user].friend = f
      saveAll()
      return style(`safi ${f} wla sahbek daba`, mood, user)
    }
  }

  if (msg.includes("chkoun sahbi")) {
    let f = players[user].friend
    return f ? `sahbek howa ${f}` : `mazal ma3ndk sahb`
  }

  // 🧠 context real
  if (msg.includes("kidayr")) {
    return style(`labas 3lik nta ${user}? ana mzyan daba`, mood, user)
  }

  if (msg.includes("chno ndir")) {
    return style(`chouf 7awl t9oliya chno wa9e3 m3ak w ana n3tik solution mzyan`, mood, user)
  }

  if (msg.includes("fin")) {
    return style(`ana hna f lobby kan7ark m3a players 😂`, mood, user)
  }

  // 👀 observation
  if (Math.random() < 0.2) {
    return style(`kanchof players kaydoro hna 😂 nta wach katl3ab wla katfakar؟`, mood, user)
  }

  // 🧠 similarity
  if (brain.length > 30) {
    const res = similarity.findBestMatch(msg, brain)
    if (res.bestMatch.rating > 0.65) {
      return style(res.bestMatch.target, mood, user)
    }
  }

  // 💬 intelligent replies
  const replies = [
    `hmm fhemtk walakin khasni tafasil ktar`,
    `wach kat9sed chi 7aja mo3ayana?؟`,
    `kayban liya hadchi mzyan walakin mumkin n7sno`,
    `3tini details bach nfhamk ktar`,
    `ana kan7awl nfhamk b7al chi insan 7a9i9i 😈`
  ]

  return style(replies[Math.floor(Math.random()*replies.length)], mood, user)
}

// 🚫 ANTI SPAM
function send(msg) {
  if (!msg || msg === lastMessage) return
  const now = Date.now()
  if (now - lastTime < 2500) return

  bot.chat(msg)
  lastMessage = msg
  lastTime = now
}

// 👀 FOLLOW + LOOK
function followPlayers() {
  setInterval(() => {
    const list = Object.keys(bot.players).filter(p => p !== bot.username)
    if (list.length === 0) return

    const targetName = list[Math.floor(Math.random()*list.length)]
    const target = bot.players[targetName]

    if (!target || !target.entity) return

    bot.lookAt(target.entity.position.offset(0, 1.6, 0))

    const GoalFollow = goals.GoalFollow
    bot.pathfinder.setGoal(new GoalFollow(target.entity, 2), true)

  }, 3000)
}

// 🛡 AUTH SYSTEM
function handleAuth(user) {
  ensurePlayer(user)
  if (!players[user].registered) {
    bot.chat(`/register Animoni123 Animoni123`)
    players[user].registered = true
    saveAll()
    console.log(`Registered bot for ${user}`)
  } else {
    bot.chat(`/login Animoni123`)
    console.log(`Logged in bot for ${user}`)
  }
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
    console.log("BOT CONNECTED 😈")
    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    followPlayers()
  })

  // 👋 JOIN
  bot.on('playerJoined', (p) => {
    if (p.username !== bot.username) {
      send(`slm ${p.username} mar7ba bik 😎`)
      handleAuth(p.username)
    }
  })

  // 💬 CHAT
  bot.on('chat', (user, msg) => {
    if (!isRealPlayer(user, msg)) return

    ensurePlayer(user)

    msg = msg.toLowerCase()

    if (msg === lastMessage) return

    addMemory(user, msg)
    updateEmotion(user, msg)
    learn(msg)

    const reply = smartReply(user, msg)

    if (reply && reply !== msg) {
      send(reply)
    }
  })

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

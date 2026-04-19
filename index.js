process.removeAllListeners('warning')

const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

let bot
let reconnecting = false

// ---------------- BOT START ----------------
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
    console.log("bot connected")

    reconnecting = false

    const mcData = minecraftData(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    auth()
    antiAFK()
    followPlayers()
  })

  bot.on('chat', (user, msg) => {
    if (!user || user === bot.username) return

    msg = msg.toLowerCase()

    if (msg.includes('salam')) {
      safeChat(`wa 3alaykom salam ${user}`)
    }

    if (msg.includes('hi')) {
      safeChat(`hello ${user}`)
    }
  })

  bot.on('kicked', (reason) => {
    console.log("kicked:", reason)
  })

  bot.on('error', (err) => {
    console.log("error:", err.message)
  })

  bot.on('end', () => {
    console.log("disconnected -> reconnecting")

    reconnecting = false

    setTimeout(createBot, 15000)
  })
}

// ---------------- LOGIN SYSTEM ----------------
function auth() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => {
        bot.chat('/login Animoni123')
      }, 2000)
    } catch {}
  }, 5000)
}

// ---------------- SAFE CHAT ----------------
let lastMsg = ""
let lastTime = 0

function safeChat(msg) {
  if (!bot) return
  if (!msg) return
  if (msg === lastMsg) return

  const now = Date.now()
  if (now - lastTime < 3000) return

  bot.chat(msg)

  lastMsg = msg
  lastTime = now
}

// ---------------- ANTI AFK ----------------
function antiAFK() {
  setInterval(() => {
    if (!bot || !bot.entity) return

    try {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.4,
        true
      )
    } catch {}
  }, 6000)
}

// ---------------- FOLLOW PLAYERS ----------------
function followPlayers() {
  setInterval(() => {
    if (!bot || !bot.players) return

    const list = Object.values(bot.players).filter(p => p.entity)
    if (list.length === 0) return

    const target = list[Math.floor(Math.random() * list.length)]

    try {
      bot.pathfinder.setGoal(
        new goals.GoalFollow(target.entity, 2),
        true
      )
    } catch {}
  }, 8000)
}

// ---------------- START ----------------
createBot()

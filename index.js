const mineflayer = require('mineflayer')
const mcDataLoader = require('minecraft-data')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

let bot = null
let reconnecting = false

// ---------------- CONNECT ----------------
function createBot() {
  if (reconnecting) return
  reconnecting = true

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME
  })

  bot.loadPlugin(pathfinder)

  // ---------------- SPAWN ----------------
  bot.once('spawn', () => {
    reconnecting = false
    console.log('bot spawned')

    const mcData = mcDataLoader(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)
  })

  // ---------------- CHAT (NO COMMANDS) ----------------
  bot.on('chat', (user, msg) => {
    if (!user || user === bot.username) return

    const text = msg.toLowerCase()

    if (text.includes('salam')) {
      safeChat('wa 3alaykom salam ' + user)
    }

    if (text.includes('hello')) {
      safeChat('hello ' + user)
    }
  })

  // ---------------- DEATH -> AUTO RESPAWN ----------------
  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 2000)
  })

  // ---------------- KICK ----------------
  bot.on('kicked', (reason) => {
    console.log('kicked:', reason)
  })

  // ---------------- ERROR ----------------
  bot.on('error', () => {})

  // ---------------- END -> RECONNECT ----------------
  bot.on('end', () => {
    console.log('disconnected -> reconnect')

    reconnecting = false

    setTimeout(() => {
      createBot()
    }, 5000)
  })
}

// ---------------- SAFE CHAT ----------------
let lastMsg = ''
let lastTime = 0

function safeChat(msg) {
  if (!bot || !msg) return

  const now = Date.now()
  if (msg === lastMsg) return
  if (now - lastTime < 2500) return

  try {
    bot.chat(msg)
  } catch {}

  lastMsg = msg
  lastTime = now
}

// ---------------- START ----------------
createBot()

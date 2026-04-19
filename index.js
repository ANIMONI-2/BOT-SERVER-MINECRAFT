process.removeAllListeners('warning')

const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

let bot = null
let ready = false
let reconnecting = false

let lastChat = ""
let lastTime = 0

// ---------------- CREATE BOT ----------------
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

  // ---------------- SPAWN ----------------
  bot.once('spawn', () => {
    console.log("connected")

    ready = true
    reconnecting = false

    const mcData = minecraftData(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    auth()
    antiAFK()
  })

  // ---------------- CHAT ----------------
  bot.on('chat', (user, msg) => {
    if (!ready) return
    if (!user || user === bot.username) return

    msg = msg.toLowerCase()

    // ignore commands
    if (msg.startsWith('/')) return

    if (msg.includes('hi')) {
      safeChat(`hello ${user}`)
    }

    if (msg.includes('salam')) {
      safeChat(`wa 3alaykom salam ${user}`)
    }
  })

  // ---------------- KICK ----------------
  bot.on('kicked', (reason) => {
    console.log("kicked:", reason)
  })

  bot.on('error', (err) => {
    console.log("error:", err.message)
  })

  // ---------------- SAFE RECONNECT ----------------
  bot.on('end', () => {
    console.log("disconnected, reconnecting...")

    ready = false

    setTimeout(() => {
      reconnecting = false
      createBot()
    }, 15000)
  })
}

// ---------------- AUTH ----------------
function auth() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')

      setTimeout(() => {
        bot.chat('/login Animoni123')
      }, 2500)
    } catch {}
  }, 5000)
}

// ---------------- SAFE CHAT ----------------
function safeChat(msg) {
  if (!bot || !ready) return
  if (!msg) return
  if (msg === lastChat) return

  const now = Date.now()
  if (now - lastTime < 2500) return

  try {
    bot.chat(msg)

    lastChat = msg
    lastTime = now
  } catch {}
}

// ---------------- ANTI AFK ----------------
function antiAFK() {
  setInterval(() => {
    if (!bot || !ready || !bot.entity) return

    try {
      bot.setControlState('jump', true)

      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 300)

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3,
        true
      )
    } catch {}
  }, 7000)
}

// ---------------- START ----------------
createBot()

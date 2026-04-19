process.removeAllListeners('warning')

const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

let bot = null

let reconnecting = false
let ready = false
let loggedIn = false

let lastChat = ""
let lastTime = 0


// ===================== CREATE BOT =====================
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


  // ===================== SPAWN =====================
  bot.once('spawn', () => {

    console.log("spawned")

    ready = true
    reconnecting = false
    loggedIn = false

    const mcData = minecraftData(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    handleAuth()
  })


  // ===================== RESPawn (IMPORTANT) =====================
  bot.on('respawn', () => {
    console.log("respawned")

    ready = true

    // نعاود login إلا السيرفر طلب
    handleAuth()
  })


  // ===================== CHAT =====================
  bot.on('chat', (user, msg) => {

    if (!ready) return
    if (!user || user === bot.username) return

    msg = msg.toLowerCase()

    if (msg.startsWith('/')) return

    if (msg.includes('hi')) {
      safeChat(`hello ${user}`)
    }

    if (msg.includes('salam')) {
      safeChat(`wa 3alaykom salam ${user}`)
    }
  })


  // ===================== KICK =====================
  bot.on('kicked', (reason) => {
    console.log("kicked:", reason)
  })


  // ===================== ERROR =====================
  bot.on('error', (err) => {
    console.log("error:", err.message)
  })


  // ===================== END (DISCONNECT) =====================
  bot.on('end', () => {

    console.log("disconnected -> reconnecting")

    ready = false
    loggedIn = false
    reconnecting = false

    setTimeout(createBot, 15000)
  })
}


// ===================== AUTH SYSTEM =====================
function handleAuth() {

  if (!bot || loggedIn) return

  setTimeout(() => {
    try {

      // نحاول register/login مرة وحدة فقط
      bot.chat('/register Animoni123 Animoni123')

      setTimeout(() => {
        bot.chat('/login Animoni123')

        loggedIn = true
      }, 2500)

    } catch {}
  }, 5000)
}


// ===================== SAFE CHAT =====================
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


// ===================== ANTI FREEZE LIGHT =====================
setInterval(() => {
  if (!bot || !ready || !bot.entity) return

  try {
    bot.look(
      Math.random() * Math.PI * 2,
      (Math.random() - 0.5) * 0.2,
      true
    )
  } catch {}
}, 8000)


// ===================== START =====================
createBot()

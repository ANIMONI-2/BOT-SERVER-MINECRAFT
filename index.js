const mineflayer = require('mineflayer')
const mcDataLoader = require('minecraft-data')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

// إذا السيرفر فيه تسجيل
const PASSWORD = 'Animoni123'

let bot = null
let reconnecting = false

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

    handleAuth()
  })

  // ---------------- CHAT ----------------
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

  // ---------------- RESPAWN ----------------
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

  bot.on('error', () => {})

  bot.on('end', () => {
    console.log('reconnecting...')
    reconnecting = false
    setTimeout(createBot, 5000)
  })
}

// ---------------- LOGIN / REGISTER FIX ----------------
function handleAuth() {
  setTimeout(() => {
    try {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      console.log('register sent')

      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`)
        console.log('login sent')
      }, 2000)

    } catch {}
  }, 4000)
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

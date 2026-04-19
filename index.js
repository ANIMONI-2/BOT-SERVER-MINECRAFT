const mineflayer = require('mineflayer')
const mcDataLoader = require('minecraft-data')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

let bot = null
let reconnecting = false

let lastConnect = 0

function createBot() {
  const now = Date.now()

  // ANTI THROTTLE (IMPORTANT)
  if (now - lastConnect < 15000) return

  if (reconnecting) return
  reconnecting = true
  lastConnect = now

  console.log('connecting...')

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: '1.12.2'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('bot spawned')
    reconnecting = false

    const mcData = mcDataLoader(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    login()
  })

  // CHAT SAFE
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

  // RESPawn FIX
  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 2000)
  })

  // KICK HANDLE
  bot.on('kicked', (reason) => {
    console.log('kicked:', reason)
  })

  // ERROR HANDLE
  bot.on('error', (err) => {
    console.log('error:', err.message)
  })

  // RECONNECT (SLOW)
  bot.on('end', () => {
    console.log('disconnected -> reconnect')

    reconnecting = false

    setTimeout(createBot, 10000)
  })
}

// LOGIN SAFE
function login() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => {
        bot.chat('/login Animoni123')
      }, 2500)
    } catch {}
  }, 5000)
}

// SAFE CHAT (ANTI SPAM)
let lastMsg = ''
let lastTime = 0

function safeChat(msg) {
  if (!bot || !msg) return

  const now = Date.now()

  if (msg === lastMsg) return
  if (now - lastTime < 3000) return

  try {
    bot.chat(msg)
  } catch {}

  lastMsg = msg
  lastTime = now
}

// ANTI AFK (SAFE)
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

createBot()
antiAFK()

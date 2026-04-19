process.removeAllListeners('warning')

const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const minecraftData = require('minecraft-data')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

let bot = null
let reconnecting = false

function createBot() {
  if (reconnecting) return
  reconnecting = true

  console.log('connecting...')

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: false
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    reconnecting = false
    console.log('bot spawned')

    const mcData = minecraftData(bot.version)
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    login()
    antiAFK()
  })

  // CHAT (بسيط)
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

  // RESPAWN
  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 2000)
  })

  // KICK
  bot.on('kicked', (r) => {
    console.log('kicked:', r)
  })

  bot.on('error', () => {})

  bot.on('end', () => {
    console.log('reconnecting...')
    reconnecting = false
    setTimeout(createBot, 7000)
  })
}

// LOGIN
function login() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => bot.chat('/login Animoni123'), 2000)
    } catch {}
  }, 4000)
}

// SAFE CHAT
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

// ANTI AFK
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

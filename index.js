const mineflayer = require('mineflayer')
const mcDataLoader = require('minecraft-data')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

let bot = null
let reconnecting = false
let lastConnect = 0

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms))
}

async function createBot() {
  const now = Date.now()

  // anti spam reconnect
  if (reconnecting) return
  if (now - lastConnect < 30000) return

  reconnecting = true
  lastConnect = now

  console.log('connecting...')

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USERNAME,
    version: '1.20.4',
    keepAlive: true,
    checkTimeoutInterval: 60000
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', async () => {
    console.log('bot spawned')
    reconnecting = false

    const mcData = mcDataLoader(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    await sleep(8000)
    login()
  })

  // chat
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

  // respawn fix
  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 3000)
  })

  // error safe
  bot.on('error', (err) => {
    console.log('error:', err.message)
  })

  // kick log
  bot.on('kicked', (reason) => {
    console.log('kicked:', reason)
  })

  // reconnect stable (IMPORTANT)
  bot.on('end', async () => {
    console.log('disconnected -> reconnect')

    reconnecting = false

    await sleep(30000)
    createBot()
  })
}

// login system
function login() {
  try {
    bot.chat('/register Animoni123 Animoni123')

    setTimeout(() => {
      try {
        bot.chat('/login Animoni123')
      } catch {}
    }, 3000)
  } catch {}
}

// safe chat
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

createBot()

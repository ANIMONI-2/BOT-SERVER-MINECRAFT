process.removeAllListeners('warning')

const mineflayer = require('mineflayer')

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
    version: '1.12.2'
  })

  bot.once('spawn', () => {
    console.log('bot joined server')
    reconnecting = false

    login()
  })

  // LOGIN
  function login() {
    setTimeout(() => {
      try {
        bot.chat('/register Animoni123 Animoni123')
        setTimeout(() => {
          bot.chat('/login Animoni123')
        }, 2000)
      } catch {}
    }, 5000)
  }

  // SIMPLE CHAT
  bot.on('chat', (user, msg) => {
    if (!user || user === bot.username) return

    if (msg.toLowerCase().includes('salam')) {
      safeChat('wa 3alaykom salam')
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

  // DEBUG
  bot.on('kicked', (r) => console.log('kicked:', r))
  bot.on('error', (e) => console.log('error:', e.message))

  // RECONNECT
  bot.on('end', () => {
    console.log('reconnecting...')
    reconnecting = false
    setTimeout(createBot, 4000)
  })
}

// SAFE CHAT
let last = ''
let lastTime = 0

function safeChat(msg) {
  const now = Date.now()
  if (msg === last) return
  if (now - lastTime < 3000) return

  try {
    bot.chat(msg)
  } catch {}

  last = msg
  lastTime = now
}

createBot()

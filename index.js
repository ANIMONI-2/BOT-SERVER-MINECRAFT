process.removeAllListeners('warning')

const mineflayer = require('mineflayer')

const HOST = 'ANIMONI.aternos.me'
const PORT = 59644
const USERNAME = 'ANIMONIBOT'

let bot
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

  // fix movement kick
  bot._client.on('position', () => {})

  bot.once('spawn', () => {
    console.log('bot spawned')
    reconnecting = false

    login()
    chatLoop()
  })

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

  bot.on('death', () => {
    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 2000)
  })

  bot.on('kicked', (r) => {
    console.log('kicked:', r)
  })

  bot.on('error', () => {})

  bot.on('end', () => {
    console.log('reconnecting...')
    reconnecting = false
    setTimeout(createBot, 5000)
  })
}

// login
function login() {
  setTimeout(() => {
    try {
      bot.chat('/register Animoni123 Animoni123')
      setTimeout(() => bot.chat('/login Animoni123'), 2000)
    } catch {}
  }, 4000)
}

// anti spam chat
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

// chat loop (باش مايبقاش AFK)
function chatLoop() {
  setInterval(() => {
    if (!bot) return

    const msgs = [
      'salam',
      'ana hna',
      'wach kayn chi wa7d',
      'kanchof server'
    ]

    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    safeChat(msg)

  }, 20000)
}

// start
createBot()

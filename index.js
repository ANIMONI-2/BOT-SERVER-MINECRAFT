const mineflayer = require('mineflayer')

let bot
let playersMemory = {}
let lastMessageTime = 0

function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.once('spawn', () => {
    console.log('✅ Realistic Bot Connected')

    antiAFK()
    randomLook()
    randomIdle()
    trackPlayers()
    randomChat()
  })

  bot.on('end', () => setTimeout(createBot, 7000))
  bot.on('error', console.log)

  bot.on('death', () => bot.emit('respawn'))

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    rememberPlayer(username)
    humanReply(username, message)
  })
}

createBot()

// 🧠 حفظ اللاعبين
function rememberPlayer(name) {
  if (!playersMemory[name]) {
    playersMemory[name] = { seen: Date.now(), messages: 0 }

    setTimeout(() => {
      if (Math.random() < 0.7) {
        bot.chat(`salam ${name}`)
      }
    }, randomDelay())
  }
}

// ⏱️ delay واقعي
function randomDelay() {
  return Math.floor(Math.random() * 4000) + 2000
}

// 🧠 رد بشري
function humanReply(username, msg) {
  if (Math.random() > 0.6) return // مرات يسكت

  setTimeout(() => {

    let replies = []

    msg = msg.toLowerCase()

    if (msg.includes('hi') || msg.includes('salam')) {
      replies = ['salam', 'ahlan', 'yo']
    }

    else if (msg.includes('how') || msg.includes('kifach')) {
      replies = ['mzyan', 'normal', 'labas']
    }

    else if (msg.includes('server')) {
      replies = ['zwin', 'mzyan shwiya', 'kaymchi']
    }

    else if (msg.includes('bot')) {
      replies = ['la', '???', 'fin bot']
    }

    else {
      replies = [
        'hmm',
        'mafhemtch',
        'ah ok',
        'wakha',
        '😅'
      ]
    }

    let reply = replies[Math.floor(Math.random() * replies.length)]

    // 😏 أخطاء بشرية
    if (Math.random() < 0.3) {
      reply = reply.replace('a', '')
    }

    bot.chat(reply)

  }, randomDelay())
}

// 💬 شات قليل (باش مايبانش سبام)
function randomChat() {
  setInterval(() => {
    if (!bot.player) return

    if (Math.random() < 0.3) {
      const msgs = [
        'wach kayn chi wahed',
        'hmm',
        'server hna',
        'fin players',
        '😅'
      ]

      bot.chat(msgs[Math.floor(Math.random() * msgs.length)])
    }

  }, 30000)
}

// 🕺 anti afk
function antiAFK() {
  setInterval(() => {
    if (Math.random() < 0.5) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }
  }, 15000)
}

// 👀 camera
function randomLook() {
  setInterval(() => {
    const yaw = Math.random() * Math.PI * 2
    const pitch = (Math.random() - 0.5) * Math.PI
    bot.look(yaw, pitch, true)
  }, 5000)
}

// 🧍‍♂️ idle movement (حركات صغيرة)
function randomIdle() {
  setInterval(() => {
    if (Math.random() < 0.4) {
      bot.setControlState('forward', true)

      setTimeout(() => {
        bot.setControlState('forward', false)
      }, Math.floor(Math.random() * 2000) + 1000)
    }
  }, 10000)
}

// 👥 tracking
function trackPlayers() {
  setInterval(() => {
    for (const name in bot.players) {
      if (name !== bot.username) {
        rememberPlayer(name)
      }
    }
  }, 5000)
}

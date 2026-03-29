const mineflayer = require('mineflayer')

let bot

function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.on('spawn', () => {
    console.log('✅ Bot joined')

    antiAFK()
    randomMove()
    smartChat()
  })

  // 🔁 reconnect
  bot.on('end', () => {
    console.log('❌ Disconnected... reconnecting')
    setTimeout(createBot, 5000)
  })

  bot.on('error', (err) => console.log(err.message))
  bot.on('kicked', (r) => console.log('Kicked:', r))

  // 💬 ردود ذكية
  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    message = message.toLowerCase()

    if (message.includes('hi') || message.includes('slm')) {
      bot.chat('salam 👋')
    }

    if (message.includes('wach')) {
      bot.chat('labas 😎')
    }

    if (message.includes('bot')) {
      bot.chat('la ana insan 😂')
    }

    if (message.includes('come')) {
      followPlayer(username)
    }
  })
}

createBot()

// 🟢 Anti AFK
function antiAFK() {
  setInterval(() => {
    if (!bot.entity) return

    bot.setControlState('jump', true)
    bot.setControlState('forward', true)

    setTimeout(() => {
      bot.setControlState('jump', false)
      bot.setControlState('forward', false)
    }, 1000)
  }, 10000)
}

// 🎮 حركة عشوائية
function randomMove() {
  setInterval(() => {
    if (!bot.entity) return

    const moves = ['left', 'right', 'back', 'sprint']
    const move = moves[Math.floor(Math.random() * moves.length)]

    bot.setControlState(move, true)

    setTimeout(() => {
      bot.setControlState(move, false)
    }, 2000)
  }, 15000)
}

// 💬 شات عشوائي
function smartChat() {
  const messages = [
    'AFK 😎',
    'wach kayn chi wahed?',
    'ana hna 👀',
    'server zwin 🔥'
  ]

  setInterval(() => {
    if (bot && bot.player) {
      const msg = messages[Math.floor(Math.random() * messages.length)]
      bot.chat(msg)
    }
  }, 60000)
}

// 🧍‍♂️ يتبع اللاعب
function followPlayer(username) {
  const player = bot.players[username]?.entity

  if (!player) {
    bot.chat('makanchofk 😅')
    return
  }

  bot.chat('jaya 😎')

  const interval = setInterval(() => {
    if (!player || !bot.entity) {
      clearInterval(interval)
      return
    }

    const dx = player.position.x - bot.entity.position.x
    const dz = player.position.z - bot.entity.position.z

    if (Math.abs(dx) > 1) bot.setControlState('forward', true)
    else bot.setControlState('forward', false)

  }, 5000)
}

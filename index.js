const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')

let bot

// 🤖 إنشاء البوت
function createBot() {
  bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.loadPlugin(pathfinder)

  bot.once('spawn', () => {
    console.log('🔥 BOT CONNECTED')

    const mcData = require('minecraft-data')(bot.version)
    bot.pathfinder.setMovements(new Movements(bot, mcData))

    startSystems()
  })

  bot.on('chat', (username, message) => {
    if (username === bot.username) return

    // رد بسيط داخل اللعبة
    if (message.toLowerCase().includes('hi')) {
      bot.chat(`salam ${username} 👋`)
    }
  })

  bot.on('playerJoined', (player) => {
    if (player.username === bot.username) return
    setTimeout(() => {
      bot.chat(`mar7ba ${player.username} f SERVER ANIMONI 🎉`)
    }, 2000)
  })

  bot.on('death', () => bot.emit('respawn'))

  bot.on('end', () => {
    console.log('🔄 reconnecting...')
    setTimeout(createBot, 5000)
  })

  bot.on('error', console.log)
}

createBot()

// 🎉 أنظمة البوت
function startSystems() {
  // حركة القفز كل 15 ثانية
  setInterval(() => {
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 500)
  }, 15000)

  // تحريك الكاميرا بشكل عشوائي
  setInterval(() => {
    bot.look(Math.random() * Math.PI * 2, 0, true)
  }, 5000)

  // رسائل عشوائية داخل اللعبة
  const msgs = [
    '🔥 mar7ba bikom f server ANIMONI',
    '🎮 stamt3 b w9tk!',
    '😂 wach kayn chi wahed?',
    '👀 ana hna',
    '💬 dkhol discord!' // هذا مجرد نص داخل اللعبة، ماشي مرتبط بالـ Discord فعليًا
  ]

  setInterval(() => {
    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    bot.chat(msg)
  }, 60000)
}

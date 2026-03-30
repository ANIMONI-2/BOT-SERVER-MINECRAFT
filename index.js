const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { Client, GatewayIntentBits } = require('discord.js')

let bot

// 🎮 Discord
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
})

// 🔐 Login
discord.login(process.env.MTQ4ODE4MTM5MDgxNzM2MTk0MA.GQVGga.f_3cjGvMSk6wQi7o9WDM03xqfuisGIEjz-N3Vw)

// 🤖 Create bot
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

    // رد بسيط
    if (message.toLowerCase().includes('hi')) {
      bot.chat(`salam ${username} 👋`)
    }

    sendToDiscord(`[MC] ${username}: ${message}`)
  })

  bot.on('playerJoined', (player) => {
    if (player.username === bot.username) return
    setTimeout(() => {
      bot.chat(`mar7ba ${player.username} f server ANIMONI 🎉`)
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

// 🎉 Systems
function startSystems() {

  // حركة
  setInterval(() => {
    bot.setControlState('jump', true)
    setTimeout(() => bot.setControlState('jump', false), 500)
  }, 15000)

  // تحريك الكاميرا
  setInterval(() => {
    bot.look(Math.random() * Math.PI * 2, 0, true)
  }, 5000)

  // رسائل عشوائية
  const msgs = [
    '🔥 mar7ba bikom f server ANIMONI',
    '🎮 stamt3 b w9tk!',
    '😂 wach kayn chi wahed?',
    '👀 ana hna',
    '💬 dkhol discord!'
  ]

  setInterval(() => {
    const msg = msgs[Math.floor(Math.random() * msgs.length)]
    bot.chat(msg)
  }, 60000)
}

// 💬 Discord → Minecraft
discord.on('messageCreate', msg => {
  if (msg.author.bot) return
  bot.chat(`[DC] ${msg.author.username}: ${msg.content}`)
})

// 💬 Minecraft → Discord
function sendToDiscord(message) {
  const channel = discord.channels.cache.get(process.env.1404870423744876604)
  if (channel) channel.send(message)
}

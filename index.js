const mineflayer = require('mineflayer')

function createBot() {
  const bot = mineflayer.createBot({
    host: 'ANIMONI.aternos.me',
    port: 59644,
    username: 'ANIMONIBOT',
    version: '1.12.2'
  })

  bot.on('spawn', () => {
    console.log('Bot connected')

    setInterval(() => {
      bot.setControlState('jump', true)
      bot.setControlState('sneak', true)

      setTimeout(() => {
        bot.setControlState('jump', false)
        bot.setControlState('sneak', false)
      }, 1000)
    }, 12000)
  })

  bot.on('end', () => {
    setTimeout(createBot, 15000)
  })

  bot.on('error', console.log)
}

createBot()

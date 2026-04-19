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

  // دخل للسيرفر
  bot.once('spawn', () => {
    console.log('spawned')
    reconnecting = false

    doLogin()
  })

  // LOGIN ضروري
  function doLogin() {
    setTimeout(() => {
      try {
        bot.chat('/register Animoni123 Animoni123')
        console.log('register sent')

        setTimeout(() => {
          bot.chat('/login Animoni123')
          console.log('login sent')
        }, 2000)

      } catch (e) {
        console.log('login error')
      }
    }, 4000)
  }

  // RESPAWN إذا مات
  bot.on('death', () => {
    console.log('bot died -> respawn')

    setTimeout(() => {
      try {
        bot.respawn()
      } catch {}
    }, 2000)
  })

  // DEBUG
  bot.on('kicked', (r) => {
    console.log('KICKED:', r)
  })

  bot.on('error', (e) => {
    console.log('ERROR:', e.message)
  })

  // RECONNECT مباشر
  bot.on('end', () => {
    console.log('disconnected -> reconnect now')

    reconnecting = false
    setTimeout(createBot, 3000)
  })
}

createBot()

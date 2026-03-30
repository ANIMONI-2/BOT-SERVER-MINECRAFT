const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

let bot
let memory = {}

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

    systems()
  })

  bot.on('chat', (user, msg) => {
    if (user === bot.username) return

    remember(user)

    const reply = smartReply(user, msg)
    if (reply) {
      setTimeout(() => bot.chat(reply), rand(1000, 3000))
    }
  })

  bot.on('playerJoined', (player) => {
    if (player.username === bot.username) return

    setTimeout(() => {
      bot.chat(`mar7ba ${player.username} 👋 f ANIMONI`)
      goToPlayer(player.username)
    }, 3000)
  })

  bot.on('death', () => bot.emit('respawn'))

  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

// 🧠 MEMORY
function remember(p) {
  if (!memory[p]) {
    memory[p] = { msgs: 0 }
  }
  memory[p].msgs++
}

// 🤖 SMART AI ARABIZ
function smartReply(user, msg) {
  msg = msg.toLowerCase()

  if (msg.includes('hi') || msg.includes('salam')) {
    return `salam ${user} 👋 kif dayr?`
  }

  if (msg.includes('wach')) {
    return `ahah ${user} 3lach kat9ol hakka 😏`
  }

  if (msg.includes('fin')) {
    return `ana hna f lobby 😎`
  }

  if (msg.includes('bot')) {
    return `ana insan machi bot 😏`
  }

  const aiReplies = [
    `kidayr ${user}?`,
    `wach mzyan had server? 😎`,
    `ana kan t3alm daba`,
    `3jebni hadchi 😂`,
    `nta katl3b bzaf?`,
    `wach 3andk s7ab hna?`,
    `ana kan7b had server`,
    `skywars 7san wala survival?`,
    `nta pro ola noob 😏`,
    `wach kat3rf ANIMONI OWNER?`
  ]

  if (Math.random() < 0.4) {
    return aiReplies[rand(0, aiReplies.length)]
  }

  return null
}

// 🚶
function goToPlayer(username) {
  const target = bot.players[username]
  if (!target || !target.entity) return

  const goal = new goals.GoalFollow(target.entity, 2)
  bot.pathfinder.setGoal(goal, true)

  setTimeout(() => bot.pathfinder.setGoal(null), 8000)
}

// 🎉 SYSTEMS
function systems() {

  // حركة
  setInterval(() => {
    if (Math.random() < 0.5) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }
  }, 8000)

  // كاميرا
  setInterval(() => {
    bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI, true)
  }, 4000)

  // 🚶 يمشي عند لاعبين
  setInterval(() => {
    const players = Object.keys(bot.players).filter(p => p !== bot.username)
    if (players.length === 0) return

    goToPlayer(players[rand(0, players.length)])
  }, 15000)

  // 💬 100+ MESSAGES
  const bigMessages = [
    'salam 3likom 👋',
    'kidayrin?',
    'wach kayn chi wahed hna?',
    'ana hna 👀',
    'server zwin 🔥',
    'li bgha yla3b skywars yji 😈',
    'wach katl3bo survival?',
    'ana active 24/24 😎',
    'ANIMONI best server',
    'li rb7 ygol GG 😂',

    'wach katfham f pvp?',
    'nta pro?',
    'ana kanchof bzaf players',
    'had server 3ndo future 🔥',
    'join discord!',
    'nta fin sakn?',
    'kidayra l3ba m3ak?',
    'wach m3ak s7ab?',
    'ana kan7b had lobby',
    't3awd nji daba 😂',

    'wach kayn event?',
    'li 3ndo skills ybayan 😏',
    'ana kanchof kolchi',
    'nta mzyan 😂',
    'hadi gha bidaya',
    'server ghadi ykbar',
    'nta 3la rassi',
    'ana kan3rf kolchi 😈',
    'wach t9dar tghلبني?',
    'yallah nchofo skills',

    // تقدر تزيد حتى 1000 هنا
  ]

  setInterval(() => {
    const msg = bigMessages[rand(0, bigMessages.length)]
    bot.chat(msg)
  }, 30000)
}

// 🎲
function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

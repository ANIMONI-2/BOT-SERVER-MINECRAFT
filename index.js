const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')

const OWNER = "ANIMONI"

let bot
let memory = {}
let lastMessageTime = 0

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

    ensureMemory(user)

    // 🛡️ حماية OWNER
    if (msg.toLowerCase().includes(OWNER.toLowerCase()) && user !== OWNER) {
      sendMessage(`7tarm ${OWNER} a ${user} 👑`)
    }

    updateMood(user, msg)

    const reply = smartAI(user, msg)
    if (reply) sendMessage(reply)

    addFriendship(user, 5)
  })

  bot.on('playerJoined', (player) => {
    if (player.username === bot.username) return

    ensureMemory(player.username)

    setTimeout(() => {
      sendMessage(getWelcome(player.username))
      goToPlayer(player.username)
    }, 3000)
  })

  bot.on('death', () => bot.emit('respawn'))
  bot.on('end', () => setTimeout(createBot, 5000))
}

createBot()

// 🧠 MEMORY
function ensureMemory(user) {
  if (!memory[user]) {
    memory[user] = {
      msgs: 0,
      friendship: user === OWNER ? 100 : 0,
      mood: 'normal'
    }
  }
  memory[user].msgs++
}

function addFriendship(user, amount) {
  ensureMemory(user)
  memory[user].friendship += amount
  if (memory[user].friendship > 100) memory[user].friendship = 100
  if (memory[user].friendship < 0) memory[user].friendship = 0
}

function getLevel(user) {
  ensureMemory(user)
  const f = memory[user].friendship
  if (f < 20) return 'stranger'
  if (f < 50) return 'normal'
  if (f < 80) return 'friend'
  return 'bestie'
}

// 😡 MOOD
function updateMood(user, msg) {
  ensureMemory(user)
  msg = msg.toLowerCase()

  if (msg.includes('noob') || msg.includes('stupid')) {
    memory[user].mood = 'angry'
    addFriendship(user, -5)
  } else if (msg.includes('sahbi') || msg.includes('zwin')) {
    memory[user].mood = 'happy'
    addFriendship(user, 10)
  } else {
    memory[user].mood = 'normal'
  }
}

// 🤖 AI
function smartAI(user, msg) {
  ensureMemory(user)

  if (user === OWNER) {
    const ownerReplies = [
      `wa malik ${user} 👑`,
      `ana m3ak a ${user}`,
      `nta boss 🔥`,
      `amrni`,
      `kolchi mzyan`
    ]
    return ownerReplies[rand(0, ownerReplies.length)]
  }

  const level = getLevel(user)
  const mood = memory[user].mood

  if (mood === 'angry') {
    const angry = [
      `sir b3d mni ${user}`,
      `hder b7ya`,
      `ma3jbnich had lhdra`,
      `khalli ljo zwin`
    ]
    return angry[rand(0, angry.length)]
  }

  if (mood === 'happy') {
    const happy = [
      `wa sahbi ${user} 😂`,
      `nta wa3er`,
      `kan7b lhdra m3ak`,
      `nta zwin`
    ]
    return happy[rand(0, happy.length)]
  }

  if (msg.includes('salam') || msg.includes('hi')) {
    return `salam ${user} 👋`
  }

  if (msg.includes('fin')) {
    return `ana f lobby 😎`
  }

  if (level === 'stranger') return `wach smitk ${user}?`
  if (level === 'normal') return `kidayr ${user}?`
  if (level === 'friend') return `nta sahbi ${user}`
  if (level === 'bestie') return `nta khoya ${user} ❤️`
}

// 🟢 Welcome
function getWelcome(user) {
  return user === OWNER ? `mar7ba malik ${user} 👑` : `mar7ba ${user} 👋`
}

// 🚫 Anti Spam
function sendMessage(msg) {
  const now = Date.now()
  if (now - lastMessageTime < 4000) return

  bot.chat(msg)
  lastMessageTime = now
}

// 🚶 Follow
function goToPlayer(username) {
  const target = bot.players[username]
  if (!target || !target.entity || !bot.entity) return

  const level = getLevel(username)

  if (level === 'friend' || level === 'bestie' || username === OWNER) {
    const goal = new goals.GoalFollow(target.entity, 2)
    bot.pathfinder.setGoal(goal, true)
    setTimeout(() => bot.pathfinder.setGoal(null), 8000)
  }
}

// ⭐ Favorite
function getFavorite() {
  let best = OWNER
  let max = -1

  for (let p in memory) {
    if (memory[p].friendship > max) {
      max = memory[p].friendship
      best = p
    }
  }

  return best
}

// 📢 SYSTEMS + ANNOUNCEMENTS 🇲🇦
function systems() {

  const announcements = [
    "§6ANIMONI » mar7ba bikom f server 🇲🇦🔥",
    "§bTIP » dir /lobby bach ترجع lobby",
    "§aCOMMAND » dir /spawn bach ترجع spawn",
    "§dFEATURE » 3andna night vision dayma 🌙",
    "§6INFO » IP dyal server: ANIMONI.aternos.me",
    "§cRULE » mamnou3 hacks w spam 🚫",
    "§eTIP » dir /tpa bach tmchi 3nd s7abk",
    "§aECONOMY » dir /pay bach tsift flos",
    "§bHOME » dir /sethome w /home",
    "§dGAMES » skywars mawjouda ☁️",
    "§6INFO » ila n3s chi wa7d kaywli nhar 🌞",
    "§cRULE » 7tarm la3bin 🚫",
    "§aTEAM » l3b m3a s7abk 🤝",
    "§bOWNER » 7tarm ANIMONI 👑",
    "§eTIP » qta3 chjar b axe bsr3a 🪓",
    "§dFUN » enjoy survival 🌍",
    "§6JOIN » 3ayet l s7abk 🔥",
    "§cRULE » mamnou3 i3lan 3la servers 🚫",
    "§aHELP » ila 7tajiti chi 7aja goul l admin 👮"
  ]

  let i = 0

  setInterval(() => {
    sendMessage(announcements[i])
    i++
    if (i >= announcements.length) i = 0
  }, 60000)

  // random talk
  setInterval(() => {
    const fav = getFavorite()
    if (fav) sendMessage(`fin ghabrti ${fav} 😂`)
  }, 40000)

  // jump
  setInterval(() => {
    if (Math.random() < 0.3) {
      bot.setControlState('jump', true)
      setTimeout(() => bot.setControlState('jump', false), 300)
    }
  }, 9000)

  // look
  setInterval(() => {
    bot.look(Math.random() * Math.PI * 2, (Math.random() - 0.5) * Math.PI, true)
  }, 5000)
}

// 🎲
function rand(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

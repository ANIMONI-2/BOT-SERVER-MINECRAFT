const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const net = require('net')

const OWNER = "ANIMONI"
const SERVER_HOST = 'ANIMONI.aternos.me'
const SERVER_PORT = 59644

let bot = null
let memory = {}
let lastMessageTime = 0
let reconnectInterval = null
let reconnecting = false

function createBot() {
  if (bot) return
  reconnecting = false

  bot = mineflayer.createBot({
    host: SERVER_HOST,
    port: SERVER_PORT,
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

    // حماية OWNER
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

  bot.on('error', (err) => {
    console.log('❌ BOT ERROR:', err.message)
    stopBotAndReconnect()
  })

  bot.on('kicked', (reason) => {
    console.log('❌ BOT KICKED:', JSON.stringify(reason))
    stopBotAndReconnect()
  })

  bot.on('end', () => {
    console.log('⚠️ BOT DISCONNECTED')
    stopBotAndReconnect()
  })
}

function stopBotAndReconnect() {
  if (reconnecting) return
  reconnecting = true

  try { if (bot) bot.quit() } catch {}
  bot = null

  if (reconnectInterval) clearInterval(reconnectInterval)

  reconnectInterval = setInterval(() => {
    checkServerOnline(SERVER_HOST, SERVER_PORT, (online) => {
      if (online) {
        console.log('🔄 SERVER ONLINE! Reconnecting bot in 10s...')
        clearInterval(reconnectInterval)
        reconnectInterval = null
        setTimeout(createBot, 10000) // تأخير 10 ثواني قبل reconnect
      } else {
        console.log('⏳ SERVER OFFLINE. Waiting...')
      }
    })
  }, 5000)
}

function checkServerOnline(host, port, callback) {
  const socket = new net.Socket()
  let called = false
  socket.setTimeout(2000)
  socket.on('connect', () => { called = true; socket.destroy(); callback(true) })
  socket.on('timeout', () => { if(!called){called=true; socket.destroy(); callback(false)} })
  socket.on('error', () => { if(!called){called=true; socket.destroy(); callback(false)} })
  socket.connect(port, host)
}

// MEMORY
function ensureMemory(user) {
  if (!memory[user]) {
    memory[user] = { msgs: 0, friendship: user===OWNER?100:0, mood:'normal' }
  }
  memory[user].msgs++
}

function addFriendship(user, amount) {
  ensureMemory(user)
  memory[user].friendship += amount
  if (memory[user].friendship>100) memory[user].friendship=100
  if (memory[user].friendship<0) memory[user].friendship=0
}

function getLevel(user) {
  ensureMemory(user)
  const f = memory[user].friendship
  if(f<20) return 'stranger'
  if(f<50) return 'normal'
  if(f<80) return 'friend'
  return 'bestie'
}

// MOOD
function updateMood(user,msg) {
  ensureMemory(user)
  msg = msg.toLowerCase()
  if(msg.includes('noob')||msg.includes('stupid')) { memory[user].mood='angry'; addFriendship(user,-5) }
  else if(msg.includes('sahbi')||msg.includes('zwin')) { memory[user].mood='happy'; addFriendship(user,10) }
  else { memory[user].mood='normal' }
}

// AI
function smartAI(user,msg) {
  ensureMemory(user)
  msg = removeIllegalChars(msg)
  if(user===OWNER) return [`wa malik ${user} 👑`, `ana m3ak a ${user}`, `nta boss 🔥`, `amrni`, `kolchi mzyan`][rand(0,5)]
  const level = getLevel(user)
  const mood = memory[user].mood
  if(mood==='angry') return [`sir b3d mni ${user}`, `hder b7ya`, `ma3jbnich had lhdra`, `khalli ljo zwin`][rand(0,4)]
  if(mood==='happy') return [`wa sahbi ${user} 😂`, `nta wa3er`, `kan7b lhdra m3ak`, `nta zwin`][rand(0,4)]
  if(msg.includes('salam')||msg.includes('hi')) return `salam ${user} 👋`
  if(msg.includes('fin')) return `ana f lobby 😎`
  if(level==='stranger') return `wach smitk ${user}?`
  if(level==='normal') return `kidayr ${user}?`
  if(level==='friend') return `nta sahbi ${user}`
  return `nta khoya ${user} ❤️`
}

function removeIllegalChars(str) {
  return str.replace(/[^ -~]+/g, '') // يحذف أي حرف غير ASCII صالح
}

// Welcome
function getWelcome(user) { return user===OWNER?`mar7ba malik ${user} 👑`:`mar7ba ${user} 👋` }

// Anti Spam
function sendMessage(msg) {
  const now = Date.now()
  if(now-lastMessageTime<4000) return
  if(bot) bot.chat(removeIllegalChars(msg))
  lastMessageTime=now
}

// Follow
function goToPlayer(username) {
  const target = bot.players[username]
  if(!target||!target.entity||!bot.entity) return
  const level = getLevel(username)
  if(level==='friend'||level==='bestie'||username===OWNER){
    const goal = new goals.GoalFollow(target.entity,2)
    bot.pathfinder.setGoal(goal,true)
    setTimeout(()=>bot.pathfinder.setGoal(null),8000)
  }
}

// Favorite
function getFavorite() {
  let best=OWNER, max=-1
  for(let p in memory) if(memory[p].friendship>max){max=memory[p].friendship;best=p}
  return best
}

// Systems + Announcements
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
    "§dGAMES » skywars mawjouda ☁️"
  ]
  let i=0
  setInterval(()=>{sendMessage(announcements[i]); i++; if(i>=announcements.length)i=0},60000)
  setInterval(()=>{const fav=getFavorite(); if(fav)sendMessage(`fin ghabrti ${fav} 😂`)},40000)
  setInterval(()=>{if(Math.random()<0.3){bot.setControlState('jump',true); setTimeout(()=>bot.setControlState('jump',false),300)}},9000)
  setInterval(()=>{bot.look(Math.random()*Math.PI*2,(Math.random()-0.5)*Math.PI,true)},5000)
}

// Random
function rand(min,max){return Math.floor(Math.random()*(max-min)+min)}

// START
checkServerOnline(SERVER_HOST, SERVER_PORT, (online)=>{ if(online) createBot(); else stopBotAndReconnect() })

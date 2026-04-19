// كيشيل warnings ديال Node باش ما يطلعش spam فالكونسول
process.removeAllListeners('warning')

// كنستورد مكتبة صنع البوت ديال Minecraft
const mineflayer = require('mineflayer')

// كنستورد pathfinder باش يمشي ويتحرك
const { pathfinder, Movements } = require('mineflayer-pathfinder')

// باش نعرف بيانات الماب (blocks, mobs…)
const minecraftData = require('minecraft-data')

// هاد المتغير فيه البوت
let bot = null

// باش نعرف واش البوت خدام ولا لا
let ready = false

// باش مايديرش reconnect بزاف
let reconnecting = false

// آخر رسالة باش مانكرروش chat
let lastMessage = ""
let lastTime = 0


// ==================== إنشاء البوت ====================
function createBot() {

  // إلا كان كاين reconnect راه ما نعاودوش نخلقوه
  if (reconnecting) return
  reconnecting = true

  console.log("connecting...")

  // إنشاء البوت
  bot = mineflayer.createBot({

    // IP ديال السيرفر
    host: 'ANIMONI.aternos.me',

    // البورت ديال السيرفر
    port: 59644,

    // اسم البوت
    username: 'ANIMONIBOT',

    // نخليوها false باش تختار النسخة تلقائياً
    version: false
  })

  // نضيف pathfinder للبوت
  bot.loadPlugin(pathfinder)


  // ==================== عند الدخول ====================
  bot.once('spawn', () => {

    console.log("connected")

    ready = true
    reconnecting = false

    // معلومات الماب
    const mcData = minecraftData(bot.version)

    // حركة البوت
    const movements = new Movements(bot, mcData)
    bot.pathfinder.setMovements(movements)

    // تسجيل الدخول للسيرفر (اختياري)
    auth()

    // حركة خفيفة باش ما يتحسبش AFK
    antiAFK()
  })


  // ==================== chat ====================
  bot.on('chat', (user, msg) => {

    // إلا مازال ما خدامش
    if (!ready) return

    // ما يردش على راسو
    if (user === bot.username) return

    // تحويل النص لصغير
    msg = msg.toLowerCase()

    // تجاهل الأوامر /login /msg ...
    if (msg.startsWith('/')) return

    // ردود بسيطة
    if (msg.includes('hi')) {
      safeChat(`hello ${user}`)
    }

    if (msg.includes('salam')) {
      safeChat(`wa 3alaykom salam ${user}`)
    }
  })


  // ==================== kick log ====================
  bot.on('kicked', (reason) => {
    console.log("kicked:", reason)
  })


  // ==================== error ====================
  bot.on('error', (err) => {
    console.log("error:", err.message)
  })


  // ==================== reconnect ====================
  bot.on('end', () => {

    console.log("disconnected, reconnecting...")

    ready = false
    reconnecting = false

    // انتظار قبل إعادة الاتصال باش ما يطيحش السيرفر
    setTimeout(createBot, 15000)
  })
}


// ==================== تسجيل الدخول ====================
function auth() {
  setTimeout(() => {
    try {

      // تسجيل
      bot.chat('/register Animoni123 Animoni123')

      // login
      setTimeout(() => {
        bot.chat('/login Animoni123')
      }, 2500)

    } catch {}
  }, 5000)
}


// ==================== chat آمن ====================
function safeChat(msg) {

  // إلا ما كاينش بوت
  if (!bot || !ready) return

  // إلا فارغ
  if (!msg) return

  // منع التكرار
  if (msg === lastMessage) return

  const now = Date.now()

  // منع spam
  if (now - lastTime < 2500) return

  try {
    bot.chat(msg)

    lastMessage = msg
    lastTime = now
  } catch {}
}


// ==================== anti AFK ====================
function antiAFK() {

  setInterval(() => {

    if (!bot || !ready || !bot.entity) return

    try {

      // يقفز باش ما يتحسبش AFK
      bot.setControlState('jump', true)

      setTimeout(() => {
        bot.setControlState('jump', false)
      }, 300)

      // كيدور راسو شوية
      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.3,
        true
      )

    } catch {}

  }, 7000)
}


// ==================== تشغيل البوت ====================
createBot()

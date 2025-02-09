const altdetect = new (require("../dist/index")).AltDetector()
const discord = require("discord.js")
const config = require("./config.json")

const gib = discord.GatewayIntentBits
const client = new discord.Client({
    //INTENTS ARE IMPORTANT!!
    intents:[
        gib.Guilds,
        gib.GuildMembers,
        gib.GuildMessages,
        gib.MessageContent,
        gib.GuildPresences
    ]
})

client.on("ready",async () => {
    const server = client.guilds.cache.get(config.server)
    if (!server) throw new Error("Server not found!")
    
    server.members.fetch().then((members) => {
        members.forEach((member) => {
            console.log(member.user.displayName,altdetect.check(member))
        })
    })
})

client.on("guildMemberAdd",(member) => {
    const result = altdetect.check(member)
    const category = altdetect.getCategory(result)
    console.log(member.user.displayName,result.total,category)
})

client.login(config.token)
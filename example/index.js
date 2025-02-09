const {AltDetector} = require("discord-alt-detector")
const altdetect = new AltDetector()
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
    
    console.log("Alt Detector Bot Ready!")
})

client.on("guildMemberAdd",async (member) => {
    const result = altdetect.check(member)
    const details = JSON.stringify(result.categories)
    const category = altdetect.getCategory(result)
    console.log("DETECTOR:",member.user.displayName,result.total,category)

    const replyEmbed = new discord.EmbedBuilder()
        .setTitle("📌 Alt Detector Logs")
        .setColor(config.embedColor)
        .setDescription(discord.userMention(member.id)+" joined the server!")
        .setThumbnail(member.displayAvatarURL())
        .setAuthor({name:member.displayName,iconURL:member.displayAvatarURL()})
        .setFooter({text:(member.user.username+" - "+member.id)})
        .setTimestamp(new Date())
        .addFields(
            {name:"Account Age",value:discord.time(member.user.createdAt,"f"),inline:true},
            {name:"Trust Level",value:"```"+category+"```",inline:true},
        )
    if (config.showRawOutput) replyEmbed.addFields({name:"Trust Details",value:"```"+details+"```",inline:false})
    
    const channel = await member.guild.channels.fetch(config.logChannel)
    if (channel && channel.isTextBased()) channel.send({embeds:[replyEmbed]})
})

client.login(config.token)
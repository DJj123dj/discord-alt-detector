<img src="https://apis.dj-dj.be/cdn/discord-alt-detector/logo.png" alt="Alt Detector" width="600px">

[![discord](https://img.shields.io/badge/discord-join%20our%20server-5865F2.svg?style=flat-square&logo=discord)](https://discord.com/invite/26vT9wt3n3)  [![version](https://img.shields.io/badge/version-1.0.2-brightgreen.svg?style=flat-square)](https://github.com/DJj123dj/discord-alt-detector/releases/tag/v1.0.2)  [![discord.js](https://img.shields.io/badge/discord.js-v14-CB3837.svg?style=flat-square&logo=npm)]()  [![license](https://img.shields.io/badge/license-MIT-important.svg?style=flat-square)](https://github.com/DJj123dj/discord-alt-detector/blob/main/LICENSE) [![stars](https://img.shields.io/github/stars/djj123dj/discord-alt-detector?color=yellow&label=stars&logo=github&style=flat-square)](https://www.github.com/DJj123dj/discord-alt-detector)

### Discord Alt Detector
Discord Alt Detector is a small [npm package](https://www.npmjs.com/package/discord-alt-detector) to catch alt accounts based on a first glimpse. It will check for badges, username, pfp, status & more just to detect alt & scam accounts! If you're having trouble setting the bot up, feel free to join our support server and we will help you further! 

**⚠️ The system isn't perfect, so be aware that there could be `false-positives` between the results! ⚠️**

### [Install it using npm!](https://www.npmjs.com/package/discord-alt-detector)
```
npm i discord-alt-detector
```

### ⚠️ Privilleged Gateaway Intents ⚠️
This package requires the `PRESENCE` & `GUILD_MEMBERS` intents to be enabled in the developer portal!
It's required for the package to read the profiles & status of the members!

## 📌 Features
- 📊 75% detection success rate
- 📦 lightweight
- ✅ made with typescript
- ⚙️ advanced configuration using weights
- 📄 support for custom functions
- 🖥️ discord.js v14
- ⭐️ [check more than just the age](#checked-properties)

### Checked Properties
- account age
- pfp & banner
- has nitro / serverbooster
- profile badges
- username & displayname
- status & activity

## 🛠️ Usage
### Dependencies
- `node.js` v18 or higher
- `discord.js` v14 or higher

### Settings
In the settings, you can configure the **weight of each detector**.
- If you want a checker to stand out from the rest, you can increase the weight (e.g. `2`).
- If you don't want something to affect the score, you can set the value to `0`.
```js
const detector = new AltDetector({
    ageWeight:1, //account age
    statusWeight:1, //user status (online, invisible, idle, dnd)
    activityWeight:1, //user activity (playing/listening ...)
    usernameWordsWeight:1, //suspicious words in username
    usernameSymbolsWeight:1, //special characters in username
    displaynameWordsWeight:1, //suspicious words in displayname
    
    displaynameCapsWeight:1, //caps characters in displayname
    //the more, the better => scammers & alts usually don't have many caps
    
    displaynameSymbolsWeight:1, //special characters in displayname
    flagsWeight:1, //profile badges (hypesquad, active dev, early supporter, ...)
    boosterWeight:1, //is server booster
    pfpWeight:1, //has non-default avatar
    bannerWeight:1, //has nitro banner
    customWeight:1 //weight for custom function
}
```

### Result
The result is an object with the `total` score & `categories` object.
In the `categories`, you can find the individual score per-category!

**Weights are applied to all numbers in the result!**

### Category
When using the `AltDetector.getCategory(result)` function, you get one of the following categories:

|Category                 |Notes                      |
|-------------------------|-------------------------------|
|✅ `"highly-trusted"`    |You can trust this person in all cases! (they could even apply for staff) |
|✅ `"trusted"`           |You can trust this person very good!                                      |
|✅ `"normal"`            |A normal user, nothing to worry about!                                    |
|🟠 `"newbie"`            |A new user on discord, you might inspect him/her a little more!           |
|🟠 `"suspicious"`        |Be careful with this user, this might be an alt/spy account!              |
|❌ `"highly-suspicious"` |Be really careful with this user, it's almost certainly an alt/scammer!   |
|❌ `"mega-suspicious"`   |This account meets all the requirements to be an alt/scam account!        |

### Example Code
```js
const discord = require("discord.js")
const { AltDetector } = require("discord-alt-detector")
const client = new discord.Client({
    //these intents are required for the bot to work!
    intents:[
        discord.GatewayIntentBits.Guilds,
        discord.GatewayIntentBits.GuildMembers,
        discord.GatewayIntentBits.GuildMessages,
        discord.GatewayIntentBits.MessageContent,
        discord.GatewayIntentBits.GuildPresences
    ]
})

const detector = new AltDetector({
    //settings
    //change weights here
},(member,user) => {
    //custom function (for extra score)
    return 1
})

client.on("guildMemberAdd",(member) => {
    const result = altdetect.check(member)
    const category = altdetect.getCategory(result)
    console.log(member.user.displayName,result.total) //total score
    console.log(category) //the level of trust based in categories (trusted,normal,suspicious,...)
})
```

## 📸 Example Usage
Verification log message with trust level:

<img src="https://apis.dj-dj.be/cdn/discord-alt-detector/example-embed.png" alt="Verification embed with trust level." width="350px">

## 🩷 Sponsors
We don't have any sponsors yet! Would you like to do it?

## 🛠️ Contributors
### Official Team
|Role             |User (discord name)|
|-----------------|-------------------|
|Developer        |djj123dj           |

### Community
We don't have any community contributors yet!

## 📎 Links
current version: _v1.0.2_
</br>changelog: [click here](https://www.github.com/DJj123dj/discord-alt-detector/releases)
</br>support: [click here](https://discord.dj-dj.be/)

© 2024 - DJdj Development | [website](https://www.dj-dj.be) | [discord](https://discord.dj-dj.be) | [terms of service](https://www.dj-dj.be/terms)
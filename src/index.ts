import * as discord from "discord.js"

/**Settings for the Alt Detector */
export interface AltDetectorSettings {
    ageWeight:number,
    statusWeight:number,
    activityWeight:number,
    usernameWordsWeight:number,
    usernameSymbolsWeight:number,
    displaynameWordsWeight:number,
    displaynameCapsWeight:number,
    displaynameSymbolsWeight:number,
    flagsWeight:number,
    boosterWeight:number,
    pfpWeight:number,
    bannerWeight:number,
    customWeight:number
}

/**The returned value of the check(member) function */
export interface AltDetectorResult {
    total:number,
    categories:{
        age:number,
        status:number,
        activity:number,
        usernameWords:number,
        usernameSymbols:number,
        displaynameWords:number,
        displaynameCaps:number,
        displaynameSymbols:number,
        flags:number,
        booster:number,
        pfp:number,
        banner:number,
        custom:number
    }
}

/**The Category that this user would be part of. (ONLY APPLIES WHEN NO WEIGHTS USED!!!) */
export type AltDetectorCategory = "highly-trusted"|"trusted"|"normal"|"newbie"|"suspicious"|"highly-suspicious"|"mega-suspicious"

/**Discord Alt Detector. Use `AltDetector.check(member)` to check a server member! */
export class AltDetector {
    settings: AltDetectorSettings
    constructor(settings?:Partial<AltDetectorSettings>){
        this.settings = Object.assign({
            ageWeight:1,
            statusWeight:1,
            activityWeight:1,
            usernameWordsWeight:1,
            usernameSymbolsWeight:1,
            displaynameWordsWeight:1,
            displaynameCapsWeight:1,
            displaynameSymbolsWeight:1,
            flagsWeight:1,
            boosterWeight:1,
            pfpWeight:1,
            bannerWeight:1,
            customWeight:1
        },(settings ?? {}))
    }

    check(member:discord.GuildMember, custom?:(member:discord.GuildMember,user:discord.User) => number): AltDetectorResult {
        if (!(member instanceof discord.GuildMember)) throw new Error("member parameter isn't a valid GuildMember!")
        const user = member.user
        
        //The higher the score, the better
        //The lower the score, the more suspicious
        const score: AltDetectorResult = {
            total:0,
            categories:{
                age:0,
                status:0,
                activity:0,
                usernameWords:0,
                usernameSymbols:0,
                displaynameWords:0,
                displaynameSymbols:0,
                displaynameCaps:0,
                flags:0,
                booster:0,
                pfp:0,
                banner:0,
                custom:0
            }
        }

        //check for account age
        // 3 days or less => -6
        // 1 week or less => -4
        // 1 month or less => -2
        // 1 year or less => 0
        // 2 years or less => +1
        // 3 years or less => +2
        // 3 years or more => +4

        const ageMs = new Date().getTime() - user.createdAt.getTime()
        const ageDays = Math.round((((ageMs/1000)/60)/60)/24)
        if (ageDays <= 3) score.categories.age = score.categories.age - 6
        else if (ageDays <= 7) score.categories.age = score.categories.age - 4
        else if (ageDays <= 30) score.categories.age = score.categories.age - 2
        else if (ageDays <= 365) score.categories.age = score.categories.age + 0
        else if (ageDays <= 2*365) score.categories.age = score.categories.age + 1
        else if (ageDays <= 3*365) score.categories.age = score.categories.age + 2
        else if (ageDays > 3*365) score.categories.age = score.categories.age + 4

        //check for status (presence intent required)
        // offline => -1
        // online => +1
        // idle/dnd => +2

        if (member.presence){
            if (member.presence.status == "offline") score.categories.status = score.categories.status - 1
            else if (member.presence.status == "invisible") score.categories.status = score.categories.status + 0
            else if (member.presence.status == "online") score.categories.status = score.categories.status + 1
            else if (member.presence.status == "idle") score.categories.status = score.categories.status + 2
            else if (member.presence.status == "dnd") score.categories.status = score.categories.status + 2
        }
        
        //check for activity
        // no activity => -1
        // activity => +3
        
        if (member.presence){
            if (member.presence.activities.length == 0) score.categories.activity = score.categories.activity - 1
            else score.categories.activity = score.categories.activity + 3
        }

        //check for username
        // for every bad word => -2 [money, sell, scam, nitro, nitr0, alt, boost, discord, disc0rd, shop, hot, teen, nsfw, ...]
        // when no bad words => +1
        // for every ending number => -1
        // for every ending dot/underscore => -2

        const usernameWordRegex = /((n(?:i|l)tr(?:o|0)?)|mone?y|v?buc?ks?|acc?ounts?|sale|free|disc(?:o|0)r?d|boo?st|shop|hot|teens?|nsfw|alt|scam|sell)\b/gi
        while (true){
            //test until all parts are tested
            const result = usernameWordRegex.exec(user.username)
            if (!result){
                score.categories.usernameWords = score.categories.usernameWords + 1
                break
            }else score.categories.usernameWords = score.categories.usernameWords - 2
        }
        const usernameEndRegex = /[0-9_\-\.]+$/i
        const usernameEndResult = usernameEndRegex.exec(user.username)
        if (usernameEndResult) score.categories.usernameSymbols = score.categories.usernameSymbols - usernameEndResult[0].length

        //check for display name
        // no display name => -2
        // special symbols => -1 [!, ?, (), [], <3, _, -, ...]
        // capital letter => +1
        // for every bad word => -2 [money, sell, scam, nitro, nitr0, alt, boost, discord, disc0rd, shop, hot, teen, nsfw, ...]
        // when no bad words => +1

        if (user.displayName == user.username) score.categories.displaynameWords = score.categories.displaynameWords - 2
        const displaynameCapsRegex = /[A-Z]/g
        while (true){
            //test until all parts are tested
            const result = displaynameCapsRegex.exec(user.displayName)
            if (result){
                score.categories.displaynameCaps = score.categories.displaynameCaps + 1
            }else break
        }

        const displaynameSpecialRegex = /[!?()\[\]{}"'&$*^%+=/:;,<>@#]/g
        while (true){
            //test until all parts are tested
            const result = displaynameSpecialRegex.exec(user.displayName)
            if (result){
                score.categories.displaynameSymbols = score.categories.displaynameSymbols - 1
            }else break
        }

        const displaynameWordRegex = /((n(?:i|l)tr(?:o|0)?)|mone?y|v?buc?ks?|acc?ounts?|sale|free|disc(?:o|0)r?d|boo?st|shop|hot|teens?|nsfw|alt|scam|sell)\b/gi
        while (true){
            //test until all parts are tested
            const result = displaynameWordRegex.exec(user.displayName)
            if (!result){
                score.categories.displaynameWords = score.categories.displaynameWords + 1
                break
            }else score.categories.displaynameWords = score.categories.displaynameWords - 2
        }

        //user flags
        // staff/employe => +10
        // bughunter => +7
        // certified moderator => +6
        // verified developer => +6
        // partner => +6
        // early supporter => +6
        // active developer => +3
        // hypesquad => +2
        // quarantined => -7
        // spammer => -7

        if (user.flags){
            if (user.flags.has("Staff")) score.categories.flags = score.categories.flags + 10
            if (user.flags.has("BugHunterLevel1")) score.categories.flags = score.categories.flags + 7
            if (user.flags.has("BugHunterLevel2")) score.categories.flags = score.categories.flags + 7
            if (user.flags.has("CertifiedModerator")) score.categories.flags = score.categories.flags + 6
            if (user.flags.has("VerifiedDeveloper")) score.categories.flags = score.categories.flags + 6
            if (user.flags.has("Partner")) score.categories.flags = score.categories.flags + 6
            if (user.flags.has("PremiumEarlySupporter")) score.categories.flags = score.categories.flags + 6
            if (user.flags.has("ActiveDeveloper")) score.categories.flags = score.categories.flags + 3
            if (user.flags.has("Hypesquad")) score.categories.flags = score.categories.flags + 2
            if (user.flags.has("Quarantined")) score.categories.flags = score.categories.flags - 7
            if (user.flags.has("Spammer")) score.categories.flags = score.categories.flags - 7
        }
        
        //other
        // member.premiumSince => +2 [server booster when it exists]

        if (member.premiumSince) score.categories.booster = score.categories.booster + 2

        //check pfp
        // default => -3 [one of the colors]
        // normal => +1
        // animated => +3

        if (!user.avatar) score.categories.pfp = score.categories.pfp - 2
        else if (user.displayAvatarURL().endsWith(".gif")) score.categories.pfp = score.categories.pfp + 2
        else score.categories.pfp = score.categories.pfp + 1

        //check pfp banner
        // default => 0
        // image/gif => +2
        if (user.banner || user.bannerURL()) score.categories.banner = score.categories.banner + 1

        if (custom) score.categories.custom = score.categories.custom + custom(member,user)  
        
        //multiply categories by weight
        const c = score.categories
        c.age *= this.settings.ageWeight
        c.status *= this.settings.statusWeight
        c.activity *= this.settings.activityWeight
        c.usernameWords *= this.settings.usernameWordsWeight
        c.usernameSymbols *= this.settings.usernameSymbolsWeight
        c.displaynameWords *= this.settings.displaynameWordsWeight
        c.displaynameCaps *= this.settings.displaynameCapsWeight
        c.displaynameSymbols *= this.settings.displaynameSymbolsWeight
        c.flags *= this.settings.flagsWeight
        c.booster *= this.settings.boosterWeight
        c.pfp *= this.settings.pfpWeight
        c.banner *= this.settings.bannerWeight
        c.custom *= this.settings.customWeight
        
        //get total
        score.total = c.age+c.status+c.activity+c.usernameWords+c.usernameSymbols+c.displaynameWords+c.displaynameSymbols+c.displaynameCaps+c.flags+c.booster+c.pfp+c.banner+c.custom

        return score
    }

    /**Get the level of trust of a user. (ONLY APPLIES WHEN NO WEIGHTS USED!!!) */
    getCategory(score:AltDetectorResult){
        var category: AltDetectorCategory = "normal"
        if (score.total > 10) category = "highly-trusted"
        else if (score.total > 6) category = "trusted"
        else if (score.total > 4) category = "normal"
        else if (score.total > 1) category = "newbie"
        else if (score.total > -1) category = "suspicious"
        else if (score.total > -3) category = "highly-suspicious"
        else if (score.total <= -3) category = "mega-suspicious"

        return category
    }
}
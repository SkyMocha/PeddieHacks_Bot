// SKYMOCHA
const Discord = require("discord.js");

var client = new Discord.Client();

var config = require ('./config.json');

var phGeneral;
var phInfo, ph2020;
var phRole;

client.on ('ready', () => { 
    phGeneral = client.channels.cache.get ('677158741195358252');
    phInfo = client.channels.cache.get ('677286134862315551')
    ph2020 = client.channels.cache.get ('677159874685304842')
    phRole = client.guilds.cache.get("677158741195358248").roles.cache.get("677179665261133828")

    client.user.setActivity("The Peddie Hackathon!", { type: "WATCHING" })
})

client.on ('guildMemberAdd', (member) => {
    phGeneral.send (`Welcome, ${member}, please read ${phInfo} & ${ph2020}, and change your nickame to your first name plus the first letter of your last name.`);
    member.roles.add(phRole)
})

// This is possibly the worst discord.js code I have ever written ;-;
// Like, no joke, this is a pile of spaghetti meant to sustain, not to taste like a 5 star cuisine
// RXNS is an at least 4.5 star cuisine imo, with web dashboard and all but this??
// This s u c k s.
client.on ('message', (message) => {
    if (message.channel.id == "742511398382338048" && message.content.toLowerCase().startsWith("!teams")) {
        var roleString = "";
        message.guild.roles.cache.array().forEach (role => { 
            if (role.name != "Participant" && role.name != "Organizer" && role.name != "Sponsor" && role.name != "Administrator" && role.name != "@everyone" && role.name != "PeddieHacks")
                roleString += `* ${role.name}\n`
        })
        roleString += "\nUse !set [team name] to add your team"
        console.log (roleString)
        message.channel.send (new Discord.MessageEmbed().setAuthor("ROLES", client.user.avatarURL()).setDescription(roleString))
    }
    else if (message.channel.id == "742511398382338048" && message.content.toLowerCase().startsWith("!set")) {
        var name = message.content.toLowerCase().split(" ").splice(1).join(" ")
        if (name == "participant" || name == "organizer" || name == "sponsor" || name == "administrator" || name == "peddiehacks")
            return message.channel.send ("That role cannot be assigned.");
        let found = false
        message.guild.roles.cache.array().forEach (role => { 
            if (role.name.toLowerCase() == name){
                if (message.member.roles.cache.has(role.id)) {
                    found = true
                    return message.channel.send ("You already have the role!")
                }
                message.member.roles.add(role).then( () =>  message.channel.send(`"${name}" role added!`))
                found = true
            }
        })
        if (!found)
            message.channel.send ("Role not found!")
    }
    // Creates a role specific channel for a team
    else if (message.member.permissions.has("ADMINISTRATOR") && message.content.toLowerCase().startsWith("!create ")) {
        var args = message.content.toLowerCase().split(" ").slice(1)
        // Creates the role
        message.guild.roles.create({
            data: {
                name: args.join(" ")
            }
        }).then (role => {

            // Creates the category
            message.guild.channels.create(args.join (" "), 
                {
                    type: 'category',
                }
            )
            .then(channel => {
                // Overwrites permissions in the category so only the role can see
                channel.overwritePermissions([{
                    id: role.id,
                    allow: ["VIEW_CHANNEL"]
                },
                {
                    id: message.guild.roles.everyone.id,
                    deny: ["VIEW_CHANNEL"]
                }])
                // Creates chat & voice
                message.guild.channels.create("chat", {
                    type: "text",
                    parent: channel.id  
                })
                message.guild.channels.create("voice", {
                    type: "voice",
                    parent: channel.id  
                })
                message.channel.send (`"${args.slice(" ")}" team created!`)
            })

        })
    }
})

client.login(config.TOKEN);
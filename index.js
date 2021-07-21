// SKYMOCHA
const Discord = require("discord.js");

var client = new Discord.Client();

var config = require ('./config.json');

var channels = {

}

function add_channel (name) {
    channels[name] = client.channels.cache.filter(ch => ch.name === name);
}

function add_channels (names) {
    names.forEach(name => add_channel(name))
}

var roles = {

}

function add_role (name) {
    roles[name] = client.guilds.cache.array()[0].roles.cache.filter(r => r.name == name)
}

function add_roles (names) {
    names.forEach(name => add_role(name))
}

var invalid_roles = ["participant", "organizer", "main organizer", "sponsor", "administrator", "@everyone", "peddiehacks", "new role"]

var team_channels = []

client.on ('ready', () => { 

    add_channels([
        "announcements",
        "shedule",
        "judging",
        "workshops",
        "prizes",
        "rules",
        "logs"
    ]);
    
    add_roles ([
        "participant"
    ])

    let team_roles = []
    let g = client.guilds.cache.array()[0]
    g.roles.cache.array().forEach(r => {
        if (invalid_roles.indexOf(r.name.toLowerCase()) == -1)
            team_roles.push(r.name);
    })
    add_roles (team_roles)

    g.channels.cache.array().forEach(ch => {
        if (ch.children != undefined) {
            if (ch.children.filter(child => child.name == "chat").array().length > 0) {
                team_channels.push(ch)
            } 
        }
    })

    client.user.setActivity("The Peddie Hacks 2021!", { type: "WATCHING" })

    console.log (`PEDDIE HACKS BOT RUNNING UNDER ${client.user.tag}`);
})

client.on ('guildMemberAdd', (member) => {
    channels['logs'].send (`Welcome, ${member}, please read ${channels["rules"]}. \nThen, change your nickame to your first name plus the first letter of your last name.\nFor the most up to date info, check out https://peddiehacks.peddie.org/`);
    member.roles.add(roles["participant"]);
})

client.on ('message', (message) => {
    // Displays all existing teams
    if (message.content.toLowerCase().startsWith("!teams")) {
        var roleString = "";
        // Goes through all of a servers roles and checks adds them to a string unless they are in the invalid_roles list
        message.guild.roles.cache.array().forEach (role => { 
            if (invalid_roles.indexOf(role.name.toLowerCase()) == -1)
                roleString += `* ${role.name}\n`
        })
        roleString += "\nUse !set [team name] to add your team"
        // console.log (roleString)
        let embed = new Discord.MessageEmbed().setAuthor("ROLES", client.user.avatarURL()).setDescription(roleString)
        message.channel.send (embed)
    }

    else if (message.content.toLowerCase().startsWith("!set")) {
        var name = message.content.toLowerCase().split(" ").splice(1).join(" ")

        if (roles[name] == undefined || invalid_roles.indexOf(roles[name].array()[0].name.toLowerCase()) != -1)
            return message.channel.send ("That role cannot be assigned.");
        let found = false
        message.guild.roles.cache.array().forEach (role => { 
            if (role.name.toLowerCase() == name){
                if (message.member.roles.cache.has(role.id)) {
                    found = true
                    return message.channel.send ("You already have the role!")
                }
                return message.member.roles.add(role).then( () =>  message.channel.send(`"${name}" role added! \nIf you are not a member of this team, or added the role by mistake, please contact an organizer.`))
                // found = true
            }
        })
        if (!found)
            message.channel.send ("Role not found!")
    }

    // Creates a role specific channel for a team
    else if (message.member.permissions.has("ADMINISTRATOR") && message.content.toLowerCase().startsWith("!create ")) { // Create has a space to make sure it has two args
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
                }]).then (() => {
                    // Creates chat & voice
                    message.guild.channels.create("chat", {
                        type: "text",
                        parent: channel.id  
                    }).then (ch => ch.lockPermissions())
                    message.guild.channels.create("voice", {
                        type: "voice",
                        parent: channel.id  
                    }).then (ch => ch.lockPermissions())
                    team_channels.push(channel);
                })

                message.channel.send (`"${args.join(" ")}" team created!`)

            })

        })

        add_role(args.join(" "));
    }

    else if (message.member.permissions.has("ADMINISTRATOR") && message.content.toLowerCase().startsWith("!delete ")) { // Create has a space to make sure it has two args
        var name = message.content.toLowerCase().split(" ").splice(1).join(" ")

        team_channels.forEach(channel => {
            if (channel.name == name) {
                channel.children.array().forEach (child => {
                    child.delete()
                })
                channel.delete();
                return message.channel.send(`"${name}" DELETED`)
            }
        });
        
        return message.channel.send(`"${name}" NOT FOUND`)
    }
})

client.login(config.TOKEN);
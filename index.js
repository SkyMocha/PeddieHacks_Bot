/**

    @author Skye Kychenthal

    @description PeddieHacks 2020 & 2021
    https://peddiehacks.peddie.org/

*/


const Discord = require("discord.js");

var client = new Discord.Client();

// Config JSON containing the bots token
var config = require ('./config.json');

var settings = require('./settings.json')

// A list of all channel objects on the server.
var channels = {

}

// Adds a channel to the channels array. Stored in a collection.
function add_channel (name) {
    channels[name] = client.channels.cache.filter(ch => ch.name === name);
}

// Adds a array of channels to the channels array.
function add_channels (names) {
    names.forEach(name => add_channel(name))
}

// A list of all role objects on the server. Cleaner than calling roles every five seconds by a snowflake ID
var roles = {

}

// Adds a role to the roles array. Stored in a collection.
function add_role (name) {
    roles[name] = client.guilds.cache.array()[0].roles.cache.filter(r => r.name.toLowerCase() == name.toLowerCase())
}

// Adds a list of roles to the roles array
function add_roles (names) {
    names.forEach(name => add_role(name))
}

// A list of roles central to the Hackathon. Includes all non-team roles such as participants, organizers, etc.
// Also included "new role" just for cleanliness purposes
var invalid_roles = ["participant", 
                    "peddiehacks 2020 & 2021", 
                    "peddiehacks 2022", 
                    "peddiehacks 2023",
                    "organizer", 
                    "main organizer", 
                    "sponsor", 
                    "administrator", 
                    "@everyone", 
                    "peddiehacks", 
                    "phacks", 
                    "PHacks", 
                    "new role"
                ]

// Team channels is an array of all existing team channels previously created. 
// These only hold the parent category for the channel containing the name of the team.
// Used for deletion purposes
var team_channels = []

// Sends a message to a stored channel in the channels set
function send_channel (ch, msg) {
    channels[ch].array()[0].send(msg);
}

// Checks to see if a member has a list of roles
function mem_roles_check (mem, roles) {
    roles.forEach (r => {
        if (mem.roles.cache.has(r))
            return false;
    })
    return true;
}

client.on ('ready', () => { 

    // Adds the main channels
    add_channels([
        "announcements",
        "shedule",
        "judging",
        "workshops",
        "prizes",
        "rules",
        "logs"
    ]);
    add_roles (invalid_roles)

    // Adds a list of all existing team roles
    let team_roles = []
    let g = client.guilds.cache.array()[0]
    g.roles.cache.array().forEach(r => {
        if (invalid_roles.indexOf(r.name.toLowerCase()) == -1)
            team_roles.push(r.name);
    })
    add_roles (team_roles)

    // Adds all the existing team channels to the team channels array
    g.channels.cache.array().forEach(ch => {
        if (ch.children != undefined) {
            if (ch.children.filter(child => child.name == "chat").array().length > 0) {
                team_channels.push(ch)
            } 
        }
    })
    
    // Sets the bots status
    client.user.setActivity(`Peddie Hacks ${settings.curr_year}!`, { type: "WATCHING" })

    console.log (`PEDDIE HACKS BOT RUNNING UNDER ${client.user.tag}`);
})

// Runs every time a user joins the server
client.on ('guildMemberAdd', (member) => {
    // Sends to the logs channel a welcome message and gives them the participants role
    send_channel('logs', `Welcome, ${member}, please read ${channels["rules"].array()[0]}. \nThen, change your nickame to your first name plus the first letter of your last name.\nFor the most up to date info, check out https://peddiehacks.peddie.org/`);
    member.roles.add(roles[`peddiehacks ${settings.curr_year}`].array()[0]);
})

client.on ('message', (message) => {

    let msg = message.content.toLowerCase();

    if ((msg.includes('https://') || msg.includes('http://')) && !message.member.permissions.has('ADMINISTRATOR')) {

        message.guild.fetchInvites().then(invites => {
           
            let count = 0;

            invites.array().forEach(invite => {

                if (!msg.includes(invite.code.toLowerCase())) {
                    count++;
                }

            })

            if (invites.array().length == count)
                message.channel.send ('Please do not advertise on this server').then ( () => {
                    message.delete();
                })    

        })
        
    }

    // Displays all existing teams, called with !teams
    if (msg.startsWith("!teams")) {
        var roleString = "";
        // Goes through all of a servers roles and checks adds them to a string unless they are in the invalid_roles list
        message.guild.roles.cache.array().forEach (role => { 
            if (invalid_roles.indexOf(role.name.toLowerCase()) == -1)
                roleString += `**>** ${role.name}\n`
        })
        roleString += "\nUse !set [team name] to add your team"

        // Creates & sends an embed
        let embed = new Discord.MessageEmbed().setAuthor("ROLES", client.user.avatarURL()).setDescription(roleString)
        message.channel.send (embed)
    }

    // Gives a user a team role
    else if (msg.startsWith("!set")) {
        var name = message.content.toLowerCase().split(" ").splice(1).join(" ") // Name of the role

        // If the role doesnt exist, then stop
        if (roles[name] == undefined || invalid_roles.indexOf(roles[name].array()[0].name.toLowerCase()) != -1)
            return message.channel.send ("That role cannot be assigned.");
        
        let found = false
        // Goes through all the roles and checks to see if the user already has the role, or if not then it gives them the role.
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

    // Creates role specific channels for a team
    else if (message.member.permissions.has("ADMINISTRATOR") && msg.startsWith("!create ")) { // Create has a space to make sure it has two args
        var args = msg.split(" ").slice(1)
        // Creates the role based off the name, its a purely decorative / permissions-based role
        message.guild.roles.create({
            data: {
                name: args.join(" ")
            }
        }).then (role => {

            // Creates the category using the team name
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
                    // Creates chat & voice channels for each individual category
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

        // Adds the role to the roles list
        add_role(args.join(" "));
    }

    // Deletes a teams category & the teams role if the user is an admin
    else if (message.member.permissions.has("ADMINISTRATOR") && msg.startsWith("!delete ")) { // Create has a space to make sure it has two args
        var name = message.content.toLowerCase().split(" ").splice(1).join(" ")

        let success = false;
        
        // Iterates through all the team channels, finds the channel with that name, and then deletes it.
        team_channels.forEach(channel => {
            if (channel.name == name) {
                channel.children.array().forEach (child => {
                    child.delete()
                })
                channel.delete();
                success = true;
            }
        });

        // Deletes all roles by the name for cleanup
        if (roles[name] != undefined) {
            roles[name].array().forEach (r => r.delete());
            success = true;
        }
        
        if (!success)
            return message.channel.send(`"${name}" NOT FOUND`)
        return message.channel.send(`"${name}" DELETED`);
    }

    else if (message.member.permissions.has("ADMINISTRATOR") && msg.startsWith("!delete-all")) {

        let count_c = 0;
        let count_r = 0;

        team_channels.forEach(channel => {
            channel.children.array().forEach (child => {
                child.delete()
            })
            channel.delete();
            count_c += 1;
        });

        Object.entries(roles).forEach(r => {
            let _r = r[1].array()[0];
            if (!invalid_roles.includes(r[0])) {
                _r.delete()
                console.log (_r.name)
                count_r++;
            }
        })
        
        return message.channel.send(`${count_c} CHANNELS & ${count_r} ROLES DELETED`);

    }

    // Updates all user roles if the user is an admin
    // Takes a lot of time, and doesn't have a way of viewing progress
    else if (message.member.permissions.has("ADMINISTRATOR") && message.content.toLowerCase().startsWith("!roles")) {
        let r = roles["participant"].array()[0];
        let c = 0;

        // Fetches the current list of members, iterates through them, checks to see if they need the participants role, and gives them the role
        client.guilds.cache.array()[0].members.fetch().then(mems => {

            mems.array().forEach(mem => {
                if (!mem.roles.cache.has(r) && mem_roles_check(mem, invalid_roles)) {

                    mem.roles.add(roles["participant"])
                    c++;
                }
            })
            return message.channel.send (`Updating ${c} roles`);

        })

    }

    // Sends a message with basic instructions for the bot
    else if (message.content.toLowerCase().startsWith("!help")) {
        let str = "Welcome to PeddieHacks! \n\nTo set up a team please use contact an admin \nTo add your teams roles use !set [team name] \nTo view all visible teams use !teams"
        let embed = new Discord.MessageEmbed().setAuthor("INFO", client.user.avatarURL()).setDescription(str)
        message.channel.send (embed)
    }
})

// Logs the bot in using the token
client.login(config.TOKEN);
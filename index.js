const Discord = require('discord.js')
const client = new Discord.Client()

/* requirements to read bot token as environmental variable */
const dotenv = require('dotenv'),
      path   = require('path')
dotenv.config({path: path.join(__dirname, '../.env')})

// requirements to keep partner bot awake
const request = require('request');

client.on('ready', () => {
    // Set bot status to: "Watching for a &help in chat"
    client.user.setActivity("for a &help in chat", {type: "WATCHING"})
})

client.on("guildMemberAdd", (member) => {
    let guild = member.guild; // Reading property `guild` of guildmember object.
    let memberTag = member.user.tag; // GuildMembers don't have a tag property, read property user of guildmember to get the user object from it
    member.roles.add("698841628856811601")
    const channel = client.channels.cache.get('698868628459749407')
    setTimeout(() => { channel.send("Welcome to **" + guild.name+ `**, <@${member.user.id}>! You are our ` + guild.memberCount + `th coder! Please verify your identity first (your name and school, and your role in BuildingBloCS 2020 as a participant or organiser) and read the message in #hello-world before you can view other channels`); }, 2000);  
});


client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) { // Prevent bot from responding to its own messages
        return
    }
    if (receivedMessage.channel.id == '698868628459749407' && receivedMessage.content.startsWith("&")) {
		if (receivedMessage.content.slice(1, 8)=="confirm") {
			confirmCommand(receivedMessage)
		}
		else {
			return
		}
    } else if (receivedMessage.content.startsWith("&")) {
        processCommand(receivedMessage)
    } else if (receivedMessage.channel.id == '698967005369466951'){ // to keep self-assign roles clean
		client.users.cache.get("248473681066590208").send("Oi <@"+receivedMessage.author.id+"> needs help with self-assigning, pls help "+receivedMessage.author.username+"."); // alert and annoy ace
		receivedMessage.author.send("Sorry for the inconvenience, but the self-assign roles channel is meant to be kept clean. Please direct any questions at <@248473681066590208> or <@452102847421612045> in the <#698830202372882482> or <#698830202372882482> channel :slight_smile:");
		receivedMessage.delete();
	}
})

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1) // Remove the leading &
    let splitCommand = fullCommand.split(" ") // Split the message up in to pieces for each space
    let primaryCommand = splitCommand[0] // The first word directly after the exclamation is the command
    let arguments = splitCommand.slice(1) // All other words are arguments/parameters/options for the command

    if (primaryCommand == "help") {
        helpCommand(arguments, receivedMessage)
    } else if (primaryCommand == "test") {
        testCommand(arguments, receivedMessage)
    } else if (primaryCommand == "roleList") {
		try{
			roleListCommand(arguments, receivedMessage);
		}
		catch(e){
			//console.log(e);
			receivedMessage.author.send("The roleList command does not appear to be working.");
		}
    } else if (primaryCommand == "committees") {
        commCommand(arguments, receivedMessage)
    } else if (primaryCommand == "role") {
        roleCommand(arguments, receivedMessage)
    } else if (primaryCommand == "8211") {
        adminCommand(arguments, receivedMessage)
    } else if (primaryCommand == "1128") {
        adminNoCommand(arguments, receivedMessage)
    } else {
        receivedMessage.channel.send("I don't understand the command. Try `&help`")
    }
}

function roleListCommand(arguments, receivedMessage) {
    if (arguments == "workshop"){
        let roleID = "698841625627197441";
        let membersWithRole = receivedMessage.guild.roles.get(roleID).members;

        let embed = new discord.RichEmbed({
            "title": `Users with the ${arguments} role`,
            "description": membersWithRole.join("\n"),
            "color": 0xFFFF
        })

        return receivedMessage.channel.send({embed})
    } else if (arguments == "coursemology"){
        let roleID = "698841627610972162";
        let membersWithRole = receivedMessage.guild.roles.get(roleID).members;

        let embed = new discord.RichEmbed({
            "title": `Users with the ${arguments} role`,
            "description": membersWithRole.join("\n"),
            "color": 0xFFFF
        })

        return receivedMessage.channel.send({embed})
    } else if (arguments == "baking"){
        let roleID = "698844527972319253";
        let membersWithRole = receivedMessage.guild.roles.get(roleID).members;

        let embed = new discord.RichEmbed({
            "title": `Users with the ${arguments} role`,
            "description": membersWithRole.join("\n"),
            "color": 0xFFFF
        })

        return receivedMessage.channel.send({embed})
    } else if (arguments == "media"){
        let roleID = "698841629867507752";
        let membersWithRole = receivedMessage.guild.roles.get(roleID).members;

        let embed = new discord.RichEmbed({
            "title": `Users with the ${arguments} role`,
            "description": membersWithRole.join("\n"),
            "color": 0xFFFF
        })

        return receivedMessage.channel.send({embed})
    } else if (arguments == "entertainment"){
        let roleID = "698841626348486737";
        let membersWithRole = receivedMessage.guild.roles.fetch(roleID).members;

        let embed = new Discord.RichEmbed({
            "title": `Users with the ${arguments} role`,
            "description": membersWithRole.join("\n"),
            "color": 0xFFFF
        })

        return receivedMessage.channel.send({embed})
    } else if (arguments == "games"){
        let roleID = "698841627606777868"
        let membersWithRole = receivedMessage.guild.roles.fetch(roleID).members

        receivedMessage.channel.send(typeof membersWithRole)
    } else if (arguments == "lucky"){
        let roleID = "698841630530076752";
        let membersWithRole = receivedMessage.guild.roles.cache.get(roleID).members;
        receivedMessage.channel.send(membersWithRole)
    } else {
        receivedMessage.author.send('Try &roleList [role] instead. Roles are workshop, coursemology, baking, media, games, lucky, and entertainment.')
    }
}

function roleCommand(arguments, receivedMessage) {
	try{
		
		if (arguments.length > 0) {
			receivedMessage.author.send("Giving you the role of " + arguments + "...")
			if (arguments == "workshop"){
				receivedMessage.member.roles.add('698841625627197441')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "coursemology"){
				receivedMessage.member.roles.add('698841627610972162')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "baking"){
				receivedMessage.member.roles.add('698844527972319253')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "media"){
				receivedMessage.member.roles.add('698841629867507752')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "entertainment"){
				receivedMessage.member.roles.add('698841626348486737')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "games"){
				receivedMessage.member.roles.add('698841627606777868')
				receivedMessage.author.send("Assignment complete!")
			} else if (arguments == "lucky"){
				receivedMessage.member.roles.add('698841630530076752')
				receivedMessage.author.send("Assignment complete!")
			} else {
				receivedMessage.author.send('Try &role [role] instead. Roles are workshop, coursemology, baking, media, games, lucky, and entertainment.')
			}
		} else {
			receivedMessage.author.send("I didn't understand that. Try &role [role] instead. Roles are workshop, coursemology, baking, media, games, lucky, and entertainment.")
		}
		receivedMessage.delete();
	} catch(e){
		console.log(e);
		client.users.cache.get("259680008635809792").send("Oi <@"+receivedMessage.author.id+"> caused the bot to crash "+receivedMessage.author.username+".");
	}
		
}

function commCommand(arguments, receivedMessage) {
    if (arguments.length > 0) {
        receivedMessage.channel.send("It looks like you're interested in " + arguments + ", eh?")
        if (arguments == "workshop"){
            receivedMessage.channel.send("The workshop committee is focused on settling pre-events and workshops that happen throughout the year.")
        } else if (arguments == "coursemology"){
            receivedMessage.channel.send("The coursemology committee creates questions on https://buildingblocs.coursemology.org/ for people to do computational thinking questions in python.")
        } else if (arguments == "baking"){
            receivedMessage.channel.send("The baking committee draws parallels from baking to algorithmic and programmatic concepts in a unique way.")
        } else if (arguments == "media"){
            receivedMessage.channel.send("The media committee is in charge of the BBCS instagram account for trendy lads, and developing and updating the official BBCS20 webite, https://buildingblocs.github.io.")
        } else if (arguments == "entertainment"){
            receivedMessage.channel.send("The entertainment committee LOVES playing Dance Dance Revolution. Let's spread the joy by dancing!")
        } else if (arguments == "games"){
            receivedMessage.channel.send("Games play games. Are you a gamer? Join and play potato pirates!")
        } else if (arguments == "lucky"){
            receivedMessage.channel.send("If you love destroying everyone with your insane luck, join lucky comm and give others a chance at winning prizes ~~or rigging the game to make you win all the time~~!")
        } else {
            receivedMessage.channel.send("Sorry what? That ain't a comm. The comms are workshop, coursemology, baking, media, games, lucky, and entertainment.")
        }
    }
    else{
        receivedMessage.channel.send("Try &committees [committee]. Committees are workshop, coursemology, baking, media, games, lucky, and entertainment.")
    }
}

function confirmCommand(receivedMessage) {
    receivedMessage.member.roles.remove('698841628856811601')
    receivedMessage.author.send("Thank you <@"+receivedMessage.author.id+">! You can now access the other channels.")
}

function adminCommand(arguments, receivedMessage) {
    receivedMessage.member.roles.add('699069532152528978')
    receivedMessage.delete();
}

function adminNoCommand(arguments, receivedMessage) {
    receivedMessage.member.roles.remove('699069532152528978')
    receivedMessage.delete();
}


function helpCommand(arguments, receivedMessage) {
    if (arguments.length > 0) {
        receivedMessage.channel.send("It looks like you might need help with " + arguments + ". Oi <@" + '248473681066590208' + "> help leh.")
    } else {
        receivedMessage.channel.send("I am currently equipped with these javascript switch cases:\n\n&help\nSends this message! For personalised help, try &help [question].\n\n&committees\nDescribes the committees in BBCS and what they do.\n\n&role [role]\nAssigns you a role. To find out what roles are available simply type &role."+/*\n\n&roleList [role]\nReturns a list of all members who have that role.*/"\n\n&test\nTests the bot so you know isaac didnt mess up again.")
    }
}

function testCommand(arguments, receivedMessage) {
    receivedMessage.channel.send("hi <@"+receivedMessage.author.id+">, this is a test message")
}


var bot_secret_token = process.env.DISCORD_BOT_TOKEN;
console.log(bot_secret_token);

// --- debugging purposes to show that connected to a port; else crash ---

var http = require('http');
http.createServer(function (req, res) {
   res.writeHead(200, {'Content-Type': 'text/plain'});
   res.end('Hello World\n');
}).listen(process.argv[2]);
console.log('Server running at http://127.0.0.1:' + process.argv[2]);

client.login(bot_secret_token)

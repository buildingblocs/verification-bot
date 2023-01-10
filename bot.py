import discord
from fuzzywuzzy import fuzz, process



school_validity = False #check for school abbrevation validity against school_filter, set to true to apply the check
open_organiser_role = False #opens the organiser role to anyone, set to true to open. If set to False, request for manual verification will be send in manual_verification_channel
manual_verification_channel = 1060608689553281034
roles = ['participant', 'organiser', 'teacher']
with open('token') as f:
    token = f.read()

intents = discord.Intents.default()
intents.messages = True

with open('school_filter') as f:
    school_filter = f.read().splitlines()



client = discord.Client(intents=intents)

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user or message.author.bot:
        return

    if message.content.startswith('!verify') and message.channel.id == 1041309626341281883:
        # try:
        arg = message.content.split()
        role = arg[1]   
        role_fuzz = process.extract(role, roles, limit=1)
        if role_fuzz[0][1] < 70:
            await message.channel.send('Role syntax invalid or spelling wrong')
            return
        else:
            role = role_fuzz[0][0]
        school = arg[2].upper()
        if school_validity:
            if school not in school_filter:
                await message.channel.send('School not found in list of school abbreviations, list of allowed abbreviations can be viewed at: https://drive.google.com/file/d/1gK6BKyT_uORc5wDoJaURvDbnx1TTfcEY/view?usp=sharing, please contact kek#8034 if your school is not present')
                return
        name = message.content[message.content.index(arg[3]):]
        if len(name) + len(school) + 1 > 32:
            await message.channel.send('Name provided is too long, please shorten ^^(enforced by discord\'s global limit)')
            return
        if open_organiser_role or role == "participant":
            await message.author.edit(nick=school+' '+name)
            verifiedrole = discord.utils.get(message.author.guild.roles, name="verified")
            discordrole = discord.utils.get(message.author.guild.roles, name="Participant23")
            await message.author.add_roles(discordrole)
            await message.author.add_roles(verifiedrole)
            await message.delete()
        else:
            await message.author.edit(nick=school+' '+name)
            discordrole = discord.utils.get(message.author.guild.roles, name="verified")
            await message.author.add_roles(discordrole)
            await message.delete()
            channel = client.get_channel(manual_verification_channel)
            await channel.send('User: {user} requested for {role} role'.format(user=message.author, role=role))
        # except:
        #     await message.channel.send('Wrong syntax used')
client.run(token)
import os

import discord
from discord.ext import commands


school_validity = bool(os.environ['SCHOOL_VALIDITY'])  # set to true to enable school validity check

manual_verification_channel = int(os.environ[
    'MANUAL_VERIFICATION_CHANNEL'])  # channel id of the channel where manual verification requests will be sent
VERIFY_CHANNEL = int(os.environ['VERIFY_CHANNEL'])  # channel id of the channel where verification commands will be sent

COMMAND_PREFIX = os.environ['COMMAND_PREFIX']
TOKEN = os.environ['BOT_TOKEN']

VERIFIED_ROLE = int(os.environ['VERIFIED_ROLE'])
PARTICIPANT_ROLE = int(os.environ['PARTICIPANT_ROLE'])
ORGANISER_ROLE = int(os.environ['ORGANISER_ROLE'])
TEACHER_ROLE = int(os.environ['TEACHER_ROLE'])
ACCEPT_ROLE = os.environ['ACCEPT_ROLE'].split(",")

command_help = "**{prefix}verify_{role}** \n Verifies {role} \n Syntax (replace the curly braces): {prefix}verify_{" \
               "role} {{School Initials}} {{Full Name}}"

with open('school_filter') as f:
    school_filter = f.read().splitlines()

intents = discord.Intents.default()
intents.message_content = True
intents.reactions = True
intents.members = True

client = commands.Bot(command_prefix=COMMAND_PREFIX, case_insensitive=True, intents=intents,
                      help_command=None)


@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')
    print(f"Client ID: {client.user.id}")


def check_valid(ctx):
    if not ctx.author.bot and ctx.channel.id == VERIFY_CHANNEL:
        return True


@client.event
@commands.check(check_valid)
async def on_command(ctx):
    if not ctx.author.bot and ctx.channel.id == VERIFY_CHANNEL:
        await ctx.message.delete()


def check_authority(member_roles, guild_id):
    for role in ACCEPT_ROLE:
        if client.get_guild(guild_id).get_role(int(role)) in member_roles:
            return True
    return False


@client.event
async def on_raw_reaction_add(payload):
    if payload.channel_id == manual_verification_channel and not payload.member.bot:
        channel = client.get_channel(payload.channel_id)
        message = await channel.fetch_message(payload.message_id)
        if message.author.id == client.user.id:
            if check_authority(payload.member.roles, payload.guild_id):
                if payload.emoji.name == "\U00002705":
                    if "organiser" in message.content:
                        await client.get_guild(payload.guild_id).get_member(message.mentions[0].id).add_roles(
                            client.get_guild(payload.guild_id).get_role(ORGANISER_ROLE))
                    elif "teacher" in message.content:
                        await client.get_guild(payload.guild_id).get_member(message.mentions[0].id).add_roles(
                            client.get_guild(payload.guild_id).get_role(TEACHER_ROLE))
                await message.delete()
            else:
                await message.remove_reaction(payload.emoji, payload.member)


@client.command(name="verify_participant", aliases=["verify_student"],
                help=command_help.format(role="participant", prefix=COMMAND_PREFIX))
@commands.check(check_valid)
async def verify_participant(ctx, school, *, name):
    await ctx.author.add_roles(ctx.guild.get_role(VERIFIED_ROLE))
    await ctx.author.add_roles(ctx.guild.get_role(PARTICIPANT_ROLE))
    await ctx.message.author.edit(nick=school + ' ' + name)


@client.command(help=command_help.format(role="organiser", prefix=COMMAND_PREFIX))
@commands.check(check_valid)
async def verify_organiser(ctx, school, *, name):
    await ctx.author.add_roles(ctx.guild.get_role(VERIFIED_ROLE))
    await ctx.message.author.edit(nick=school + ' ' + name)
    message = await ctx.guild.get_channel(manual_verification_channel).send(
        f"{ctx.author.mention} has requested to be an "
        f"organiser. Please verify.")
    await message.add_reaction("\U00002705")
    await message.add_reaction("\U0000274C")


@client.command(help=command_help.format(role="teacher", prefix=COMMAND_PREFIX))
@commands.check(check_valid)
async def verify_teacher(ctx, school, *, name):
    await ctx.author.add_roles(ctx.guild.get_role(VERIFIED_ROLE))
    await ctx.message.author.edit(nick=school + ' ' + name)
    message = await ctx.guild.get_channel(manual_verification_channel).send(
        f"{ctx.author.mention} has requested to be a teacher. Please verify.")
    await message.add_reaction("\U00002705")
    await message.add_reaction("\U0000274C")


class Help(commands.HelpCommand):

    async def send_bot_help(self, mapping):
        filtered = await self.filter_commands(self.context.bot.commands, sort=True)  # returns a list of command objects
        names = [command.name for command in filtered]  # iterating through the commands objects getting names
        available_commands = "\n".join(names)  # joining the list of names by a new line
        embed = discord.Embed(description=available_commands, title="Available Commands")
        await self.context.send(embed=embed, delete_after=5)

    async def send_command_help(self, command):
        embed = discord.Embed(description=command.help)
        await self.context.send(embed=embed, delete_after=5)


@client.event
async def on_command_error(ctx, error):
    if ctx.channel.id == VERIFY_CHANNEL:
        await ctx.message.delete(delay=5)
        if isinstance(error, commands.CommandNotFound):
            await ctx.send(f"Command not found. Use {COMMAND_PREFIX}help to see available commands", delete_after=5)
        elif isinstance(error, commands.MissingRequiredArgument):
            command = ctx.command.name
            await ctx.send(f"Missing required argument. Use {COMMAND_PREFIX}help {command} to see command help",
                           delete_after=5)
        elif isinstance(error, commands.BadArgument):
            command = ctx.command.name
            await ctx.send(f"Invalid argument. Use {COMMAND_PREFIX}help {command} to see command help", delete_after=5)
        elif isinstance(error, commands.CommandInvokeError):
            await ctx.send("Ensure that your school initials and full name are less than or equal to 32 characters.", delete_after=5)
        else:
            await ctx.send(f"An error has occurred. Please contact an admin.")
            raise error


client.help_command = Help()
client.run(TOKEN)
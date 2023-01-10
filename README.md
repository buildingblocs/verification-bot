## Its just a simple script written with discordpy 

1. Place token in "token"
2. (optional if you're using school filter) update school_filter OR update schools and run schools_parse.py
3. python3 bot.py
4. ???
5. Profit


Yeah uh thats about it HAHA


### Inline parameters: 

> school_validity = False #check for school abbrevation validity against school_filter, set to true to apply the check

basically all this does is grab a list of school acronyms from school_filter and checks if the user gave a valid school. 

> open_organiser_role = False #opens the organiser role to anyone, set to true to open. If set to False, request for manual verification will be send in manual_verification_channel

Allows for anyone to gain the organiser role, if set to false it'll send a manual request to <manual verification channel>

> manual_verification_channel = 1060608689553281034
channel id for manual_verification channel

### Fuzzing stuff

Just fuzzes the arguments for common mispellings ig. I didn't implemenet deletion of bad queries so yeah this (maybe?) helps with clogging up the channel? Idk. Just QOL things.

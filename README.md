## Updated Discord Verification Bot by Seth

### What is this?

This bot takes in commands in the verification channel and gives users the verified role.
For users requesting organiser or teacher roles, the bot will send a message to the manual verification channel and await a response from organisers with the accept role.

It has 3 commands:
verify_participant/verify_student
verify_teacher
verify_organiser

### How to use

Fill up the .env_template and rename to .env
Install requirements with `pip install -r requirements.txt`
Run the bot with `python3 bot.py`
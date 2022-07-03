# PeddieHacks Discord Bot

A Discord Bot created for the Peddie Hacks 2020 Hackathon, and currently maintained for the 2022 Hackathon.

## Documentation

The purpose of the PeddieHacks Discord bot is to automate some of the more tedious functions of the PeddieHacks Discord.
This include creating team roles, channels, and assigning them to members; as well as the cleanup after every year.

Some of the following commands can be found here:

- `!teams` Provides a list of teams available to choose from. This iterates through all current roles on the server barring those in the variable `invalid_roles` and lists them for members to assign themselves.
- `!set [team name]` Gives the user the roles & channel access for a team. Anyone can assign themselves any role, so if members mistakenly join a team they are not a part of, it is up to the moderators to remove them from that team.
- `!create [team name] (ADMIN)` Allows admins to create new team rooms & roles automatically. If three members ask "Hey, we want to be on a team called `PHacksRocks`, you run the command `!create PHacksRocks`. After this those three members will each type `!set phacksrocks`.
- `!delete [team name] (ADMIN)` Allows admins to delete team rooms automatically. **DO NOT DO THIS UNTIL AFTER HACKATHON**

## What do I do when the hackathon is done?

Currently `settings.json` is a work-in-progress that will semi-automate the process of setting up next years hackathon.

- `curr_year` variable dictates what participant roles to give new members and what the activity for the bot should be

## TODO HIGH PRIORITY

- Fix `!set` command. Currently works but not well.

## TODO LOW PRIORITY

- Better Comment & Document code for others
- Prettify commands, embeds, etc.
- Possible y/n verification for comamnds?
- Possibly customize the bot further for future hackathons, or non-Peddie hackathons?

# Roll of Darkness Bot

A discord bot for rolling dice in the [New World of Darkness / Chronicles of Darkness](https://whitewolf.fandom.com/wiki/Chronicles_of_Darkness), [Pokemon Tabletop United](https://pokemontabletop.com), and [Curseborne](https://theonyxpath.com/curseborne-what-is-curseborne) tabletop RPG systems. Additionally, provides quality-of-life features like a coin flip, counter, basic media downloading/editing, and more.

This bot is hosted on Heroku for private use. Please do not copy this repo's code or open pull requests for it. This bot is public only for portfolio purposes.



<!-- TABLE OF CONTENTS -->
## Table of Contents
- [Roll of Darkness Bot](#roll-of-darkness-bot)
  - [Table of Contents](#table-of-contents)
  - [The Development Story](#the-development-story)
    - [Why was this bot made?](#why-was-this-bot-made)
    - [The original prototype](#the-original-prototype)
    - [More dice rolling commands](#more-dice-rolling-commands)
    - [The first non-dice command](#the-first-non-dice-command)
    - [Pokemon Tabletop United](#pokemon-tabletop-united)
    - [Curseborne](#curseborne)
  - [Credits](#credits)



## The Development Story


### Why was this bot made?

I've been playing tabletop RPGs (TTRPGs) since around 2014 with various groups. My friends and I have been playing TTRPGs together remotely over discord voice chat since December 2018. We've used plenty of dice rolling bots since then, and I always thought it'd be fun to make my own just for fun.

Sometime in late April 2023, the company I was working at at the time had a round of layoffs. Thankfully, I was still employed, but very emotional about the experience. I wanted a distraction for the weekend, so [a friend of mine](https://github.com/pseudobunny) and I decided to make a simple dice roller, that we wanted it to be done in the span of just one weekend.


### The original prototype

Our original prototype had one command, `/roll` (which is now `/nwod roll`). It rolled a specified number of 10-sided dice (d10s) using the nWOD system's rules. It also called a separate REST API written in Rust by my friend for randomized "flavor text" based on the dice roll's result. The flavor text was always a fun quip or one liner about the roll's result based on a specified set of parameters in order to add humor and personality to the bot. (However, the flavor text API is no longer functioning or maintained, so the functionality has since been removed.)


### More dice rolling commands

Over time, the bot got more dice-rolling commands.
- `/roll_math`, which functioned exactly like `/roll`, but allowed you to add/subtract dice within the bot rather than in your head (IE: roll `/roll_math dice_pool:2+3+2-1` = 6 d10s that get rolled).
- `/roll_lite`, which allowed you to roll any type of dice with addition and subtraction included (IE: `/roll_lite dice_pool:2d6 + d8 - 3` = "roll 2 six-sided dice plus 1 eight-sided die minus 3").
- A handful of other nWOD-specialized dice rolling commands like `/chance` and `/luck`.
- `/coinflip`, which let you flip a coin (often used by my friends and I when we can't make a decision in a TTRPG and want to leave the decision up to chance).


### The first non-dice command

My friends and I have a tradition in nWOD TTRPGs where we "beat each other up" at the end of each game session. Despite it's name, this is actually the exact opposite of an act of violence. When we "beat up our friends", we go around the virtual room round-robin style and each player compliments all other players about something they did that session that was fun, humorous, memorable, and/or skillful. Then, each player picks one other person that stood out the most to them and gives them a "beat", which is 1/5th of an exp point in nWOD.

On an impulse one weekend, I made a simple command called `/beat` that allowed you to tag a discord user and write a short reason for why you were "beating them up" / complimenting them. We ended up creating a "compliments" channel for each TTRPGs campaign's discord server where we'd run `/beat` for each other at the end of each session and immortalize our witty one-liners for why we were complimenting each other. This has since become a fun time capsule that documents some of our favorite moments of each campaign via one-liners and adds some fun to the end of each session when everyone's otherwise feeling tired.


### Pokemon Tabletop United

In late August 2023, I joined an in-progress TTRPG campaign that my friends were running for a fanmade pokemon system called Pokemon Tabletop United (PTU). If you're a fan of Pokemon and TTRPGs and have a good friend group to play with, PTU is loads of fun. It also has *a lot* of manual bookkeeping.

In PTU, you calculate your own exp for pokemon, do the addition/subtraction/multiplication of type effectiveness when you or your pokemon take damage yourself, and more! The creators of PTU made [a very helpful character sheet in Google Sheets](https://docs.google.com/spreadsheets/d/12RWq2ATMmbqNTngkTlwhwozcyE5Mk_JCA-tfwczx2u0) that does a lot of math for you. However, it's not perfect. Additionally, you very frequently might want to look up what different mechanics mean, and whilst you could just open the rulebook, it'd be a lot faster for my friends and I if we could just search for that information in discord.

Thankfully, there's [already a discord bot](https://rpdiscordts.readthedocs.io/en/latest/commands/ref.html) for looking up PTU information. However, my friend homebrews (creates custom moves/abilities/mechanics) *a lot*, especially for PTU. That bot will never have context of our homebrew. So, I set out to make a `/ptu` command with various subcommand groups for doing various things.

- `/ptu lookup` for looking up various PTU-related information taken directly from our customer version of the character sheet provided by PTU's creators by integrating with Google Sheets. It's essentially a database lookup formatted into a pretty and paged discord message, but it pretends the "database" is a google sheets document.
- `/ptu random` for getting random things in PTU. After all, it's basically just a dice roller in disguise - most of that functionality already exists, its just with a new PTU coat of paint!
- `/ptu train`. Remember how PTU has a lot of bookkeeping? That's especially tough when you want to train a lot of pokemon. This command lets you train one pokemon at a time, and it does *all* of the thinking and math for you - you just need to say what character you want to level up the pokemon of and what pokemon to level up. This is fully featured with error handling if the google sheet's service account that does this doesn't have view/edit permissions for the sheet, something goes wrong while training, etc.
- `/ptu calculate`. I started running my own PTU campaign at some point and got tired of pausing session so I could do math for certain tasks like determining how hard it should be to capture a pokemon or how much exp players should get after a battle. So I made subcommands for it! (my friend that runs his own PTU campaigns was also grateful).


### Curseborne

Recently, a branch of the creators of nWOD decided to make a new system called Curseborne that, as of November 2024 when this is being written, is still a kickstarter.

I made a custom roll command following this system, just as I initially did for nWOD and even created a lookup for some Curseborne data in Google Sheets similar to PTU.

Since this system is so new, this command is still in its infancy, but I expect it'll get fleshed out more if my friends and I play more TTRPG campaigns in the system.



## Credits
- beanc16 - [GitHub](https://github.com/beanc16)
  - [Discord Bot](https://github.com/beanc16/roll-of-darkness-bot)
- pseudobunny (creator of original Flavor Text REST API in the bot's prototype) - [GitHub](https://github.com/pseudobunny)

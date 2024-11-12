# Roll of Darkness Bot

A discord bot that provides a variety of utility features for looking up game mechanics, boosting morale at the end of sessions, simplifying bookkeeping, and rolling dice in the [New World of Darkness / Chronicles of Darkness](https://whitewolf.fandom.com/wiki/Chronicles_of_Darkness), [Pokemon Tabletop United](https://pokemontabletop.com), and [Curseborne](https://theonyxpath.com/curseborne-what-is-curseborne) tabletop role-playing game (TTRPG) systems. 

This bot is hosted on Heroku for private use. Please do not copy this repository's code or open pull requests for it. This bot is only public for portfolio purposes.



<!-- TABLE OF CONTENTS -->
## Table of Contents
- [Roll of Darkness Bot](#roll-of-darkness-bot)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [The Development Story](#the-development-story)
    - [Why was this bot made?](#why-was-this-bot-made)
    - [The Original Prototype](#the-original-prototype)
    - [Evolving Dice Commands](#evolving-dice-commands)
    - [The First Non-Dice Command: Compliments and “Beats”](#the-first-non-dice-command-compliments-and-beats)
    - [Pokémon Tabletop United (PTU)](#pokémon-tabletop-united-ptu)
    - [Curseborne](#curseborne)
    - [What's next?](#whats-next)
  - [Credits](#credits)


## Setup

**Step 1:** Download dependencies (requires a github access token tied to account with access to privately hosted NPM packages in the `@beanc16` namespace)
```bash
npm install
```

**Step 2:** Enable shared git hooks
```bash
git config --local core.hooksPath .githooks/
```




## The Development Story


### Why was this bot made?

Since 2014, my friends and I have been playing tabletop role-playing games (TTRPGs) remotely on Discord voice chat. Over the years, we've used various dice-rolling Discord bots, and I always wanted to make my own just for fun.

In April 2023, a friend and I decided to build a prototype of a simple dice-rolling Discord bot, and it quickly became something much more.


### The Original Prototype

Our initial prototype had just one command: `/roll` (now `/nwod roll`), to roll 10-sided dice (d10s) for the New World of Darkness (nWOD) system, paired with randomized "flavor text" fetched from a custom Rust API. Though the flavor text feature is no longer active, this laid the foundation for a bot that’s fun, fast, and versatile.


### Evolving Dice Commands

Over time, we added several new dice-rolling commands, including:
- `/roll_math` for complex expressions (e.g., `2+3+2-1`, rolling 6d10s).
- `/roll_lite` for multi-type dice rolls (e.g., `2d6 + d8 - 3`).
- Specialized nWOD rolls like `/chance` and `/luck` for rolling "chance dice" and "luck rolls".
- `/coinflip` for flipping a coin.


### The First Non-Dice Command: Compliments and “Beats”

At the end of each TTRPG session, my friends and I like to end on a high note with round-robin compliments for each other. Alongside these compliments, we also pick someone to give a "beat" to (1/5 of an exp point in nWOD).

The `/beat` command lets us tag and compliment each other, creating a fun, memorable log of each game’s highlights.


### Pokémon Tabletop United (PTU)

In August 2023, I joined a PTU campaign. PTU is fun but requires heavy bookkeeping, so I developed commands to help:
- `/ptu lookup` for quick access to game mechanics, integrating with Google Sheets as a pseudo-database, since PTU's character sheets are Google Sheets-based.
- `/ptu random` for random events.
- `/ptu train` to speed up Pokémon training, one of the most time-consuming parts of PTU.
- `/ptu calculate` for campaign math, like battle experience and Pokémon capture difficulty.


### Curseborne

For Curseborne, a new TTRPG from the nWOD creators, I created a dedicated `/cb roll` command and `/cb lookup` tool, adapting features as the brand-new system evolves.


### What's next?

Check out the [issues](https://github.com/beanc16/roll-of-darkness-bot/issues) for ongoing plans, including new features, bug fixes, and optimizations.



## Credits
- beanc16 - [GitHub](https://github.com/beanc16)
  - [Discord Bot](https://github.com/beanc16/roll-of-darkness-bot)
- pseudobunny (creator of original Flavor Text REST API in the bot's prototype) - [GitHub](https://github.com/pseudobunny)

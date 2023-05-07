# Roll of Darkness Bot

A discord bot for rolling dice in the [New World of Darkness / Chronicles of Darkness](https://whitewolf.fandom.com/wiki/Chronicles_of_Darkness) tabletop system style.



<!-- TABLE OF CONTENTS -->
## Table of Contents
- [Roll of Darkness Bot](#roll-of-darkness-bot)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Updating Slash Commands](#updating-slash-commands)
  - [Contributing](#contributing)
  - [Credits](#credits)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

[Download and install node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/beanc16/roll-of-darkness-bot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```

### Environment Variables

This project depends on a few environment variables. These are private and will only given out on a case-by-case basis if the owner of this repo is contacted directly.

### Updating Slash Commands

If you update the name, description, or parameters of any slash commands, you'll need to run the following locally to update the slash commands of the development version of the bot (this gets run automatically for the production version of the bot with a GitHub Action after merging to `main`):
```sh
npm run register-slash-commands
```



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



## Credits
- beanc16 - [GitHub](https://github.com/beanc16)
  - [Discord Bot](https://github.com/beanc16/roll-of-darkness-bot)
- pseudobunny - [GitHub](https://github.com/pseudobunny)
  - [REST API](https://github.com/pseudobunny/roll-of-darkness-database-api)

# Discord Music Bot with Website

## Build & Run

Node.js 16.13.0 or newer is required.

Create .env file or set environment variables in commandline and add NODE_ENV=production to disable .env file.
```
TOKEN=<discord token>
OWNER=<Discord owner User Id>
URL=<url/ip of this server in format http(s)://bot.com:port>
PORT=<port to start server on, default: 3000>
DEFAULT_VOLUME=<0-150, default: 20>
RADIO_MAX_VIDEO_LENGTH=<length in seconds, 0 for no max length, default: 600, will exclude all songs longer than the duration from the radio.>
AUTO_LEAVE_TIMEOUT=<length in seconds, -1 to disable, Default: 60, will make the bot leave after the given amount of time, if he is alone.>
RESUME_ON_BOT_JOIN=<true/false, default: false, whether the bot resumes music playback when he joins a channel.>
PAUSE_ON_USER_LEAVE<true/false, default: true, whether the bots pauses music playback when he is alone.>
RESUME_ON_USER_JOIN=<true/false, default: true, whether the bots resumes music playback when he is no longer alone.>
```

Build the server
```
npm install
npm run build
> node ./bin/www
```

If the client was build without prod flag it will always access the server via localhost:3000 (for development).

## Deploy with replit
Replit is a free and easy way to deploy the bot for yourself.

This project was not designed for replit. The provided configuration is only meant to deploy it.

With the free version you may be limited by the available resources. 
The client cannot be built because it will run out of ram. 
Due to this the client will automatically be downloaded from the releases of this git repo.

### Step by Step
1. Create a free replit account. [SignUp](https://replit.com/signup)
2. Create bot, get token and add to Discord server
3. [Deploy to replit](https://repl.it/github/pxsx/Discord-Musik-Bot-With-Dashboard)
4. Change Language from "TypeScript" to "Blank Repl" and Import from GitHub
5. Open Secrets in the Tools menu
6. Add following Secrets (key : value)
   - NODE_ENV : production
   - TOKEN : {token from step 2}
   - OWNER : {owner id from step 2}
   - URL : https://{replit name}.{replit username}.repl.co
     - eg. https://discord-bot-node.awyss.repl.co
7. Run
8. Be patient.
   - Once the message "Logged in" appears in the console it's running, and a webview should open automatically.
From this webview you can double check your configured URL.
1. Open Discord and go to the server you added the bot to in step 2.
2.  Send "!RegisterCommands" to a text chat of that server.
    - In the replit console it should print "Successfully registered X commands."
3.  Enjoy.
    - The very first song will take quite some time to load, after that the speed should be reasonable.

## Slash Commands
Slash commands are a way to interact with the bot through discord. Start typing / to see a list of available commands.

The slash commands must initially be registered with "!RegisterCommands".
- It can only be done by the bot owner, as defined by the env variable OWNER.
- It can be done in any text channel of a guild.
- It must be done for every guild separately.
- It should be repeated after every update of the bot.

## Web UI
The Web UI can be used by multiple users concurrently.
- Search YouTube
- Manage your playlist with drag and drop
- Seek in song
- Make the bot join a voice channel or leave it
- Light/Dark mode
- Adjust volume
- ...

### Keyboard Shortcuts:
* `<ctrl> + f` Focus search
* While searchbar focused:
    * `<enter>` Search
    * `<ctrl> + <enter>` Play first result now
    * `<ctrl> + <shift> + <enter>` Play first result next
    * `<shift> + <enter>` Queue first result

Tested with Firefox & Chrome.

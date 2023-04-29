const { BaseSlashCommand } = require('@beanc16/discordjs-common-commands');

class Roll extends BaseSlashCommand
{
    async run(interaction)
    {
        // Send message to show the command was received
        const deferredMessage = await interaction.deferReply({
            ephemeral: true,
            fetchReply: true,
        });

        // Calculate latencies
        const uptime = Math.round(interaction.client.uptime / 60000);
        const websocketHeartbeat = interaction.client.ws.ping;
        const roundtripLatency = deferredMessage.createdTimestamp - interaction.createdTimestamp;

        // Set up latency messages
        const latencyMessages = [
            `⬆️ Uptime: ${uptime} minutes ⬆️`,
            `💗 Websocket heartbeat: ${websocketHeartbeat}ms 💗`,
            `🚗 Roundtrip Latency: ${roundtripLatency}ms 🚗`,
        ];

        // Update message
        await interaction.editReply(latencyMessages.join('\n'));
    }

    get description()
    {
        return `Show the latency between this bot and the Discord API.`;
    }
}



module.exports = new Roll();

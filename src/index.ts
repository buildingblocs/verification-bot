import { AutoRouter } from 'itty-router';
import { APIMessage } from 'discord-api-types/v9';
import {
    InteractionResponseType,
    InteractionType,
    verifyKey,
    InteractionResponseFlags
} from 'discord-interactions';
import initials from './initials.json';

class JsonResponse extends Response {
    constructor(body: any, init?: any) {
        const jsonBody = JSON.stringify(body);
        init = init || {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };
        super(jsonBody, init);
    }
}

const router = AutoRouter();

/**
 * A simple :wave: hello page to verify the worker is working.
 */
router.get('/', (request, env) => {
    return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

// IMPORTANT: /send IS THE ENDPOINT TO SEND MESSAGE
router.post('/send', async (request, env) => {
    try {
        // Fetch the last few messages from the channel to check them
        const fetchMessagesResponse = await fetch(`https://discord.com/api/v9/channels/1041309626341281883/messages?limit=2`, {
            headers: {
                'Authorization': `Bot ${env.DISCORD_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        if (!fetchMessagesResponse.ok) {
            throw new Error(`Failed to fetch messages. Status: ${fetchMessagesResponse.status}`);
        }

        const messages = await fetchMessagesResponse.json() as APIMessage[];

        // Example condition: Check if a specific message has already been sent
        const messageAlreadySent = messages.some(msg => msg.content.includes("Ensure you have set your Display Name according to our policies before selecting an option."));
        if (messageAlreadySent) {
            console.log("Message already sent recently.");
            return new JsonResponse({ message: "No need to send duplicate message." });
        }

        // change channel id as needed
        const response = await fetch('https://discord.com/api/v9/channels/1041309626341281883/messages', {
            method: "POST",
            body: JSON.stringify(
                {
                    "content": "Ensure you have set your Display Name according to our policies before selecting an option.",
                    "components": [
                        {
                            "type": 1,
                            "components": [
                                {
                                    "type": 3,
                                    "custom_id": "a",
                                    "options": [
                                        {
                                            "label": "Student/Participant",
                                            "value": "student",
                                        },
                                        {
                                            "label": "Organiser",
                                            "value": "org",
                                        },
                                        {
                                            "label": "Teachers/Industry Partners",
                                            "value": "teacherpartner",
                                        }
                                    ],
                                    "placeholder": "Choose what describes you best",
                                    "min_values": 1,
                                    "max_values": 1
                                }
                            ]
                        }
                    ]
                }
            ),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bot ${env.DISCORD_TOKEN}`
            }
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();
        return new JsonResponse(json);
    } catch (error: any) {
        console.log(error)
        return new JsonResponse({ error: error.message }, { status: 500 });
    }
});

/**
 * Main route for all requests sent from Discord.  All incoming messages will
 * include a JSON payload described here:
 * https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object
 */
router.post('/', async (request, env) => {
    const { isValid, interaction } = await server.verifyDiscordRequest(
        request,
        env,
    );
    if (!isValid || !interaction) {
        return new Response('Bad request signature.', { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
        // The `PING` message is used during the initial webhook handshake, and is
        // required to configure the webhook in the developer portal.
        return new JsonResponse({
          type: InteractionResponseType.PONG,
        });
      }

    // THIS IS THE ONLY IMPORTANT PART
    if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
        let toSend = '';
        let components = undefined;

        async function flag(user: string, id: string, role: string) {
            try {
                // change channel id as needed
                const response = await fetch('https://discord.com/api/v9/channels/1062005224006504569/messages', {
                    method: "POST",
                    body: JSON.stringify({
                        content: `User ${user} with the ID ${id} needs manual verification with role ${role}.`,
                    }),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bot ${env.DISCORD_TOKEN}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const json = await response.json();
                return new JsonResponse(json);
            } catch (error: any) {
                console.log(error)
                return new JsonResponse({ error: error.message }, { status: 500 });
            }
        }

        if (interaction.data.custom_id === 'b') {
            // send dropdown again
            return new JsonResponse({
                // this replies to the user
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                // content is the message, its ephemeral because we want it to be shown only to user
                data: {
                    content: 'Ensure you have set your Display Name according to our policies before selecting an option.',
                    flags: InteractionResponseFlags.EPHEMERAL,
                    components: [
                        {
                            "type": 1,
                            "components": [
                                {
                                    "type": 3,
                                    "custom_id": "a",
                                    "options": [
                                        {
                                            "label": "Student/Participant",
                                            "value": "student",
                                        },
                                        {
                                            "label": "Organiser",
                                            "value": "org",
                                        },
                                        {
                                            "label": "Teachers/Industry Partners",
                                            "value": "teacherpartner",
                                        }
                                    ],
                                    "placeholder": "Choose what describes you best",
                                    "min_values": 1,
                                    "max_values": 1
                                }
                            ]
                        }
                    ]
                },
            });
        }

        if (interaction.data.values[0] === 'student') {
            if (interaction.member.nick.length >= 32) {
                toSend = "Your Display Name is too long"
                components = [
                    {
                        "type": 1,
                        "components": [
                            {
                                type: 2,
                                style: 1,
                                label: 'Retry',
                                custom_id: 'b'
                            }
                        ]

                    }
                ]
            } else {
                const user_split = interaction.member.nick.split(' ')
                if (initials.includes(user_split[0])) {
                    try {
                        // change channel id as needed
                        const response = await fetch(`https://discord.com/api/v9/guilds/698829087354912809/members/${interaction.member.user.id}/roles/952074561262858280`, {
                            method: "PUT",
                            headers: {
                                'Authorization': `Bot ${env.DISCORD_TOKEN}`
                            }
                        });
        
                        if (!response.ok) {
                            throw new Error(`Response status: ${response.status}`);
                        }
                        toSend = `You've been verified. Welcome to BuildingBloCS!`
                    } catch (error: any) {
                        console.log(error)
                        return new JsonResponse({ error: error.message }, { status: 500 });
                    }
                } else {
                    components = [
                        {
                            "type": 1,
                            "components": [
                                {
                                    type: 2,
                                    style: 1,
                                    label: 'Retry',
                                    custom_id: 'b'
                                }
                            ]

                        }
                    ]
                    toSend = `Either your school initials in your Display Name is missing or your school may not be in our database.
Please send a message in this channel to allow for one of our organisers to verify you.`
                }
            }
        };

        if (interaction.data.values[0] === 'org') {
            await flag(interaction.member.nick, interaction.member.user.id, interaction.data.values[0])
            toSend = 'Your account has been flagged for verification, please wait as one of our organisers verify you.';
        };

        if (interaction.data.values[0] === 'teacherpartner') {
            await flag(interaction.member.nick, interaction.member.user.id, interaction.data.values[0])
            toSend = 'Your account has been flagged for verification, please wait as one of our organisers verify you.';
        };

        return new JsonResponse({
            // this replies to the user
            type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
            // content is the message, its ephemeral because we want it to be shown only to user
            data: {
                content: toSend,
                flags: InteractionResponseFlags.EPHEMERAL,
                components: components
            },
        });
    }

    console.error('Unknown Type');
    return new JsonResponse({ error: 'Unknown Type' }, { status: 400 });
});
router.all('*', () => new Response('Not Found.', { status: 404 }));

async function verifyDiscordRequest(request: any, env: any) {
    const signature = request.headers.get('x-signature-ed25519');
    const timestamp = request.headers.get('x-signature-timestamp');
    const body = await request.text();
    const isValidRequest =
        signature &&
        timestamp &&
        (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));
    if (!isValidRequest) {
        return { isValid: false };
    }

    return { interaction: JSON.parse(body), isValid: true };
}

const server = {
    verifyDiscordRequest,
    fetch: router.fetch,
};

export default server;
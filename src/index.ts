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

router.get('/', (request, env) => {
  return new Response(`👋 ${env.DISCORD_APPLICATION_ID}`);
});

router.post('/send', async (request, env) => {
  try {
    // Fetch the last few messages from the channel to check them
    const fetchMessagesResponse = await fetch(
      `https://discord.com/api/v9/channels/1041309626341281883/messages?limit=2`,
      {
        headers: {
          'Authorization': `Bot ${env.DISCORD_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

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
    const response = await fetch(
      'https://discord.com/api/v9/channels/1041309626341281883/messages',
      {
        method: "POST",
        body: JSON.stringify({
          "content": "Ensure you have set your Display Name according to our policies before selecting an option.",
          "components": [
            {
              "type": 1,
              "components": [
                {
                  "type": 3,
                  "custom_id": "a",
                  "options": [
                    { "label": "Student/Participant", "value": "student" },
                    { "label": "Organiser", "value": "org" },
                    { "label": "Teachers/Industry Partners", "value": "teacherpartner" }
                  ],
                  "placeholder": "Choose what describes you best",
                  "min_values": 1,
                  "max_values": 1
                }
              ]
            }
          ]
        }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bot ${env.DISCORD_TOKEN}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    return new JsonResponse(json);
  } catch (error: any) {
    console.log(error);
    return new JsonResponse({ error: error.message }, { status: 500 });
  }
});

router.post('/', async (request, env, ctx) => {
  const { isValid, interaction } = await verifyDiscordRequest(request, env);
  if (!isValid || !interaction) {
    return new Response('Bad request signature.', { status: 401 });
  }

  if (interaction.type === InteractionType.PING) {
    return new JsonResponse({
      type: InteractionResponseType.PONG,
    });
  }

if (interaction.type === InteractionType.MESSAGE_COMPONENT) {
    let toSend = '';
    let components = undefined;

    async function flag(user: string, id: string, role: string) {
      try {
        // change channel id as needed
        const response = await fetch(
          'https://discord.com/api/v9/channels/1062005224006504569/messages',
          {
            method: "POST",
            body: JSON.stringify({
              content: `User ${user} with the ID ${id} needs manual verification with role ${role}.`,
            }),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bot ${env.DISCORD_TOKEN}`
            }
          }
        );

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();
        return new JsonResponse(json);
      } catch (error: any) {
        console.log(error);
        return new JsonResponse({ error: error.message }, { status: 500 });
      }
    }

    if (!interaction.member.nick) {
      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: 'Please set a Display Name.',
          flags: InteractionResponseFlags.EPHEMERAL,
          components: [
            {
              "type": 1,
              "components": [
                { type: 2, style: 1, label: 'Retry', custom_id: 'b' }
              ]
            }
          ]
        },
      });
    } else {
      if (interaction.data.custom_id === 'b') {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
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
                      { "label": "Student/Participant", "value": "student" },
                      { "label": "Organiser", "value": "org" },
                      { "label": "Teachers/Industry Partners", "value": "teacherpartner" }
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
          toSend = "Your Display Name is too long";
          components = [
            {
              "type": 1,
              "components": [
                { type: 2, style: 1, label: 'Retry', custom_id: 'b' }
              ]
            }
          ];
        } else {
          const user_split = interaction.member.nick.split(' ');
          if (initials.includes(user_split[0])) {
            try {
              // change channel id as needed
              const response = await fetch(
                `https://discord.com/api/v9/guilds/698829087354912809/members/${interaction.member.user.id}/roles/952074561262858280`,
                {
                  method: "PUT",
                  headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}` }
                }
              );

              if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
              }
              toSend = `You've been verified. Welcome to BuildingBloCS!`;
            } catch (error: any) {
              console.log(error);
              return new JsonResponse({ error: error.message }, { status: 500 });
            }
          } else {
            components = [
              {
                "type": 1,
                "components": [
                  { type: 2, style: 1, label: 'Retry', custom_id: 'b' }
                ]
              }
            ];
            toSend = `Either your school initials in your Display Name is missing or your school may not be in our database. Please send a message in this channel to allow for one of our organisers to verify you.`;
          }
        }
      }

      if (interaction.data.values[0] === 'org') {
        await flag(interaction.member.nick, interaction.member.user.id, interaction.data.values[0]);
        toSend = 'Your account has been flagged for verification, please wait as one of our organisers verify you.';
      }

      if (interaction.data.values[0] === 'teacherpartner') {
        await flag(interaction.member.nick, interaction.member.user.id, interaction.data.values[0]);
        toSend = 'Your account has been flagged for verification, please wait as one of our organisers verify you.';
      }

      return new JsonResponse({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: toSend,
          flags: InteractionResponseFlags.EPHEMERAL,
          components: components
        },
      });
    }
  }

  if (interaction.type === InteractionType.APPLICATION_COMMAND) {
    if (interaction.data.name === 'role') {
      const roleId = interaction.data.options.find((opt: any) => opt.name === 'role_id')?.value;
      const usersInput = interaction.data.options.find((opt: any) => opt.name === 'users')?.value;
      const users = usersInput.split(',').map((u: string) => u.trim());
      const issuerId = interaction.member.user.id;
      const guildId = interaction.guild_id;

      if (!roleId || !users.length) {
        return new JsonResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: { content: 'Invalid command usage.', flags: InteractionResponseFlags.EPHEMERAL }
        });
      }

      // Immediately send a deferred response
      const deferredResponse = new JsonResponse({
        type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      });
      
      // Use ctx.waitUntil to ensure background processing continues
      ctx.waitUntil(processRoleAssignment(interaction, env, roleId, users, issuerId, guildId));
      
      return deferredResponse;
    }
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

// Process the role assignment in batches to handle large lists synchronously
async function processRoleAssignment(
  interaction: any,
  env: any,
  roleId: string,
  users: string[],
  issuerId: string,
  guildId: string
) {
  let roleName = `Role ID ${roleId}`;
  let successList: string[] = [];
  let failureList: string[] = [];
  const batchSize = 10; // You can adjust the batch size as needed

  try {
    // Fetch all roles from the server
    const roleResponse = await fetch(`https://discord.com/api/v9/guilds/${guildId}/roles`, {
      headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}` }
    });
    if (!roleResponse.ok) {
      await updateOriginalMessage(interaction, env, '❌ Failed to fetch server roles.');
      return;
    }
    const roles = await roleResponse.json();
    const targetRole = roles.find((r: any) => r.id === roleId);
    if (!targetRole) {
      await updateOriginalMessage(interaction, env, '❌ The specified role does not exist.');
      return;
    }
    roleName = targetRole.name;

    // Fetch the issuer's roles
    const issuerResponse = await fetch(`https://discord.com/api/v9/guilds/${guildId}/members/${issuerId}`, {
      headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}` }
    });
    if (!issuerResponse.ok) {
      await updateOriginalMessage(interaction, env, '❌ Failed to verify your roles.');
      return;
    }
    const issuerData = await issuerResponse.json();
    const issuerRoles = issuerData.roles;

    // Check if the role being assigned is higher than the issuer's highest role
    const issuerHighestRole = roles
      .filter((r: any) => issuerRoles.includes(r.id))
      .reduce((highest: any, role: any) => (role.position > highest.position ? role : highest), { position: 0 });
    if (targetRole.position >= issuerHighestRole.position) {
      await updateOriginalMessage(
        interaction,
        env,
        `❌ You cannot assign the role **${roleName}** because it is higher or equal to your highest role.`
      );
      return;
    }

    // Process users in batches synchronously
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      for (const username of batch) {
        try {
          // Fetch user ID by username using search endpoint
          const searchResponse = await fetch(
            `https://discord.com/api/v9/guilds/${guildId}/members/search?query=${username}`,
            {
              headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}` }
            }
          );
          if (!searchResponse.ok) {
            failureList.push(username);
            continue;
          }
          const members = await searchResponse.json();
          const user = members.find((m: any) => m.user.username.toLowerCase() === username.toLowerCase());
          if (!user) {
            failureList.push(username);
            continue;
          }
          // Add role to user
          const addRoleResponse = await fetch(
            `https://discord.com/api/v9/guilds/${guildId}/members/${user.user.id}/roles/${roleId}`,
            {
              method: "PUT",
              headers: { 'Authorization': `Bot ${env.DISCORD_TOKEN}` }
            }
          );
          if (addRoleResponse.ok) {
            successList.push(username);
          } else {
            failureList.push(username);
          }
        } catch (error) {
          failureList.push(username);
        }
      }
      // Update progress after processing each batch
      const progressMessage = `Processing roles...\n✅ Added: ${successList.join(', ')}\n❌ Failed: ${failureList.join(', ')}\nProcessed ${Math.min(i + batchSize, users.length)} of ${users.length}`;
      await updateOriginalMessage(interaction, env, progressMessage);
    }
    
    // Final update message
    let finalMessage = '';
    if (successList.length > 0) {
      finalMessage += `✅ **${roleName}** added to: ${successList.join(', ')}\n`;
    }
    if (failureList.length > 0) {
      finalMessage += `❌ Failed to add **${roleName}** to: ${failureList.join(', ')}`;
    }
    await updateOriginalMessage(interaction, env, finalMessage);
  } catch (error: any) {
    await updateOriginalMessage(interaction, env, `❌ An error occurred: ${error.message}`);
  }
}

async function updateOriginalMessage(interaction: any, env: any, content: string) {
  try {
    const response = await fetch(
      `https://discord.com/api/v9/webhooks/${env.DISCORD_APPLICATION_ID}/${interaction.token}/messages/@original`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      }
    );
    console.log('Update original message status:', response.status);
  } catch (err) {
    console.error('Error updating original message:', err);
  }
}

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;

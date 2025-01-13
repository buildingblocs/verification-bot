/**
 * Share command metadata from a common spot to be used for both runtime
 * and registration.
 */

export const ROLE_CMD = {
    name: 'role',
    description: 'Assign a role to users.',
    options: [
        {
            name: 'role_id',
            description: 'ID of the role to add users to',
            type: 3,  // Type 3 corresponds to a string (in this case, role ID)
            required: true
        },
        {
            name: 'users',
            description: 'Comma-separated list of usernames to add to the role',
            type: 3,  // Type 3 corresponds to a string (comma-separated list of usernames)
            required: true
        }
    ]
};

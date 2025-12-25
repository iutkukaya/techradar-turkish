const ActiveDirectory = require('activedirectory2');
const ldap = require('ldapjs');

/**
 * Creates an ActiveDirectory instance with the provided configuration.
 * @param {Object} config - LDAP configuration object
 * @returns {Object} ActiveDirectory instance
 */
const createClient = (config) => {
    // Basic validation
    if (!config.url || !config.baseDn) {
        throw new Error('LDAP URL and Base DN are required');
    }

    return new ActiveDirectory({
        url: config.url,
        baseDN: config.baseDn,
        username: config.bindDn,
        password: config.bindPassword,
        tlsOptions: {
            rejectUnauthorized: false
        }
    });
};

/**
 * Test connectivity and authentication.
 */
const testConnection = (config) => {
    return new Promise((resolve, reject) => {
        try {
            const ad = createClient(config);
            ad.authenticate(config.bindDn, config.bindPassword, (err, auth) => {
                if (err) reject(err);
                else if (auth) resolve(true);
                else reject(new Error('Authentication failed'));
            });
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Search for users using raw ldapjs to support both AD and generic LDAP (OpenLDAP/Forumsys)
 */
const searchUsers = (config, query) => {
    return new Promise((resolve, reject) => {
        const client = ldap.createClient({
            url: config.url,
            tlsOptions: { rejectUnauthorized: false }
        });

        client.on('error', (err) => {
            console.error('LDAP Client Error:', err);
            // Don't reject here immediately if connection is retrying, but for short lived request it's fatal
        });

        // Bind first
        client.bind(config.bindDn, config.bindPassword, (err) => {
            if (err) {
                client.unbind();
                return reject(err);
            }

            // Prepare Filter
            let filter = config.searchFilter || '(&(objectClass=user)(sAMAccountName={{username}}))';
            // Simple replacement
            if (filter.includes('{{username}}')) {
                filter = filter.replace('{{username}}', query);
            } else {
                // Fallback if user didn't use placeholder
                // Note: For AD, sAMAccountName is standard. For OpenLDAP, uid is standard.
                // We construct a broad filter if the custom filter is missing or weird.
                filter = `(|(sAMAccountName=${query}*)(uid=${query}*)(cn=${query}*)(displayName=${query}*))`;
            }

            // Ensure we are not too restrictive with objectClass if it's not in the custom filter
            // If the user provided a filter, we trust it.

            console.log(`LDAP Raw Search - Base: ${config.baseDn}, Filter: ${filter}`);

            const searchOptions = {
                filter: filter,
                scope: 'sub',
                attributes: ['sAMAccountName', 'uid', 'displayName', 'mail', 'cn', 'givenName', 'sn', 'dn']
            };

            client.search(config.baseDn, searchOptions, (err, res) => {
                if (err) {
                    client.unbind();
                    return reject(err);
                }

                const users = [];

                res.on('searchEntry', (entry) => {
                    users.push(entry.object);
                });

                res.on('searchReference', (referral) => {
                    // Ignore referrals
                });

                res.on('error', (err) => {
                    console.error('LDAP Result Error:', err);
                    client.unbind();
                    reject(err);
                });

                res.on('end', (result) => {
                    console.log(`LDAP Only Search Found: ${users.length} entries`);
                    client.unbind();
                    resolve(users);
                });
            });
        });
    });
};

/**
 * Authenticate a specific user.
 * We can keep using activedirectory2 for this as it abstracts the complex re-bind logic nicely.
 */
const authenticate = (config, username, password) => {
    return new Promise((resolve, reject) => {
        try {
            const ad = createClient(config);
            ad.authenticate(username, password, (err, auth) => {
                if (err) reject(err);
                else if (auth) resolve(true);
                else reject(new Error('Invalid credentials'));
            });
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = {
    testConnection,
    searchUsers,
    authenticate,
    createClient
};

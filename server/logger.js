const winston = require('winston');
require('winston-syslog').Syslog;
const db = require('./database');

// Custom Transport for SQLite Auth & Audit Logs
class SqliteTransport extends winston.Transport {
    constructor(opts) {
        super(opts);
    }

    log(info, callback) {
        setImmediate(() => {
            this.emit('logged', info);
        });

        // Calculate Local Timestamp (Server Time)
        // new Date() gives current time. We adjust it by offset to match system time
        const now = new Date();
        const localTimestamp = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' ');

        // Determine log type and insert into appropriate table
        if (info.logType === 'AUTH') {
            const query = `INSERT INTO auth_logs (username, event_type, ip_address, user_agent, timestamp) VALUES (?, ?, ?, ?, ?)`;
            db.run(query, [info.username, info.eventType, info.ip, info.userAgent, localTimestamp], (err) => {
                if (err) console.error('Error writing auth log:', err);
            });
        } else if (info.logType === 'AUDIT') {
            const query = `INSERT INTO audit_logs (username, action, entity_type, entity_id, old_value, new_value, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            // Ensure values are strings if they are objects
            const oldVal = typeof info.oldValue === 'object' ? JSON.stringify(info.oldValue) : info.oldValue;
            const newVal = typeof info.newValue === 'object' ? JSON.stringify(info.newValue) : info.newValue;

            db.run(query, [info.username, info.action, info.entityType, info.entityId, oldVal, newVal, localTimestamp], (err) => {
                if (err) console.error('Error writing audit log:', err);
            });
        }

        callback();
    }
}

// Initial Logger Setup
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.Console(), // Always log to console
        new SqliteTransport() // Always log to DB
    ]
});

// Function to reconfigure Syslog transport based on settings
const reconfigureSyslog = (settings) => {
    // Remove existing Syslog transport if exists
    const existing = logger.transports.find(t => t.name === 'syslog');
    if (existing) {
        logger.remove(existing);
    }

    if (settings.syslog_enabled === 'true' && settings.syslog_host) {
        try {
            const syslogTransport = new winston.transports.Syslog({
                host: settings.syslog_host,
                port: parseInt(settings.syslog_port) || 514,
                protocol: settings.syslog_protocol || 'udp4',
                app_name: 'TeknolojiRadari',
                eol: '\n'
            });
            logger.add(syslogTransport);
            console.log(`Syslog enabled: ${settings.syslog_host}:${settings.syslog_port || 514}`);
        } catch (e) {
            console.error('Failed to configure Syslog:', e);
        }
    } else {
        console.log('Syslog disabled');
    }
};

// Log wrappers
const logAuth = (username, eventType, req) => {
    let ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    // Sanitize IPv6 mapped IPv4 address
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    const userAgent = req.headers['user-agent'];

    logger.info({
        message: `${username} - ${eventType}`,
        logType: 'AUTH',
        username,
        eventType,
        ip,
        userAgent
    });
};

const logAudit = (username, action, entityType, entityId, oldValue, newValue) => {
    logger.info({
        message: `${username} - ${action} ${entityType} ${entityId}`,
        logType: 'AUDIT',
        username,
        action,
        entityType,
        entityId,
        oldValue,
        newValue
    });
};

module.exports = {
    logger,
    reconfigureSyslog,
    logAuth,
    logAudit
};

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'radar.db');
const db = new sqlite3.Database(dbPath);

const quadrants = ['Araçlar', 'Diller ve Çerçeveler', 'Platformlar', 'Teknikler'];
const rings = ['Benimse', 'Test Et', 'Değerlendir', 'Çık'];
const attributes = ['Yeni', 'Halka Atladı', 'Halka Düştü', null];

const techNames = [
    'React', 'Vue', 'Angular', 'Svelte', 'Node.js', 'Python', 'Go', 'Rust', 'Java', 'C#',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins',
    'PostgreSQL', 'MongoDB', 'Redis', 'Kafka', 'RabbitMQ', 'GraphQL', 'REST', 'gRPC',
    'Microservices', 'Serverless', 'Event-Driven', 'DDD', 'TDD', 'CI/CD', 'DevOps',
    'Agile', 'Scrum', 'Kanban', 'Lean', 'XP', 'Pair Programming', 'Mob Programming',
    'VS Code', 'IntelliJ', 'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Jira', 'Confluence',
    'Slack', 'Teams', 'Zoom', 'Discord', 'Notion', 'Trello', 'Asana', 'Monday',
    'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Zeplin', 'Miro', 'Mural', 'Lucidchart'
];

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

const numberOfItems = 100; // Generate 100 items

db.serialize(() => {
    console.log(`Generating ${numberOfItems} dummy technologies...`);

    const stmt = db.prepare("INSERT INTO technologies (name, description, quadrant, ring, attribute, active) VALUES (?, ?, ?, ?, ?, 1)");

    for (let i = 0; i < numberOfItems; i++) {
        const name = `${techNames[getRandomInt(techNames.length)]} ${i}`;
        const description = `This is a dummy description for ${name}.`;
        const quadrant = quadrants[getRandomInt(quadrants.length)];
        const ring = rings[getRandomInt(rings.length)];
        const attribute = attributes[getRandomInt(attributes.length)];

        stmt.run(name, description, quadrant, ring, attribute);
    }

    stmt.finalize();
    console.log('Dummy data generation complete.');
});

db.close();

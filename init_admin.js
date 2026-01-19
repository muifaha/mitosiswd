// Script to initialize admin account
const bcrypt = require('bcrypt');
const db = require('./config/database');

async function initAdmin() {
    try {
        const username = process.env.ADMIN_USERNAME || 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin already exists
        const [existing] = await db.query('SELECT id FROM admins WHERE username = ?', [username]);

        if (existing.length > 0) {
            console.log('❌ Admin already exists!');
            process.exit(0);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert admin
        await db.query(
            'INSERT INTO admins (username, password) VALUES (?, ?)',
            [username, hashedPassword]
        );

        console.log('✅ Admin account created successfully!');
        console.log(`   Username: ${username}`);
        console.log(`   Password: ${password}`);
        console.log('\n⚠️  Please change the password after first login!');

        process.exit(0);

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
        process.exit(1);
    }
}

initAdmin();

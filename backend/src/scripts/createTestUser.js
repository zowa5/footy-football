require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined');
    process.exit(1);
}

// User Schema
const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    role: String,
    isActive: { type: Boolean, default: true },
    playerInfo: {
        position: String
    }
});

const User = mongoose.model('User', UserSchema);

async function createTestUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Create test user
        const hashedPassword = await bcrypt.hash('test123', 10);
        const testUser = new User({
            username: 'testuser',
            email: 'test@example.com',
            password: hashedPassword,
            role: 'player',
            playerInfo: {
                position: 'CF'
            }
        });

        await testUser.save();
        console.log('Test user created successfully');
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
    }
}

createTestUser();
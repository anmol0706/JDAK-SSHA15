import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-interviewer';

async function upgradeUser() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Find user by name "Tanay Agrawal"
        const result = await mongoose.connection.db.collection('users').findOneAndUpdate(
            { firstName: 'Tanay', lastName: 'Agrawal' },
            {
                $set: {
                    'subscription.plan': 'premium',
                    'subscription.interviewsRemaining': 99999,
                    'subscription.features': [
                        'voice-analysis',
                        'detailed-analytics',
                        'custom-questions',
                        'priority-support'
                    ]
                }
            },
            { returnDocument: 'after' }
        );

        if (result) {
            console.log(`✅ Successfully upgraded user: ${result.firstName} ${result.lastName}`);
            console.log(`   Email: ${result.email}`);
            console.log(`   Plan: ${result.subscription.plan}`);
            console.log(`   Interviews Remaining: ${result.subscription.interviewsRemaining}`);
        } else {
            console.log('❌ User "Tanay Agrawal" not found in database');

            // List all users for debugging
            const users = await mongoose.connection.db.collection('users').find({}, { projection: { firstName: 1, lastName: 1, email: 1, 'subscription.plan': 1 } }).toArray();
            console.log('\nExisting users:');
            users.forEach(u => {
                console.log(`  - ${u.firstName} ${u.lastName} (${u.email}) - Plan: ${u.subscription?.plan || 'unknown'}`);
            });
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

upgradeUser();

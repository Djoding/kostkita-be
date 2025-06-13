const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
    try {
        console.log('🔍 Testing database connection...');

        await prisma.$connect();
        console.log('✅ Database connected successfully');

        const userCount = await prisma.users.count();
        console.log('👥 Total users in database:', userCount);

        const adminUser = await prisma.users.findFirst({
            where: { role: 'ADMIN' }
        });
        console.log('👤 Admin user found:', adminUser ? adminUser.email : 'None');

        const googleUsers = await prisma.users.findMany({
            where: { google_id: { not: null } }
        });
        console.log('🔐 Google users count:', googleUsers.length);

        console.log('✅ Database test completed successfully');

    } catch (error) {
        console.error('❌ Database test failed:', error);
        console.error('❌ Error details:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testDatabase();

// node test-db.js
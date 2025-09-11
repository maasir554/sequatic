import { prisma } from '../lib/prisma';

async function nuclearReset() {
  try {
    console.log('🧨 NUCLEAR RESET - Clearing everything...');
    
    // Delete everything
    await prisma.verificationToken.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log('✅ Deleted all data from all tables');
    
    // Show empty state
    const counts = {
      users: await prisma.user.count(),
      accounts: await prisma.account.count(),
      sessions: await prisma.session.count(),
      tokens: await prisma.verificationToken.count()
    };
    
    console.log('📊 Database counts:', counts);
    console.log('🎉 Nuclear reset complete!');
    console.log('👉 Now REVOKE ACCESS in Google and try again');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

nuclearReset();

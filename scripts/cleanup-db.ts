import { prisma } from '../lib/prisma';

async function cleanupOrphanedRecords() {
  try {
    console.log('🧹 Starting database cleanup...');
    
    // Delete all existing accounts and sessions to clean slate
    const deletedAccounts = await prisma.account.deleteMany({});
    console.log(`✅ Deleted ${deletedAccounts.count} existing accounts`);
    
    const deletedSessions = await prisma.session.deleteMany({});
    console.log(`✅ Deleted ${deletedSessions.count} existing sessions`);
    
    // Ensure all users have onboarded field set properly
    const usersUpdated = await prisma.user.updateMany({
      where: {},
      data: {
        onboarded: false
      }
    });
    console.log(`✅ Reset onboarded status for ${usersUpdated.count} users`);
    
    console.log('🎉 Database cleanup completed successfully!');
    
    // Show summary of all users
    const userSummary = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        onboarded: true,
        createdAt: true
      }
    });
    
    console.log('\n📊 User Summary:');
    userSummary.forEach(user => {
      console.log(`- ${user.email}: onboarded=${user.onboarded}, created=${user.createdAt.toISOString()}`);
    });
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the cleanup
cleanupOrphanedRecords();

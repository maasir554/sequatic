import { prisma } from '../lib/prisma';

async function debugAccountLinking() {
  try {
    console.log('🔍 Debugging account linking issue...');
    
    // Find all users with your email
    const users = await prisma.user.findMany({
      where: {
        email: 'maasir554@gmail.com'
      },
      include: {
        accounts: true,
        sessions: true
      }
    });
    
    console.log(`Found ${users.length} users with your email:`);
    
    users.forEach((user, index) => {
      console.log(`\n👤 User ${index + 1}:`);
      console.log(`  ID: ${user.id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log(`  Onboarded: ${user.onboarded}`);
      console.log(`  Accounts: ${user.accounts.length}`);
      
      user.accounts.forEach((account, accountIndex) => {
        console.log(`    Account ${accountIndex + 1}: ${account.provider} (${account.providerAccountId})`);
      });
      
      console.log(`  Sessions: ${user.sessions.length}`);
    });
    
    // If there are multiple users, we need to merge them
    if (users.length > 1) {
      console.log('\n⚠️  Multiple users found! This causes OAuthAccountNotLinked error.');
      console.log('Let me fix this by keeping the most recent user and moving accounts...');
      
      // Sort by creation date, keep the most recent
      const sortedUsers = users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      const keepUser = sortedUsers[0];
      const removeUsers = sortedUsers.slice(1);
      
      console.log(`\n📝 Plan:`);
      console.log(`  ✅ Keep: ${keepUser.id} (${keepUser.createdAt})`);
      removeUsers.forEach(user => {
        console.log(`  ❌ Remove: ${user.id} (${user.createdAt})`);
      });
      
      // Move all accounts to the keeper user
      for (const userToRemove of removeUsers) {
        // Update accounts to point to keeper user
        await prisma.account.updateMany({
          where: { userId: userToRemove.id },
          data: { userId: keepUser.id }
        });
        
        // Update sessions to point to keeper user
        await prisma.session.updateMany({
          where: { userId: userToRemove.id },
          data: { userId: keepUser.id }
        });
        
        // Delete the duplicate user
        await prisma.user.delete({
          where: { id: userToRemove.id }
        });
        
        console.log(`✅ Merged and removed user ${userToRemove.id}`);
      }
      
      console.log('\n🎉 Account linking fixed!');
    } else if (users.length === 1) {
      console.log('\n✅ Only one user found. The issue might be elsewhere.');
      
      // Check if there are orphaned accounts
      const allAccounts = await prisma.account.findMany({
        include: { user: true }
      });
      
      const orphanedAccounts = allAccounts.filter(account => 
        !account.user || account.user.email !== 'maasir554@gmail.com'
      );
      
      if (orphanedAccounts.length > 0) {
        console.log(`\n⚠️  Found ${orphanedAccounts.length} orphaned accounts:`);
        orphanedAccounts.forEach(account => {
          console.log(`  - ${account.provider}: ${account.providerAccountId} (userId: ${account.userId})`);
        });
        
        // Delete orphaned accounts
        await prisma.account.deleteMany({
          where: {
            id: { in: orphanedAccounts.map(a => a.id) }
          }
        });
        console.log('✅ Cleaned up orphaned accounts');
      }
    } else {
      console.log('\n❌ No users found with your email!');
    }
    
    // Final check
    const finalUsers = await prisma.user.findMany({
      where: { email: 'maasir554@gmail.com' },
      include: { accounts: true }
    });
    
    console.log('\n📊 Final state:');
    finalUsers.forEach(user => {
      console.log(`  User: ${user.id}`);
      console.log(`  Accounts: ${user.accounts.map(a => a.provider).join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugAccountLinking();

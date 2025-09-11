import { prisma } from '../lib/prisma';

async function cleanSlate() {
  try {
    console.log('🧹 Starting clean slate...');
    
    // Delete all accounts and sessions first
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    console.log('✅ Deleted all accounts and sessions');
    
    // Delete your user
    await prisma.user.deleteMany({
      where: { email: 'maasir554@gmail.com' }
    });
    console.log('✅ Deleted your user record');
    
    console.log('🎉 Clean slate complete!');
    console.log('👉 Now try logging in again with Google on the website');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanSlate();

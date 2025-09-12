import { prisma } from "@/lib/prisma";

async function clearDatabase() {
  try {
    console.log('🔥 Clearing all authentication data...');
    
    // Delete all users (only model we have now)
    await prisma.user.deleteMany();
    console.log('✅ Users cleared');
    
    console.log('🎉 Database completely cleared!');
    
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();

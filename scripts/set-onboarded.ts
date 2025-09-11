import { prisma } from '../lib/prisma';

async function setUserOnboarded() {
  try {
    console.log('🚀 Setting user as onboarded...');
    
    // Update your user to be onboarded
    const updatedUser = await prisma.user.update({
      where: {
        email: 'maasir554@gmail.com' // Your email
      },
      data: {
        onboarded: true,
        username: 'maasir554' // Set a default username
      }
    });
    
    console.log('✅ User updated successfully:', updatedUser);
    
  } catch (error) {
    console.error('❌ Error updating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setUserOnboarded();

const {users} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedUsers(users) {
  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.id
      }
    });

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword
        }
      });
    }
  }
}

async function main() {
  try {
    await seedUsers(users);
    console.log('Database seeded successfully.');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
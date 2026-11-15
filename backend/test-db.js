const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testConnection() {
  try {
    await prisma.$connect();

    console.log("Lidhja me databazen u realizua me sukses!");
  } catch (error) {
    console.log("Gabim gjate lidhjes me databazen:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

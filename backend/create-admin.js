require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function createAdmin() {
  const name = process.env.ADMIN_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    console.log("Admin credentials are missing!");
    return;
  }

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingAdmin) {
    console.log("Admin user already exists!");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created successfully!");
  console.log({
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });
}

createAdmin()
  .catch((error) => {
    console.log(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

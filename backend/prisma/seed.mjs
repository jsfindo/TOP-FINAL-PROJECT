import pkg from '@prisma/client';
import { faker } from '@faker-js/faker';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding...');

  // 1. Delete existing records in reverse dependency order
  await prisma.application.deleteMany({});
  await prisma.jobOpening.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Seed Users
  const users = [];
  for (let i = 0; i < 5; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        phone: faker.phone.number(),
        education: faker.person.jobTitle() + ' Degree',
        desc: faker.lorem.paragraph(),
        experience: `${faker.number.int({ min: 1, max: 10 })} years`,
        skills: 'JavaScript, React, Node.js, SQL',
      },
    });
    users.push(user);
  }

  // 3. Seed Companies
  const companies = [];
  for (let i = 0; i < 3; i++) {
    const company = await prisma.company.create({
      data: {
        name: faker.company.name(),
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        location: faker.location.city(),
        desc: faker.company.catchPhrase(),
        websitelink: faker.internet.url(),
      },
    });
    companies.push(company);
  }

  // 4. Seed Job Openings
  const jobOpenings = [];
  for (const company of companies) {
    const job = await prisma.jobOpening.create({
      data: {
        companyId: company.id,
        title: faker.person.jobTitle(),
        desc: faker.lorem.paragraphs(2),
        dateClose: faker.date.future(),
      },
    });
    jobOpenings.push(job);
  }

  // 5. Seed Applications
  for (let i = 0; i < 5; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomJob = jobOpenings[Math.floor(Math.random() * jobOpenings.length)];

    await prisma.application.create({
      data: {
        openingId: randomJob.id,
        userId: randomUser.id,
      },
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
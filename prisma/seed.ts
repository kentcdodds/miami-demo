import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  let user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    const hashedPassword = await bcrypt.hash("racheliscool", 10);

    user = await prisma.user.create({
      data: {
        email,
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    });
  }

  await prisma.note.deleteMany({ where: { userId: user.id } });

  const fakeNotes = [
    {
      title: "Soft Drink",
      body: "A man got hit in the head with a can of Coke, but he was alright because it was a soft drink.",
    },
    {
      title: "Sad Soft Drink",
      body: "I used to work for a soft drink can crusher. It was soda pressing.",
    },
    {
      title: "Smart Fish",
      body: "Why are fish so smart? Because they live in schools!",
    },
    {
      title: "Sorry Giraffes",
      body: "Why are giraffes so slow to apologize? Because it takes them a long time to swallow their pride.",
    },
    {
      title: "25 Letters",
      body: "I'm only familiar with 25 letters in the English language. I don't know why.",
    },
    {
      title: "Careless",
      body: "What is the difference between ignorance and apathy? I don't know and I don't care.",
    },
    {
      title: "Broken Arm",
      body: `"Doctor, I've broken my arm in several places" ... Doctor: "Well don't go to those places."`,
    },
    {
      title: "Talented Hippos",
      body: "Why don't you find hippopotamuses hiding in trees? They're really good at it.",
    },
    {
      title: "Shoe Recycling",
      body: "I used to work in a shoe recycling shop. It was sole destroying.",
    },
    {
      title: "Bike Chaser",
      body: "My dog used to chase people on a bike a lot. It got so bad I had to take his bike away.",
    },
  ];

  for (const note of fakeNotes) {
    await prisma.note.create({
      data: {
        ...note,
        userId: user.id,
      },
    });
  }

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

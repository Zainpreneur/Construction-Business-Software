import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const password = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@buildright.test" },
    update: {},
    create: {
      name: "Ava Administrator",
      email: "admin@buildright.test",
      passwordHash: password,
      role: "ADMIN",
      title: "Owner",
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@buildright.test" },
    update: {},
    create: {
      name: "Marcus Reyes",
      email: "manager@buildright.test",
      passwordHash: password,
      role: "MANAGER",
      title: "Project Manager",
      phone: "555-0102",
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: "accountant@buildright.test" },
    update: {},
    create: {
      name: "Priya Shah",
      email: "accountant@buildright.test",
      passwordHash: password,
      role: "ACCOUNTANT",
      title: "Controller",
    },
  });

  const worker1 = await prisma.user.upsert({
    where: { email: "worker1@buildright.test" },
    update: {},
    create: {
      name: "Diego Martins",
      email: "worker1@buildright.test",
      passwordHash: password,
      role: "EMPLOYEE",
      title: "Site Foreman",
    },
  });

  const worker2 = await prisma.user.upsert({
    where: { email: "worker2@buildright.test" },
    update: {},
    create: {
      name: "Kayla Nguyen",
      email: "worker2@buildright.test",
      passwordHash: password,
      role: "EMPLOYEE",
      title: "Electrician",
    },
  });

  const clientA = await prisma.client.create({
    data: {
      name: "Helen Carter",
      companyName: "Carter Family Trust",
      email: "helen.carter@example.com",
      phone: "555-0111",
      address: "482 Maple Ridge Rd, Austin, TX",
    },
  });

  const clientB = await prisma.client.create({
    data: {
      name: "James Ito",
      companyName: "Ito Retail Group",
      email: "james@itoretail.example.com",
      phone: "555-0122",
      address: "9 Commerce Plaza, Denver, CO",
    },
  });

  const clientC = await prisma.client.create({
    data: {
      name: "Priya Anand",
      companyName: "Anand Holdings",
      email: "priya.anand@example.com",
      phone: "555-0133",
      address: "77 Lakeview Dr, Portland, OR",
    },
  });

  const projectA = await prisma.project.create({
    data: {
      name: "Carter Residence Remodel",
      description: "Full kitchen and primary bath remodel, ~1,800 sq ft.",
      status: "ACTIVE",
      address: "482 Maple Ridge Rd, Austin, TX",
      budget: 185000,
      startDate: new Date("2026-06-01"),
      endDate: new Date("2026-10-15"),
      clientId: clientA.id,
      managerId: manager.id,
    },
  });

  const projectB = await prisma.project.create({
    data: {
      name: "Ito Retail Storefront Build-out",
      description: "New retail storefront, interior build-out and signage.",
      status: "PLANNING",
      address: "9 Commerce Plaza, Denver, CO",
      budget: 420000,
      startDate: new Date("2026-09-01"),
      clientId: clientB.id,
      managerId: manager.id,
    },
  });

  const projectC = await prisma.project.create({
    data: {
      name: "Anand Lakeview Addition",
      description: "600 sq ft two-story addition with new foundation.",
      status: "ESTIMATING",
      address: "77 Lakeview Dr, Portland, OR",
      budget: 260000,
      clientId: clientC.id,
      managerId: manager.id,
    },
  });

  const projectD = await prisma.project.create({
    data: {
      name: "Carter Backyard Deck",
      description: "Completed composite deck and pergola.",
      status: "COMPLETED",
      address: "482 Maple Ridge Rd, Austin, TX",
      budget: 42000,
      startDate: new Date("2026-02-01"),
      endDate: new Date("2026-03-20"),
      clientId: clientA.id,
      managerId: manager.id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        projectId: projectA.id,
        title: "Demo existing kitchen cabinetry",
        status: "DONE",
        priority: "HIGH",
        assigneeId: worker1.id,
        dueDate: new Date("2026-06-10"),
      },
      {
        projectId: projectA.id,
        title: "Rough-in plumbing for island sink",
        status: "IN_PROGRESS",
        priority: "HIGH",
        assigneeId: worker1.id,
        dueDate: new Date("2026-08-25"),
      },
      {
        projectId: projectA.id,
        title: "Electrical rough-in, primary bath",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        assigneeId: worker2.id,
        dueDate: new Date("2026-08-28"),
      },
      {
        projectId: projectA.id,
        title: "Order custom cabinetry",
        status: "TODO",
        priority: "URGENT",
        dueDate: new Date("2026-08-24"),
      },
      {
        projectId: projectB.id,
        title: "Finalize permit drawings",
        status: "TODO",
        priority: "HIGH",
        assigneeId: manager.id,
        dueDate: new Date("2026-08-30"),
      },
      {
        projectId: projectC.id,
        title: "Soil survey & foundation design",
        status: "TODO",
        priority: "MEDIUM",
        dueDate: new Date("2026-09-05"),
      },
    ],
  });

  await prisma.timeEntry.createMany({
    data: [
      {
        projectId: projectA.id,
        userId: worker1.id,
        date: new Date("2026-08-18"),
        hours: 8,
        billable: true,
        notes: "Plumbing rough-in",
      },
      {
        projectId: projectA.id,
        userId: worker2.id,
        date: new Date("2026-08-18"),
        hours: 7.5,
        billable: true,
        notes: "Electrical rough-in",
      },
      {
        projectId: projectA.id,
        userId: worker1.id,
        date: new Date("2026-08-19"),
        hours: 8,
        billable: true,
      },
      {
        projectId: projectA.id,
        userId: worker2.id,
        date: new Date("2026-08-20"),
        hours: 6,
        billable: true,
      },
    ],
  });

  const estimate = await prisma.estimate.create({
    data: {
      number: "EST-1001",
      status: "SENT",
      projectId: projectC.id,
      clientId: clientC.id,
      taxRate: 8.25,
      expiryDate: new Date("2026-09-30"),
      notes: "Estimate covers foundation, framing, and shell only.",
      items: {
        create: [
          { description: "Foundation & excavation", quantity: 1, unitPrice: 48000, sortOrder: 0 },
          { description: "Framing labor & materials", quantity: 1, unitPrice: 62000, sortOrder: 1 },
          { description: "Roofing", quantity: 1, unitPrice: 18500, sortOrder: 2 },
        ],
      },
    },
  });

  const invoice1 = await prisma.invoice.create({
    data: {
      number: "INV-2001",
      status: "PARTIAL",
      projectId: projectA.id,
      clientId: clientA.id,
      taxRate: 8.25,
      issueDate: new Date("2026-07-01"),
      dueDate: new Date("2026-07-31"),
      items: {
        create: [
          { description: "Demo & disposal", quantity: 1, unitPrice: 6500, sortOrder: 0 },
          { description: "Plumbing rough-in labor", quantity: 40, unitPrice: 95, sortOrder: 1 },
          { description: "Electrical rough-in labor", quantity: 32, unitPrice: 105, sortOrder: 2 },
        ],
      },
      payments: {
        create: [{ amount: 10000, method: "BANK_TRANSFER", paidAt: new Date("2026-07-10") }],
      },
    },
  });

  const invoice2 = await prisma.invoice.create({
    data: {
      number: "INV-2002",
      status: "PAID",
      projectId: projectD.id,
      clientId: clientA.id,
      taxRate: 8.25,
      issueDate: new Date("2026-03-21"),
      dueDate: new Date("2026-04-05"),
      items: {
        create: [
          { description: "Composite decking materials", quantity: 1, unitPrice: 18000, sortOrder: 0 },
          { description: "Pergola construction", quantity: 1, unitPrice: 9500, sortOrder: 1 },
          { description: "Labor", quantity: 120, unitPrice: 85, sortOrder: 2 },
        ],
      },
      payments: {
        create: [{ amount: 37700, method: "CHECK", paidAt: new Date("2026-04-01") }],
      },
    },
  });

  const invoice3 = await prisma.invoice.create({
    data: {
      number: "INV-2003",
      status: "OVERDUE",
      projectId: projectB.id,
      clientId: clientB.id,
      taxRate: 0,
      issueDate: new Date("2026-07-15"),
      dueDate: new Date("2026-08-01"),
      items: {
        create: [{ description: "Design & permitting retainer", quantity: 1, unitPrice: 15000, sortOrder: 0 }],
      },
    },
  });

  await prisma.expense.createMany({
    data: [
      {
        projectId: projectA.id,
        category: "MATERIALS",
        vendor: "Austin Lumber Co.",
        amount: 8420.5,
        date: new Date("2026-07-05"),
        description: "Framing lumber & sheathing",
      },
      {
        projectId: projectA.id,
        category: "PERMITS",
        vendor: "City of Austin",
        amount: 1200,
        date: new Date("2026-06-02"),
        description: "Remodel permit fees",
      },
      {
        projectId: projectA.id,
        category: "SUBCONTRACTOR",
        vendor: "Reliable Plumbing LLC",
        amount: 6200,
        date: new Date("2026-08-01"),
        description: "Plumbing subcontract - rough in",
      },
      {
        projectId: projectD.id,
        category: "MATERIALS",
        vendor: "TimberTech Supply",
        amount: 17650,
        date: new Date("2026-02-20"),
        description: "Composite decking",
      },
    ],
  });

  await prisma.equipment.createMany({
    data: [
      { name: "Bobcat S70 Skid Steer", type: "Heavy Equipment", serialNumber: "BC-S70-4471", status: "IN_USE", projectId: projectA.id },
      { name: "Milwaukee Rotary Hammer Set", type: "Power Tools", serialNumber: "MW-RH-2210", status: "AVAILABLE" },
      { name: "20ft Scaffold Tower", type: "Scaffolding", serialNumber: "SC-20-0091", status: "AVAILABLE" },
      { name: "Flatbed Trailer", type: "Vehicle", serialNumber: "FB-TR-3345", status: "MAINTENANCE" },
    ],
  });

  await prisma.changeOrder.createMany({
    data: [
      {
        projectId: projectA.id,
        title: "Upgrade to quartz countertops",
        description: "Client requested upgrade from laminate to quartz.",
        amount: 4200,
        status: "APPROVED",
        createdById: manager.id,
      },
      {
        projectId: projectA.id,
        title: "Add recessed lighting to hallway",
        amount: 950,
        status: "PENDING",
        createdById: manager.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Demo accounts (password: password123):");
  console.log(`  Admin:      ${admin.email}`);
  console.log(`  Manager:    ${manager.email}`);
  console.log(`  Accountant: ${accountant.email}`);
  console.log(`  Employee:   ${worker1.email}`);
  console.log(`  Employee:   ${worker2.email}`);
  void estimate;
  void invoice1;
  void invoice2;
  void invoice3;
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

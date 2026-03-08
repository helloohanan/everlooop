import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      role: 'ADMIN',
      name: 'Administrator',
    },
  })

  // Create staff user
  const staffPassword = await bcrypt.hash('staff123', 10)
  await prisma.user.upsert({
    where: { username: 'staff' },
    update: {},
    create: {
      username: 'staff',
      password: staffPassword,
      role: 'STAFF',
      name: 'Staff Member',
    },
  })

  // Create sample customers
  const customer1 = await prisma.customer.upsert({
    where: { id: 'cust001' },
    update: {},
    create: {
      id: 'cust001',
      name: 'Mohammed Al-Rashid',
      phone: '+974 5555 1234',
      email: 'm.rashid@email.com',
      address: 'Al Waab Street, Doha, Qatar',
    },
  })

  const customer2 = await prisma.customer.upsert({
    where: { id: 'cust002' },
    update: {},
    create: {
      id: 'cust002',
      name: 'Fatima Al-Khalifa',
      phone: '+974 6666 5678',
      email: 'fatima.k@email.com',
      address: 'Pearl Qatar, Doha, Qatar',
    },
  })

  // Create sample products
  await prisma.product.upsert({
    where: { productId: 'EL-1001' },
    update: {},
    create: {
      productId: 'EL-1001',
      name: 'Royal Persian Medallion',
      type: 'Persian',
      size: '8x10',
      material: 'Wool',
      price: 4500,
      stock: 8,
      lowStock: 3,
      description: 'Handcrafted Persian carpet with intricate medallion design in rich reds and gold',
    },
  })

  await prisma.product.upsert({
    where: { productId: 'EL-1002' },
    update: {},
    create: {
      productId: 'EL-1002',
      name: 'Anatolian Turkish Heritage',
      type: 'Turkish',
      size: '5x7',
      material: 'Wool',
      price: 2800,
      stock: 12,
      lowStock: 3,
      description: 'Traditional Turkish Anatolian pattern with geometric designs',
    },
  })

  await prisma.product.upsert({
    where: { productId: 'EL-1003' },
    update: {},
    create: {
      productId: 'EL-1003',
      name: 'Kashmir Silk Dream',
      type: 'Handmade',
      size: '6x9',
      material: 'Silk',
      price: 12000,
      stock: 3,
      lowStock: 2,
      description: 'Exquisite handmade silk carpet from Kashmir with ultra-fine knotting',
    },
  })

  await prisma.product.upsert({
    where: { productId: 'EL-1004' },
    update: {},
    create: {
      productId: 'EL-1004',
      name: 'Modern Abstract Fusion',
      type: 'Machine-made',
      size: '4x6',
      material: 'Synthetic',
      price: 850,
      stock: 25,
      lowStock: 5,
      description: 'Contemporary abstract design perfect for modern interiors',
    },
  })

  await prisma.product.upsert({
    where: { productId: 'EL-1005' },
    update: {},
    create: {
      productId: 'EL-1005',
      name: 'Berber Atlas Collection',
      type: 'Handmade',
      size: '9x12',
      material: 'Wool',
      price: 6500,
      stock: 2,
      lowStock: 3,
      description: 'Authentic Berber flat-weave carpet with natural wool in earthy tones',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('Admin login: username=admin, password=admin123')
  console.log('Staff login: username=staff, password=staff123')
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

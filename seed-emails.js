const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    try {
        const admin = await prisma.user.update({
            where: { username: 'admin' },
            data: { email: 'helloohanan@gmail.com' }
        })
        console.log('Updated admin email:', admin.email)

        const staff = await prisma.user.update({
            where: { username: 'staff' },
            data: { email: 'staff@everloop.com' }
        })
        console.log('Updated staff email:', staff.email)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

main()

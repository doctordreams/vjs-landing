import { db } from './src/lib/db'

async function checkDb() {
  try {
    const count = await db.scholarshipApplication.count()
    console.log(`Current scholarship applications in DB: ${count}`)
    const latest = await db.scholarshipApplication.findFirst({
      orderBy: { timestamp: 'desc' }
    })
    if (latest) {
      console.log('Latest entry:', JSON.stringify(latest, null, 2))
    }
  } catch (err) {
    console.error('Error checking DB:', err)
  }
}

checkDb()

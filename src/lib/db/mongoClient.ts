import { MongoClient, Db } from 'mongodb'

let client: MongoClient
let db: Db

export async function connectToDatabase() {
  if (client && db) {
    return { client, db }
  }

  const uri = process.env.MONGODB_URI!
  const dbName = process.env.MONGODB_DB_NAME!

  client = new MongoClient(uri, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })

  await client.connect()
  db = client.db(dbName)

  return { client, db }
}

export { db }

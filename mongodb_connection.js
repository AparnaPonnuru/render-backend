const mongodb = require('mongodb');

  const makeDb = async function() {
  const MongoClient = mongodb.MongoClient;
  const url = process.env.DATABASE_URI;
  const dbName = process.env.DATABASE_NAME;
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  const mongodatabase = await client.db(dbName);
   console.log("Connected to the DataBase (mongo)");
  return mongodatabase;
}

module.exports = {
  makeDb,
}
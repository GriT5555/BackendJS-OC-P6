const express = require('express');
const app = express();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri =  "mongodb://Test1:vRqUvcPQUtXCkBw5@ac-uw0grdo-shard-00-00.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-01.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-02.tevb15e.mongodb.net:27017/?ssl=true&replicaSet=atlas-3o8cmx-shard-0&authSource=admin&appName=Cluster0";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
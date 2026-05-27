const express = require('express');
const app = express();
const booksRoutes = require('./routes/router');
const userRoutes = require('./routes/Useroute')
const mongoose = require('mongoose')
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

const path = require('path')
app.use('/api/router', booksRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join (__dirname, 'images')));

const uri = "mongodb://Test1:vRqUvcPQUtXCkBw5@ac-uw0grdo-shard-00-00.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-01.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-02.tevb15e.mongodb.net:27017/?ssl=true&replicaSet=atlas-3o8cmx-shard-0&authSource=admin&appName=Cluster0";

mongoose.connect(uri, {
  dbName: "Book_app"
})
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));

/*const { MongoClient, ServerApiVersion } = require('mongodb');

/*const uri =  "mongodb://Test1:vRqUvcPQUtXCkBw5@ac-uw0grdo-shard-00-00.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-01.tevb15e.mongodb.net:27017,ac-uw0grdo-shard-00-02.tevb15e.mongodb.net:27017/?ssl=true&replicaSet=atlas-3o8cmx-shard-0&authSource=admin&appName=Cluster0";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});*/
async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

module.exports = app;
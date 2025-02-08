import { MongoClient, ServerApiVersion } from "mongodb";

const authUri =
    "mongodb+srv://noahdement_user:noahdement_password@users.xcrmy.mongodb.net/?retryWrites=true&w=majority&appName=users"; // auth
const messagesUri =
    "mongodb+srv://noahdement_user:noahdement_password@iq-cluster.dujj4.mongodb.net/?retryWrites=true&w=majority&appName=IQ-Cluster"; //messaging API

// Create MongoClient instances for each URI
const authClient = new MongoClient(authUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const messagesClient = new MongoClient(messagesUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectDB(client, dbName) {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(`Pinged your deployment. You successfully connected to MongoDB: ${dbName}`);
  } catch (err) {
    console.error(err);
  }
}

async function run() {
  await connectDB(authClient, "auth");
  await connectDB(messagesClient, "messages");
}

run().catch(console.dir);

export { authClient, messagesClient };
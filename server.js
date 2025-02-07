const express = require("express");
const { authClient, messagesClient } = require("./connect");

const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Connect to the databases
async function connectDatabases() {
  await authClient.connect();
  await messagesClient.connect();
}

connectDatabases().catch(console.error);

// Define your routes here
app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Example route to use authClient
app.get("/users", async (req, res) => {
  const users = await authClient.db("users").collection("users").find().toArray();
  res.json(users);
});

// Example route to use messagesClient
app.get("/messages", async (req, res) => {
  const messages = await messagesClient.db("IQ-Cluster").collection("messages").find().toArray();
  res.json(messages);
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
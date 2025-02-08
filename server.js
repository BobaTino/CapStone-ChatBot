import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { ObjectId } from "mongodb";
import { authClient, messagesClient } from "./connect.js";

const app = express();
const port = process.env.PORT || 4000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "dist"))); // Adjust "dist" to your build directory

// Connect to the databases
async function connectDatabases() {
  await authClient.connect();
  await messagesClient.connect();
}

connectDatabases().catch(console.error);

// Define your API routes here
app.get("/api/users", async (req, res) => {
  const users = await authClient.db("users").collection("users").find().toArray();
  res.json(users);
});

app.get("/api/messages", async (req, res) => {
  const messages = await messagesClient.db("test").collection("messages").find().toArray();
  res.json(messages);
});

// Get user's chats route
app.get("/api/getChats", async (req, res) => {
  const { userId } = req.query;

  try {
    const chats = await authClient.db("test").collection("saved_chats").find({ user_id: userId }).toArray();
    const messages = await messagesClient.db("test").collection("messages").find({
      _id: { $in: chats.flatMap(chat => chat.messages.map(id => ObjectId(id))) }
    }).toArray();

    const messagesById = messages.reduce((acc, message) => {
      acc[message._id] = message;
      return acc;
    }, {});

    const chatsWithMessages = chats.map(chat => ({
      ...chat,
      messages: chat.messages.map(id => messagesById[id])
    }));

    res.json(chatsWithMessages);
  } catch (err) {
    console.error("Error fetching chats:", err);
    res.status(500).json({ message: "An error occurred while fetching the chats" });
  }
});

// Save chat route
app.post("/api/saveChat", async (req, res) => {
  const { chatName, userId, messages } = req.body;

  try {
    const result = await authClient.db("test").collection("saved_chats").insertOne({
      chat_name: chatName,
      user_id: userId,
      messages: messages,
    });

    res.status(201).json({ message: "Chat saved successfully", chatId: result.insertedId });
  } catch (err) {
    console.error("Error saving chat:", err);
    res.status(500).json({ message: "An error occurred while saving the chat" });
  }
});

// Save message route
app.post("/api/saveMessage", async (req, res) => {
  const { senderId, content, chatId } = req.body;

  try {
    const messageResult = await messagesClient.db("test").collection("messages").insertOne({
      sender_ID: senderId,
      content: content,
      timesent: new Date(),
    });

    const messageId = messageResult.insertedId;

    await authClient.db("test").collection("saved_chats").updateOne(
      { _id: ObjectId(chatId) },
      { $push: { messages: messageId } }
    );

    res.status(201).json({ message: "Message saved successfully" });
  } catch (err) {
    console.error("Error saving message:", err);
    res.status(500).json({ message: "An error occurred while saving the message" });
  }
});

// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password }); // Log the login attempt

  try {
    const user = await authClient.db("test").collection("users").findOne({ email });
    console.log("User found:", user); // Log the user found

    if (user) {
      console.log("User email:", user.email);
      console.log("User password:", user.password);
    }

    if (user && email.endsWith("@calbaptist.edu") && user.password === password) {
      res.status(200).json({ message: "Login successful", userId: user._id });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    console.error("Error during login:", err); // Log any errors
    res.status(500).json({ message: "An error occurred. Please try again." });
  }
});

// Sign Up route
app.post("/api/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith("@calbaptist.edu")) {
    return res.status(400).json({ message: "Invalid email domain" });
  }

  const existingUser = await authClient.db("test").collection("users").findOne({ email });
  console.log("Existing user found:", existingUser); // Log the existing user found

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const newUser = {
    email,
    password, // In a real application, make sure to hash the password before storing it
  };

  await authClient.db("test").collection("users").insertOne(newUser);
  console.log("New user created:", newUser); // Log the new user created
  res.status(201).json({ message: "User created successfully" });
});

// Update user's theme route
app.post("/api/updateTheme", async (req, res) => {
  const { userId, theme } = req.body;

  try {
    const result = await authClient.db("test").collection("users").updateOne(
      { _id: ObjectId(userId) },
      { $set: { theme: theme } }
    );

    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Theme updated successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error updating theme:", err);
    res.status(500).json({ message: "An error occurred while updating the theme" });
  }
});

// Get user's theme route
app.get("/api/getUserTheme", async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await authClient.db("test").collection("users").findOne({ _id: ObjectId(userId) });
    if (user) {
      if (!user.theme) {
        // Set default theme to light if not present
        await authClient.db("test").collection("users").updateOne(
          { _id: ObjectId(userId) },
          { $set: { theme: "light" } }
        );
        user.theme = "light";
      }
      res.status(200).json({ theme: user.theme });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error("Error fetching user theme:", err);
    res.status(500).json({ message: "An error occurred while fetching the user theme" });
  }
});

// Delete chat route
app.delete("/api/deleteChat", async (req, res) => {
  const { chatId } = req.body;

  try {
    const result = await authClient.db("test").collection("saved_chats").deleteOne({ _id: ObjectId(chatId) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Chat deleted successfully" });
    } else {
      res.status(404).json({ message: "Chat not found" });
    }
  } catch (err) {
    console.error("Error deleting chat:", err);
    res.status(500).json({ message: "An error occurred while deleting the chat" });
  }
});

// The "catchall" handler: for any request that doesn't match one above, send back React's index.html file.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html")); // Adjust "dist" to your build directory
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
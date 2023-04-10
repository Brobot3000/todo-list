// setup voor .env bestand
import * as dotenv from "dotenv";
dotenv.config();

import e from "express";
const server = e();

import { MongoClient, ObjectId } from "mongodb";

// laat de server req bodies met json content accepteren
server.use(e.json());

// cross origin setup
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET, PATCH, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// database connectie object voor interactie met de database
let db = null;

try {
  // connectie maken met de database
  const client = new MongoClient(process.env.URI);
  const connection = await client.connect();

  // database interface opslaan
  db = connection.db("todo");

  // server opstarten
  server.listen(process.env.PORT, () =>
    console.log(`Server is running on port ${process.env.PORT}.`)
  );
} catch (error) {
  console.error(error.message);
}

// routes

// de hele lijst ophalen
server.get("/", async (req, res) => {
  try {
    const cursor = await db.collection("todo_list").find().sort({ deadline: 1 });
    const todoList = await cursor.toArray();
    res.status(200).send(todoList);
  } catch (error) {
    console.error(error.message);
  }
});

// een individuele todo verkrijgen
server.get("/:id", async (req, res) => {
  try {
    const _id = new ObjectId(req.params.id);
    const cursor = await db.collection("todo_list").find({ _id });
    const singleTodo = await cursor.toArray();
    res.status(200).send(singleTodo);
  } catch (error) {
    console.error(error.message);
  }
});

// een todo toevoegen aan de database
server.post("/add", async (req, res) => {
  try {
    const { task, description, deadline } = req.body;
    const uploadData = await db.collection("todo_list").insertOne({ task, description, deadline });
    res.status(201).json({ success: "Data succesfully uploaded." });
  } catch (error) {
    console.error(error.message);
  }
});

// een todo verwijderen van de database
server.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    db.collection("todo_list").deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({ success: "Data succesfully removed." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

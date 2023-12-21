const express = require("express");
require("dotenv").config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });


  async function run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      // await client.connect();
  
      const usersCollection = client.db("taskPulse").collection("users");
     
  
      //jwt
      app.post("/jwt", async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "365d",
        });
        res.send({ token });
      });
  
      const verifyToken = (req, res, next) => {
        // console.log("inside verifyToken", req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send({ message: "Unauthorized access" });
        }
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: "Unauthorized access" });
          }
          req.decoded = decoded;
          next();
        });
      };


       //post users
    app.post("/users", verifyToken, async (req, res) => {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await usersCollection.findOne(query);
        if (!existingUser) {
          const result = await usersCollection.insertOne(user);
          res.send(result);
        } else {
          return res.send({ message: "user already exists", insertedId: null });
        }
      });
  
  
      // Send a ping to confirm a successful connection
      // await client.db("admin").command({ ping: 1 });
      // console.log(
      //   "Pinged your deployment. You successfully connected to MongoDB!"
      // );
    } finally {
      // Ensures that the client will close when you finish/error
      // await client.close();
    }
  }
  run().catch(console.dir);
  
  app.use(cors());
  app.use(express.json());
  
  app.get("/", (req, res) => {
    res.send("Task Pulse is running....");
  });
  
  app.listen(port, (req, res) => {
    console.log(`Task Pulse is running on ${port}`);
  });
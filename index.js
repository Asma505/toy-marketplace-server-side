const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x8z9fws.mongodb.net/?retryWrites=true&w=majority`;

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

    const productsCollection = client.db('sports').collection('products');

    
    app.get('/products', async (req, res) => {
      console.log(req.query);
      const limit = parseInt(req.query.limit) || 20;
      const cursor = productsCollection.find();
      const result = await cursor.limit(limit).toArray();
      res.send(result);
    })    

    app.get('/products/:id', async (req, res) => {
      const id = req.params.id;      
      const query = { _id: new ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    })

    app.get('/toy', async(req, res)=>{
      const result = await productsCollection.find().sort({"price":1}).toArray();
      res.send(result);
    })
    
    app.get('/toys', async(req, res)=>{
      const result = await productsCollection.find().sort({"price":-1}).toArray();
      res.send(result);
    })

    
    app.post('/products', async (req, res) => {
      const newToy = req.body;
      console.log(newToy);
      const result = await productsCollection.insertOne(newToy);
      res.send(result);
    })

    app.put('/products/:id', async(req, res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updatedToy = req.body;
      const toy = {
        $set: {
          description: updatedToy.description, 
          price: updatedToy.price, 
          available_quantity: updatedToy.available_quantity
        }
      }

      const result = await productsCollection.updateOne(filter, toy, options);
      res.send(result);

    })

    app.delete('/products/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('toy marketplace server is running')
})

app.listen(port, () => {
  console.log(`server is running on port: ${port}`)
})
const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
// const blog = require('./blog.json');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config();

// middle wares
app.use(cors())
app.use(express.json())

// mongodb connection with server

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster01.encrv7o.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        // database and collection create
        const database = client.db('lawyerServer')
        const collectionServer = database.collection('services')
        const faqCollection = database.collection('faq')
        const blogCollection = database.collection('blog')

        // data create and send
        app.post('/services', async (req, res) => {
            // const user = req.body;
            const user = {
                name: "Rashed",
                email: 'rashed@gmail.com'
            };
            const result = await collectionServer.insertOne(user);
            res.send(result);
            console.log(result);
        })

        // data read and view
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = collectionServer.find(query)
            const users = await cursor.toArray();
            res.send(users);
        })
        // blog data read
        app.get('/blog', async (req, res) => {
            const query = {}
            const cursor = blogCollection.find(query)
            const blog = await cursor.toArray();
            res.send(blog);
        })
        // faq data read
        app.get('/faq', async (req, res) => {
            const query = {}
            const cursor = faqCollection.find(query)
            const faq = await cursor.toArray();
            res.send(faq);
        })

        //single data read with id and view
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await collectionServer.findOne(query)
            res.send(result)
        })

        // data update and view
        app.put('/services/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const user = req.body;
            const option = { upsert: true }
            const updateUser = {
                $set: {
                    name: user.name,
                    email: user.email,
                    phone: user.phone
                }
            }
            const result = await collectionServer.updateOne(filter, updateUser, option)
            res.send(result)
        })

        // data delete 
        app.delete('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await collectionServer.deleteOne(query)
            res.send(result)
        })

    }
    finally {
        // console.log('final')
    }
}
run().catch(err => console.error(err))

// data read test
// app.get('/blog', (req, res) => {
// res.send(blog);
// })
app.get('/', (req, res) => {
    res.send('server-mongo-connect running')
})
app.listen(port, (req, res) => {
    console.log(`lawyer server mongo connect port ${port}`)
})
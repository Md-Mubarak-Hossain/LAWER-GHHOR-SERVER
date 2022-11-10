const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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

/*............................
verify user by token api
.............................*/
function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {

        // database and collection create
        const database = client.db('lawyerServer');
        const collectionServer = database.collection('services');
        const faqCollection = database.collection('faq');
        const blogCollection = database.collection('blog');
        const myreviewsCollection = database.collection('myreviews');

        /*..............................
        JWT api token
        ................................*/
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10h' })

            res.send({ token })
        })
        /*...........................
         
        My reviewer data CRUD start
         
        ............................*/

        //myreviewers data create and send

        app.post('/myreviews', async (req, res) => {
            const myreview = req.body;
            const result = await myreviewsCollection.insertOne(myreview);
            res.send(result);
            console.log(result);
        })

        // myreviews all data view by email

        app.get('/myreviews', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized access' })
            }
            let query = {}
            if (req.query.email) {
                query = { email: req.query.email }
            }
            const cursor = myreviewsCollection.find(query)
            const myreviews = await cursor.toArray();
            res.send(myreviews);
        });

        // // myreviews single  data view by id ......
        app.get('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const myreviews = await myreviewsCollection.findOne(query)
            res.send(myreviews);
        });

        // myreviews  data update

        app.patch('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const user = req.body;
            const updatemyreview = {
                $set: {
                    reviewId: user.reviewId,
                    serviceName: user.serviceName,
                    servicePrice: user.servicePrice,
                    reviewer: user.reviewer,
                    email: user.email,
                    phone: user.phone,
                    message: user.message,
                    img: user.img
                }
            }
            const result = await myreviewsCollection.updateOne(filter, updatemyreview)
            res.send(result)
        })

        //myreviews data delete 
        app.delete('/myreviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await myreviewsCollection.deleteOne(query)
            res.send(result)
        })
        /*...........................
         
               My reviewer data CRUD end
               
        ............................*/

        /*....................
        
        My services data CRUD start
         
        ..........................*/
        //services all data read and view
        app.get('/services', async (req, res) => {
            const query = {}
            const cursor = collectionServer.find(query)
            const services = await cursor.toArray();
            res.send(services);
        })
        // limit 3 data read and view
        app.get('/service', async (req, res) => {
            const query = {}
            const cursor = collectionServer.find(query)
            const service = await cursor.limit(3).toArray();
            res.send(service);
        })

        //single data read with id and view
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await collectionServer.findOne(query)
            res.send(result)
        })
        //single 3 data read with id and view
        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await collectionServer.findOne(query)
            res.send(result)
        })

        // // data update and view
        // app.put('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) }
        //     const user = req.body;
        //     const option = { upsert: true }
        //     const updateUser = {
        //         $set: {
        //             name: user.name,
        //             email: user.email,
        //             phone: user.phone
        //         }
        //     }
        //     const result = await collectionServer.updateOne(filter, updateUser, option)
        //     res.send(result)
        // })

        // // data delete 
        // app.delete('/services/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) }
        //     const result = await collectionServer.deleteOne(query)
        //     res.send(result)
        // })
        /*....................
         
         My services data CRUD end
                
        ..........................*/
        /*....................
         
         Blog and FAQ data api
                
        ..........................*/

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

        /*....................
                
         Blog and FAQ data api end
                        
        ..........................*/
    }
    finally {
        // console.log('final')
    }
}
run().catch(err => console.error(err))

// data read test
// app.get('/services', (req, res) => {
//     res.send(services);
// })
app.get('/', (req, res) => {
    res.send('server-mongo-connect running')
})
app.listen(port, (req, res) => {
    console.log(`lawyer server mongo connect port ${port}`)
})
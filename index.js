const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const mongodb = require("mongodb")
const { ObjectId } = require('mongodb'); 

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

const uri = 'mongodb://localhost:27017'
const DB = "NewsWebsite"
const Collection = "NewPosts"

const client = new mongodb.MongoClient(uri)

app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use("/public", express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "/views"))

app.get("/", async (req, res) => {
    if (req.query.search != null) {
        try {
            await client.connect();
            const database = client.db(DB);
            const collection = database.collection(Collection);
    
            if (req.query.search) {
                const searchQuery = new RegExp(req.query.search, 'i');
                const searchResults = await collection.find({ "Title": searchQuery }).toArray();

                if (searchResults.length > 0) res.render("SearchPage.html", { searchResults: searchResults })
                else res.render("NoSearchFound.html", { })
            } else {
                const mostViewedPosts = await collection.find({}).sort({ "Views": -1 }).limit(5).toArray();
                const documents = await collection.find({}).toArray();
                
                res.render("Home.html", { posts: documents, mostViewed: mostViewedPosts });
            }
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            res.status(500).send("Error fetching documents");
        }
    } else {
        try {
            await client.connect(); 
            const database = client.db(DB);
            const collection = database.collection(Collection);

            const mostViewedPosts = await collection.find({}).sort({ "Views": -1 }).limit(5).toArray();
    
            const documents = await collection.find({}).toArray();
    
            res.render("Home.html", { posts: documents, mostViewed: mostViewedPosts });
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            res.status(500).send("Error fetching documents");
        }
    }
})

app.get("/:slug", async (req, res) => {
    try {
        await client.connect(); 
        const database = client.db(DB);
        const collection = database.collection(Collection);

        await collection.findOneAndUpdate(
            { "_id": new ObjectId(req.params.slug) },
            { $inc: { "Views": 1 } }, 
        );

        const mostViewedPosts = await collection.find({}).sort({ "Views": -1 }).limit(5).toArray();

        const documentX = await collection.findOne({"_id": new ObjectId(req.params.slug)});

        res.render("Notice.html", { post: documentX, mostViewed: mostViewedPosts})
    } catch (error) {
        console.error("Failed to fetch documents:", error);
        res.status(500).send("Error fetching documents");
    }

})

const PORT = 7001
app.listen(PORT, () => {
    console.log(`News Website running on Port ${PORT}`)
})
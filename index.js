const express = require("express")
const bodyParser = require("body-parser")
const path = require("path")
const mongodb = require("mongodb")
const { ObjectId } = require('mongodb');
const fileUpload = require('express-fileupload');
const session = require('express-session')

const app = express()

const uri = 'mongodb://localhost:27017'
const DB = "NewsWebsite"
const Collection = "NewPosts"

const client = new mongodb.MongoClient(uri)

app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use("/public", express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "/views"))

app.use(fileUpload({
    createParentPath: true 
}));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.use((req, res, next) => {
    res.locals.isAdminPage = req.path.startsWith('/admin/');
    next();
});

app.use(session({
  secret: 'SECRETKEY',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

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

var Admins = [
    {
        User: "Miguel",
        Pass: "123456789"
    }
]

app.post("/admin/panel", (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    var admin = Admins.find(adm => adm.User === user);
    var password = Admins.find(adm => adm.Pass == pass);

    let errorMsg = "Invalid";

    if (!admin && !password) errorMsg += " username and password"
    else if (!admin) errorMsg += " username"
    else if (!password) errorMsg += " password"

    errorMsg += "."

    if (errorMsg != "Invalid.") res.render("admin-login", { user: user, error: errorMsg });
    else req.session.login = user

    res.redirect("/admin/panel")
});

app.get("/admin/panel", async (req, res) => {

        try {
            await client.connect();
            const database = client.db(DB);
            const collection = database.collection(Collection);
            const posts = await collection.find({}).toArray();
            res.render("admin-panel", { posts: posts });
        } catch (error) {
            console.error("Failed to fetch documents:", error);
            res.status(500).send("Error fetching documents");
        }
    
})

app.get("/admin/new-post", (req, res) => {
    res.render("admin-newpost");
});

app.post("/admin/new-post", async (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    let uploadedImage = req.files.postimage;

    const imageName = Date.now() + path.extname(uploadedImage.name);

    uploadedImage.mv(path.join(__dirname, '/public/PostsImg/', imageName), async (err) => {
        if (err)
            return res.status(500).send(err);
        try {
            await client.connect();
            const database = client.db(DB);
            const collection = database.collection(Collection);
            await collection.insertOne({
                Title: req.body.title,
                Category: req.body.category,
                By: req.body.by,
                Description: req.body.description,
                Content: req.body.content,
                Image: '/public/PostsIMG/' + imageName,
                Views: 0
            });
            res.redirect("/admin/panel");
        } catch (error) {
            console.error("Failed to add new post:", error);
            res.status(500).send("Error adding new post");
        }
    });
});

app.get("/admin/edit/:_id", async (req, res) => {
    try {
        await client.connect();
        const database = client.db(DB);
        const collection = database.collection(Collection);
        const post = await collection.findOne({ _id: new ObjectId(req.params._id) });
        res.render("admin-editpost", { post: post }); 
    } catch (error) {
        console.error("Failed to fetch post for editing:", error);
        res.status(500).send("Error fetching post for editing");
    }
});

app.post("/admin/edit/:id", async (req, res) => {    
    try {
        await client.connect();
        const database = client.db(DB);
        const collection = database.collection(Collection);

        const postId = new ObjectId(req.params.id);

        await collection.updateOne(
            { _id: postId },
            {
                $set: {
                    Title: req.body.title,
                    Category: req.body.category,
                    Description: req.body.description,
                    By: req.body.by,
                }
            }
        );

        res.redirect("/admin/panel");
    } catch (error) {
        console.error("Failed to edit post:", error);
        res.status(500).send("Error editing post");
    }
});


app.post("/admin/delete/:_id", async (req, res) => {
    try {
        await client.connect();
        const database = client.db(DB);
        const collection = database.collection(Collection);
        await collection.deleteOne({ _id: new ObjectId(req.params._id) });
        res.redirect("/admin/panel");
    } catch (error) {
        console.error("Failed to delete post:", error);
        res.status(500).send("Error deleting post");
    }
});


const PORT = 7001
app.listen(PORT, () => {
    console.log(`News Website running on Port ${PORT}`)
})
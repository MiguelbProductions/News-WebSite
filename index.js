const express = require("express")
const bodyParser = require("body-parser")

const path = require("path")

const app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

app.engine("html", require("ejs").renderFile)
app.set("view engine", "html")
app.use("public", express.static(path.join(__dirname, "public")))
app.set("views", path.join(__dirname, "/views"))

const PORT = 7001
app.listen(PORT, () => {
    console.log(`News Website running on Port ${PORT}`)
})
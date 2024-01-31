const express = require('express');
const cors = require('cors');
require('./db/connection');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const routesUser = require("./routes/user")
const routesFollow = require("./routes/follow")
const routesPublication = require("./routes/publication")


app.use ("/api/user", routesUser)
app.use ("/api/follow", routesFollow)
app.use ("/api/publication", routesPublication)

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
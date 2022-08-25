const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
const routes = require('./src/controllers/index');

routes.forEach(([name, handler]) => app.use(`/${name}`, handler));

const port = process.env.PORT;
const connectionURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/${process.env.DB_NAME}?retryWrites=true&w=majority`;
mongoose.connect(connectionURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// console.log({ connectionURI });

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('DB Connected!');
});

app.listen(port, () => {
    console.log(`Process ${process.pid}, ${port} ${process.env.NODE_ENV}`);
});

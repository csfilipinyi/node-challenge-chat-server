const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

const port = 3001;

app.use(express.json());
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const welcomeMessage = {
  id: 0,
  from: 'Bart',
  text: 'Welcome to CYF chat system!',
};

//This array is our "data store".
//We will start with one message in the array.
//Note: messages will be lost when Glitch restarts our server.
const messages = [welcomeMessage];

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.get('/messages/:id', (req, res) => {
  const { id } = req.params;
  const msg = messages.find(message => message.id === parseInt(id));

  if (msg !== undefined) {
    res.json(msg);
  } else {
    res.status(404).send();
  }
});

app.delete('/messages/:id', (req, res) => {
  const { id } = req.params;
  let index = messages.findIndex(message => message.id === parseInt(id));

  if (index === -1) {
    res.status(404).send();
  } else {
    messages.splice(index, 1);
    res.status(200).send();
  }
});

app.put('/messages/:id', (req, res) => {
  const { id } = req.params;
  let msg = messages.find(message => message.id === parseInt(id));
  let newMsg = req.body;

  msg.text = newMsg.text;
  res.status(200).send();
});

app.get('/messages', (req, res) => {
  const { text, sort, limit } = req.query;
  let foundMessages = messages.slice();

  if (text !== undefined) {
    foundMessages = messages.filter(msg => msg.text.includes(text));
  }

  if (sort !== undefined && sort === 'id') {
    foundMessages.sort(function (msg1, msg2) {
      return msg2.id - msg1.id;
    });
  }

  if (limit !== undefined) {
    foundMessages = foundMessages.slice(0, Number(limit));
  }

  res.json(foundMessages);
});

app.post('/messages', (req, res) => {
  let newMsg = req.body;

  if (validateMsg(newMsg)) {
    newMsg.id = createId();
    newMsg.timeSent = new Date();
    messages.push(newMsg);
    res.status(200).send();
  } else {
    res.status(400).send();
  }
});

function validateMsg(newMsg) {
  if (
    newMsg !== undefined &&
    newMsg.from !== undefined &&
    newMsg.from.length !== 0 &&
    newMsg.text !== undefined &&
    newMsg.text.length !== 0
  )
    return true;
  return false;
}

function createId() {
  let newId = messages[messages.length - 1].id + 1;
  return newId;
}

app.listen(port, () =>
  console.log(`[MockServer] listening at http://localhost:${port}`)
);

const express = require('express');
const bcrypt = require('bcrypt');
const getConnection = require('./config.js');
const app = express();
const port = 5000;

app.use(express.json());

getConnection
  .then((connection) => {
    console.log('connected as id ' + connection.threadId);

    // GET requests
    //this route is for dev purposes only
    app.get('/users', (req, res) => {
      connection
        .execute('SELECT * FROM users')
        .then(([users]) => {
          res.send(users);
        })
        .catch((err) => res.status(500).send('Error retrieving users'));
    });

    // POST requests

    app.post('/users', async (req, res) => {
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(req.body.password, salt);

      const user = {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPassword,
      };

      connection
        .execute(
          'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
          [user.firstname, user.lastname, user.email, user.password]
        )
        .then(([queryResult]) => {
          res.send({
            ...user,
            id: queryResult.insertId,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send('Error saving new user');
        });
    });
  })
  .catch((err) => {
    if (err) {
      console.error('error connecting: ' + err.stack);
      return;
    }
  });

const users = [];

// app.get('/users', (req, res) => {
//   res.json(users);
// });

// app.post('/users', async (req, res) => {
//   try {
//     const salt = await bcrypt.genSalt();
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);
//     // const hashedPassword = await bcrypt.hash(req.body.password, 10); => shortcut, the salt const can be ignored

//     const user = { name: req.body.name, password: hashedPassword };
//     users.push(user);
//     res.status(201).send();
//   } catch {
//     res.status(500).send();
//   }
// });

app.post('/users/login', async (req, res) => {
  const user = users.find((user) => user.name === req.body.name);

  if (!user) {
    return res.status(400).send('Cannot find user');
  }

  try {
    if (await bcrypt.compare(req.body.password, user.password)) {
      res.send('Success');
    } else {
      res.send('Not allowed');
    }
  } catch {
    res.status(500).send();
  }
});

app.listen(port, () => {
  console.log(`Server is running on ${port}`);
});

require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// create custome message in the middleweare s
morgan.token("log_obj", function (req) {
  return `${JSON.stringify(req.body)}`;
});

app.use(express.static("build"));
app.use(cors());
app.use(express.json());
app.use(morgan(":method :url :status :response-time :req[header] :log_obj"));

const Person = require("./models/person");

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
  });
});

app.get("/api/info", (request, response) => {
  const dateTime = new Date();
  console.log("date time", dateTime);
  response.send(`<p>Phonebook has info for ${persons.length} people.</p>
    <br>
    <p>${dateTime}</p>`);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);
  console.log("person", person);
  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.post("/api/persons/", (request, response) => {
  const id = Math.floor(Math.random() * 1000);
  const person = request.body;
  console.log(person);

  // check if object is empty
  if (Object.keys(person).length < 1) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  // name and number must be in object
  if (!("name" in person) || !("number" in person)) {
    return response.status(400).json({
      error: "content missing",
    });
  }

  // check if duplicate name
  if (
    persons.filter((person_in_array) => person.name === person_in_array.name)
      .length > 0
  ) {
    return response.status(400).json({
      error: "Must be unique",
    });
  }

  person.id = id;
  persons.push(person);

  console.log(persons);
  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

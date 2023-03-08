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

app.get("/api/persons", (request, response) => {
  console.log("entering /api/persons");
  console.log("Person", Person);
  Person.find({}).then((result) => {
    response.send(result);
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
  /*
  if (
    Person.filter((person_in_array) => person.name === person_in_array.name)
      .length > 0
  ) {
    return response.status(400).json({
      error: "Must be unique",
    });
  }
  */

  person.id = id;
  //persons.push(person);
  const new_person = new Person({
    id: person.id,
    name: person.name,
    number: person.number,
  });

  new_person.save().then((result) => {
    console.log("new person saved!");
  });

  response.json(person);
});

app.delete("/api/persons/:id", (request, response) => {
  //const id = Number(request.params.id);
  //console.log("id: ", id);

  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  console.log("unknown end point");
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  }

  next(error);
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

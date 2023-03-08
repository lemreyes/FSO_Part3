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

// get all persons
app.get("/api/persons", (request, response, next) => {
  console.log("entering /api/persons");
  console.log("Person", Person);
  Person.find({})
    .then((result) => {
      response.send(result);
    })
    .catch((error) => next(error));
});

// get info
app.get("/api/info", (request, response) => {
  const dateTime = new Date();
  console.log("date time", dateTime);
  response.send(`<p>Phonebook has info for ${persons.length} people.</p>
    <br>
    <p>${dateTime}</p>`);
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((result) => {
      console.log("Response: ", result);
      if (result) {
        response.json(result);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.post("/api/persons/", (request, response, next) => {
  const id = Math.floor(Math.random() * 1000);
  const person = request.body;
  console.log(person);

  try {
    // check if object is empty
    if (Object.keys(person).length < 1) {
      throw new Error("Content missing");
    }

    // name and number must be in object
    if (!("name" in person) || !("number" in person)) {
      throw new Error("Content missing");
    }
  } catch (error) {
    return next(error);
  }

  // check if duplicate name
  Person.findOne({ name: person.name })
    .then((result) => {
      console.log("findOne result: ", result);
      if (result) {
        throw new Error("Must be unique");
      } else {
        console.log("Not duplicate, can proceed");
      }
    })
    .catch((error) => {
      return next(error);
    });

  person.id = id;
  const new_person = new Person({
    id: person.id,
    name: person.name,
    number: person.number,
  });

  new_person
    .save()
    .then((result) => {
      console.log("new person saved!", result);
      response.json(result);
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response, next) => {
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
  console.log(error.message);

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

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
  const person = request.body;
  console.log("POST: /api/persons/");
  console.log("request.body", person);

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
    console.log("catch error Content missing");
    return next(error);
  }

  // check if duplicate name
  console.log("findOne");
  console.log("name", person.name);
  Person.findOneAndUpdate({ name: person.name }, person)
    .then((result) => {
      console.log("findOne result: ", result);
      if (result) {
        // return the result of update
        console.log("performed the Update", result);
        return response.json(result);
      } else {
        console.log("Not duplicate, can proceed");
        console.log("create new person object");
        const new_person = new Person({
          name: person.name,
          number: person.number,
        });

        console.log("save new person object into DB");
        new_person
          .save()
          .then((result) => {
            console.log("new person saved!", result);
            response.json(result);
          })
          .catch((error) => next(error));
      }
    })
    .catch((error) => {
      console.log("Catch findOne");
      return next(error);
    });
});

app.put("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  const name = request.params.name;
  const number = request.params.number;

  console.log("PUT /api/persons", {});
  console.log("ID: ", id);
  console.log("name: ", name);
  console.log("number: ", number);

  Person.findByIdAndUpdate(id, { name: name, number: number })
    .then((result) => {
      console.log("findbyIDandUpdate result: ", result);
      return response.json(result);
    })
    .catch((error) => {
      return next(error);
    });
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
  console.log("Error handler: ", error);
  console.log("error name: ", error.name);
  console.log("error message: ", error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.message === "Content missing") {
    return response.status(400).send({ error: "content missing" });
  } else if (error.message === "Must be unique") {
    return response.status(400).send({ error: "Must be unique" });
  } else if (error.name === "ValidationError") {
    return response.status(400).send({ error: error.message });
  } else {
    next(error);
  }
};

// this has to be the last loaded middleware.
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

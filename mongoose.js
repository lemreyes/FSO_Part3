const mongoose = require("mongoose");

if (process.argv.length < 4) {
  console.log("give password as argument");
  process.exit(1);
}

const username = process.argv[2];
const password = process.argv[3];

const url = `mongodb+srv://${username}:${password}@cluster0.n6x7l.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set("strictQuery", false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  id: Number,
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 4) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person);
    });
    mongoose.connection.close();
  });
}

if (process.argv.length > 4) {
  const name_arg = process.argv[4];
  const num_arg = process.argv[5];

  const person = new Person({
    name: name_arg,
    number: num_arg,
  });

  person.save().then((result) => {
    console.log("new person saved!");
    mongoose.connection.close();
  });
}

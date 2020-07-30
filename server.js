const express = require("express");
const mongodb = require("mongodb");
const cors = require("cors");

require("dotenv").config();

const mongoOptions = { useUnifiedTopology: true };

const uri = process.env.DATABASE_URI;

const client = new mongodb.MongoClient(uri, mongoOptions);

const app = express();
app.use(express.json()).use(cors());

client.connect(function () {
  const db = client.db("mongo-week3");

  app.get("/films", function (request, response) {
    const collection = db.collection("movies");

    collection.find().toArray((error, result) => {
      response.send(error || result);
      // client.close();
    });

    // get collection (movies)
    // find (all the movies ) -> cursor
    // convert toArray
    // callback which has the data
    //  if everything is ok -> send the data (200 default)
    //  otherwise -> send an error response (500)

    // find according to a search
    // write the react code
    // response.send("Retrieve all the films");
  });

  app.get("/films/:id", function (request, response) {
    // get collection (movie)
    const collection = db.collection("movies");

    // check if the id is valid if not -> 404
    if (!mongodb.ObjectID.isValid(request.params.id)) {
      return response.sendStatus(404);
    }
    // define id (mongodb.ObjectID)
    const id = new mongodb.ObjectID(request.params.id);

    // queryObject = {_id: id}
    const queryObject = { _id: id };

    // collection.findOne
    collection.findOne(queryObject, (error, result) => {
      if (error) {
        return response.status(500).send(error);
      }

      if (!result) {
        // if no record ->
        return response.sendStatus(404);
      }

      // if record -> send the data (200 default)
      return response.send(result);
    });

    // response.send("Retrieve one film");
  });

  // check properties (required or none existent)
  // function validateObject(requestBody) {
  //   return null;
  // }

  app.post("/films", function (request, response) {
    // get collection (movies)
    const collection = db.collection("movies");

    // get data from request.body (NOT the query...)
    const data = request.body; // validation should happen here

    // if there are any missing mandatory properties then return an error message to the API user and stop

    function findMissingFields(data, mandatoryFields) {
      return mandatoryFields.filter((field) => !data.hasOwnProperty(field));
    }

    // computed object properties

    const missingFields = findMissingFields(data, ["title", "year"]);

    if (missingFields.length > 0) {
      const errorInfo = {
        error: {
          description: `missing fields`,
          missingFields: missingFields,
        },
      };
      return response.status(400).send(errorInfo);
    }

    // collection.insertOne(data, function (error, result))
    collection.insertOne(data, (error, result) => {
      // if everything is not ok -> send error response (500)
      if (error) {
        console.log(error);
        return response.sendStatus(500);
      }
      // if everything is ok -> send returned record (a bit tricky to find it...)
      return response.send(result.ops[0]);
    });

    // response.send("Create a film");
  });

  app.put("/films/:id", function (request, response) {
    // get collection
    const collection = db.collection("movies");

    // define id (mongodb.ObjectID)
    const id = new mongodb.ObjectID(request.params.id);

    const searchObject = { _id: id };

    delete request.body._id;

    const data = { $set: request.body }; // --> { $set: XX{ _id: objectId('asdf')}XX, title: 'Batman Begins'}}
    const options = { returnOriginal: false }; // DON'T send back the original record, send back the UPDATED record
    collection.findOneAndUpdate(
      searchObject,
      data,
      options,
      (error, result) => {
        if (error) {
          return response.status(500).send(error);
        }
        return response.send(result.value); // result.value === result.ops[0]
      }
    );

    // response.send("Update one film");
  });

  app.delete("/films/:id", function (request, response) {
    // get collection
    const collection = db.collection("movies");

    // define id (mongodb.ObjectID)
    const id = new mongodb.ObjectID(request.params.id);

    const searchObject = { _id: id };

    delete request.body._id;

    const options = { returnOriginal: true }; // DON'T send back the original record, send back the UPDATED record
    collection.findOneAndDelete(searchObject, options, (error, result) => {
      if (error) {
        return response.status(500).send(error);
      }
      return response.send(result.value); // result.value === result.ops[0]
    });

    // response.send("Delete one film");
  });

  app.listen(3000);
});

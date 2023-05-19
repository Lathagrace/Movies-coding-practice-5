const express = require("express");
const {open} = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname,"moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDBAndServer = async() => {
    try{
        database = await open({
            fileName: databasePath,
            driver: sqlite3.Database,
        });
        app.listen(3000, () => 
            console.log("Server Running at http://localhost:3000/");
        );
    } catch (error) {
        console.log(`DB Error: ${error.message}`);
        process.exit(1);
    }
};

initializeDBAndServer();

const convertMovieDBObjectToResponseObject = (dbObject) => {
    return{
        movieId: dbObject.movie_id;
        directorId: dbObject.director_id;
        movieName: dbObject.movie_name;
        leadActor: dbObject.lead_actor;
    };
};

const convertDirectorDBObjectToResponseObject = (dbObject) => {
    return{
        directorId: dbObject.director_id;
        directorName: dbObject.director_name;
    };
};

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie;`;
  const movieArray = await database.all(getMoviesQuery);
  response.send(
      movieArray.map((eachMovie) => ({movieName: eachMovie.movie_name}))
  );
});

app.get("/movies/:movieId/", async (request, response) => {
  const {movieId} = request.params;
  const getMoviesQuery = `
    SELECT
      *
    FROM
      movie
    WHERE 
      movie_id = ${movieId};`;
  const movie = await database.get(getMoviesQuery);
  response.send(convertMovieDBObjectToResponseObject(movie));
});

app.post("/movies/", async (request, response) => {
    const {directorId,movieName,leadActor} = request.body;
    const postMoviesQuery = `
    INSERT INTO
        movie (director_id,movie_name,lead_actor)
    VALUES
        (${directorId},'${movieName}', '${leadActor}');`;
    await database.run(postMoviesQuery);
    response.send("Movie Successfully Added")
});

app.put("/movies/:movieId/", async (request, response) => {
    const {directorId,movieName,leadActor} = request.body;
    const {movieId} = request.params;
    const updateMoviesQuery = `
    UPDATE
        movie
    SET 
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE 
        movie_id = ${movieId};`;

    await database.run(updateMoviesQuery);
    response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { MovieId } = request.params;
  const deleteMoviesQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await database.run(deleteMoviesQuery);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
    SELECT
      *
    FROM
      director;`;
  const directorArray = await database.all(getDirectorsQuery);
  response.send(
      directorArray.map((eachDirector) => 
      convertDirectorDBObjectToResponseObject(eachDirector)
    )
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
    const {directorId} = request.params;
    const getDirectorMoviesQuery = `
       SELECT
          movie_name
       FROM
          movie
       WHERE 
          director_id = ${directorId};`;
    const movieArray = await database.all(getDirectorMoviesQuery);
    response.send(
      movieArray.map((eachMovie) => ({movieName: eachMovie.movie_name}))
    );
});
module.exports = app
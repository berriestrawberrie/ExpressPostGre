import express, { type Request, type Response } from "express";
import pg from "pg";
import dotenv from "dotenv";
import { z } from "zod";
import { InvalidatedProjectKind } from "typescript";

dotenv.config();
const app = express();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
});

app.use(express.json());

const PlayerScoreSchema = z.object({
  name: z.string(),
  game_id: z.int().nullable(),
  score: z.number().nullable(),
  join_date: z.date(),
});

app.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, scores.game_id, scores.score, players.join_date FROM players LEFT JOIN scores ON scores.player_id = players.id"
    );
    const parseData = z.array(PlayerScoreSchema).safeParse(result.rows);

    //IF RESPONSE WITH FAIL
    if (!parseData.success) {
      return res
        .status(500)
        .send({ error: "Invalid data format", details: parseData.error });
    }
    if (parseData.data.length === 0) {
      res.status(404).send({ message: "No data found." });
    }

    res.json(parseData.data);
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});

const TopPlayerSchema = z.object({
  name: z.string(),
  total_score: z.string().nullable(),
});
app.get("/top-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, SUM(scores.score) AS total_score FROM players JOIN scores ON players.id = scores.player_id GROUP BY players.name ORDER BY total_score DESC LIMIT 3"
    );
    const parseData = z.array(TopPlayerSchema).safeParse(result.rows);
    //IF RESPONSE WITH FAIL
    if (!parseData.success) {
      return res
        .status(500)
        .send({ error: "Invalid data format", details: parseData.error });
    }
    if (parseData.data.length === 0) {
      res.status(404).send({ message: "No data found." });
    }

    res.json(parseData.data);
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});

const InactivePlayerSchema = z.object({
  name: z.string(),
  games_played: z.string(),
});
app.get("/inactive-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, COUNT(scores.game_id) AS games_played FROM players LEFT JOIN scores ON players.id = scores.player_id GROUP BY players.name HAVING COUNT(scores.game_id) = 0"
    );
    const parseData = z.array(InactivePlayerSchema).safeParse(result.rows);
    //IF RESPONSE WITH FAIL
    if (!parseData.success) {
      return res
        .status(500)
        .send({ error: "Invalid data format", details: parseData.error });
    }
    if (parseData.data.length === 0) {
      res.status(404).send({ message: "No data found." });
    }

    res.json(parseData.data);
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});
const PopularGenreSchema = z.object({
  genre: z.string(),
  num_players: z.string(),
});
app.get("/popular-genres", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT games.genre, COUNT(scores.player_id) AS num_players FROM games LEFT JOIN scores ON games.id = scores.game_id GROUP BY games.genre ORDER BY num_players DESC"
    );

    const parseData = z.array(PopularGenreSchema).safeParse(result.rows);

    //IF RESPONSE WITH FAIL
    if (!parseData.success) {
      return res
        .status(500)
        .send({ error: "Invalid data format", details: parseData.error });
    }
    if (parseData.data.length === 0) {
      res.status(404).send({ message: "No data found." });
    }
    res.json(parseData.data);
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});

const RecentPlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  join_date: z.date(),
});
app.get("/recent-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, join_date FROM players WHERE join_date >= CURRENT_DATE - INTERVAL '30 days';"
    );

    const parseData = z.array(RecentPlayerSchema).safeParse(result.rows);
    //IF RESPONSE WITH FAIL
    if (!parseData.success) {
      return res
        .status(500)
        .send({ error: "Invalid data format", details: parseData.error });
    }
    if (parseData.data.length === 0) {
      res.status(404).send({ message: "No data found." });
    }
    res.json(parseData.data);
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});

app.get("/favorite-games", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, games.title AS game_title, scores.score AS high_score FROM players JOIN scores ON scores.player_id = players.id JOIN games ON scores.game_id = games.id WHERE scores.score = (SELECT MAX(s2.score) FROM scores s2 WHERE s2.player_id = players.id)"
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "No data found." });
    } else {
      res.json(result.rows);
    }
  } catch (error: unknown) {
    res.status(500).send(error.message);
  }
});
app.listen(3000, () => {
  console.log("Server is running on port: 3000.");
});

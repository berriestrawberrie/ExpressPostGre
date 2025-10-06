import express, { type Request, type Response } from "express";
import pg from "pg";
import dotenv from "dotenv";

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

app.get("/top-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, SUM(scores.score) AS total_score FROM players JOIN scores ON players.id = scores.player_id GROUP BY players.name ORDER BY total_score DESC LIMIT 3"
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get("/inactive-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT players.name, COUNT(scores.game_id) AS games_played FROM players LEFT JOIN scores ON players.id = scores.player_id GROUP BY players.name HAVING COUNT(scores.game_id) = 0"
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get("/popular-genres", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT games.genre, COUNT(scores.player_id) AS num_players FROM games LEFT JOIN scores ON games.id = scores.game_id GROUP BY games.genre ORDER BY num_players DESC"
    );
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).send(error.message);
  }
});

app.get("/recent-players", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      "SELECT id, name, join_date FROM players WHERE join_date >= CURRENT_DATE - INTERVAL '30 days';"
    );
    if (result.rows.length === 0) {
      res.status(404).json({ message: "No data found." });
    } else {
      res.json(result.rows);
    }
  } catch (error: any) {}
});

app.listen(3000, () => {
  console.log("Server is running on port: 3000.");
});

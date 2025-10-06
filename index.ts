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
app.listen(3000, () => {
  console.log("Server is running on port: 3000.");
});

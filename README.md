# 🎮 Express PostGre Practice

## 📘 Description

In this assignment, you’ll build on your PostgreSQL skills by integrating it with Node.js and Express.
You’ll create an API that performs advanced database queries similar to those you practiced last week.

## ⚙️ Installation

1. Clone the repository

   ```bash
   git clone https://github.com/berriestrawberrie/ExpressPostGre
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Start Docker

   ```bash
   docker-compose up
   ```

4. Run the server
   ```bash
   npx ts-node index.ts
   ```

## 🚀 Using the API

Visit [localhost:3000](http://localhost:3000)

Displays all the players in the table joined to their score data

### Endpoint: `GET /top-players`

Returns the top 3 players with the highest total scores across all games, sorted in descending order.

### Endpoint: `GET /inactive-players`

Lists all players who haven’t played any games yet.

### Endpoint: `GET /popular-genres`

Finds the most popular game genres based on the number of times they’ve been played

### Endpoint: `GET /recent-players`

Lists all players who joined in the last 30 days.

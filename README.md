# Pizza Ordering System

This is a Full Stack Web Application created as a homework assignment.

## Project Overview
This application serves as a simple Pizza Ordering System where users can order pizzas, view their active orders, edit them or cancel them. It meets all the requirements of the May 2026 assignment.

## System Requirements
- Node.js (v14+ recommended)
- A modern web browser (Chrome, Firefox, Safari)

## Installation
1. Clone the repository.
2. Open terminal and navigate to the project directory.
3. Run `npm install` to install all required dependencies (express, cors, body-parser).

## API Documentation
The application exposes standard RESTful endpoints on `http://localhost:3000/api/orders`.
- `GET /api/orders` - Retrieves a list of all pizza orders.
- `GET /api/orders/:id` - Retrieves a specific pizza order by its ID.
- `POST /api/orders` - Creates a new order. Requires user input: `customerName`, `pizzaType`, `size`, `quantity`.
- `PUT /api/orders/:id` - Updates an existing order.
- `DELETE /api/orders/:id` - Deletes the specified order.

## Execution
1. Run `node server.js`
2. Open your web browser and navigate to `http://localhost:3000`

## Troubleshooting
- If you get an error that the port is already in use, make sure you don't have another application running on port 3000. Look in `server.js` and change the `PORT` variable if needed.
- ensure that `data/orders.json` has read/write permissions since this file acts as our persistent database.

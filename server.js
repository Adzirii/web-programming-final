const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'data', 'orders.json');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            return [];
        }
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error("Error reading data:", err);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
        console.error("Error writing data:", err);
    }
}

app.get('/api/orders', (req, res) => {
    const orders = readData();
    res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
    const orders = readData();
    const order = orders.find(o => o.id === req.params.id);
    if (!order) {
        return res.status(404).json({ error: "Order not found" });
    }
    res.json(order);
});

app.post('/api/orders', (req, res) => {
    const { customerName, pizzaType, size, quantity } = req.body;
    
    if (!customerName || !pizzaType || !size || !quantity) {
        return res.status(400).json({ error: "All fields are required" });
    }
    
    if (quantity < 1 || quantity > 20) {
        return res.status(400).json({ error: "Quantity must be between 1 and 20" });
    }

    const orders = readData();
    const newOrder = {
        id: Date.now().toString(),
        customerName,
        pizzaType,
        size,
        quantity: parseInt(quantity, 10),
        status: "Pending",
        createdAt: new Date().toISOString()
    };
    
    orders.push(newOrder);
    writeData(orders);
    
    res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
    const { customerName, pizzaType, size, quantity, status } = req.body;
    const orders = readData();
    const orderIndex = orders.findIndex(o => o.id === req.params.id);
    
    if (orderIndex === -1) {
        return res.status(404).json({ error: "Order not found" });
    }
    
    if (!customerName || !pizzaType || !size || !quantity) {
        return res.status(400).json({ error: "All fields are required" });
    }

    orders[orderIndex] = {
        ...orders[orderIndex],
        customerName,
        pizzaType,
        size,
        quantity: parseInt(quantity, 10),
        status: status || orders[orderIndex].status
    };
    
    writeData(orders);
    res.json(orders[orderIndex]);
});

app.delete('/api/orders/:id', (req, res) => {
    const orders = readData();
    const newOrders = orders.filter(o => o.id !== req.params.id);
    
    if (orders.length === newOrders.length) {
        return res.status(404).json({ error: "Order not found" });
    }
    
    writeData(newOrders);
    res.json({ message: "Order deleted successfully" });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

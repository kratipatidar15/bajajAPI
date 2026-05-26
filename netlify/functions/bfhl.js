const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const handlePost = (req, res) => {
    try {
        const { data } = req.body;

        if (!data || !Array.isArray(data)) {
            return res.status(400).json({
                is_success: false,
                message: "Invalid input. 'data' must be an array."
            });
        }

        const numbers = [];
        const alphabets = [];

        for (const item of data) {
            const str = String(item).trim();
            if (/^\d+$/.test(str)) {
                numbers.push(str);
            } else if (/^[a-zA-Z]$/.test(str)) {
                alphabets.push(str);
            }
        }

        return res.json({
            is_success: true,
            user_id: "krati_patidar_ddmmyyyy",
            email: "kratipatidar230124@acropolis.in",
            roll_number: "0827CI231063",
            numbers: numbers,
            alphabets: alphabets
        });
    } catch (error) {
        return res.status(500).json({
            is_success: false,
            message: error.message
        });
    }
};

const handleGet = (req, res) => {
    return res.status(200).json({
        operation_code: 1
    });
};

// Mount route handlers on multiple endpoints to ensure routing matches correctly
app.post('/bfhl', handlePost);
app.get('/bfhl', handleGet);

app.post('/api/bfhl', handlePost);
app.get('/api/bfhl', handleGet);

app.post('/', handlePost);
app.get('/', handleGet);

// Fallback/catch-all
app.use((req, res) => {
    if (req.method === 'POST') {
        return handlePost(req, res);
    } else if (req.method === 'GET') {
        return handleGet(req, res);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
});

module.exports.handler = serverless(app);

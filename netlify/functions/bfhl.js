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

        const odd_numbers = [];
        const even_numbers = [];
        const alphabets = [];
        const special_characters = [];
        let total_sum = 0;
        const original_alphabets = [];

        for (const item of data) {
            const str = String(item).trim();
            if (/^\d+$/.test(str)) {
                const num = parseInt(str, 10);
                if (num % 2 === 0) {
                    even_numbers.push(str);
                } else {
                    odd_numbers.push(str);
                }
                total_sum += num;
            } else if (/^[a-zA-Z]$/.test(str)) {
                alphabets.push(str.toUpperCase());
                original_alphabets.push(str);
            } else if (str.length > 0) {
                special_characters.push(str);
            }
        }

        // concat_string logic:
        // - concatenate all alphabetical characters in their original case in order of appearance
        // - reverse the concatenated string
        // - convert alternating caps (starting with upper case, i.e., index 0 upper, index 1 lower, etc.)
        const combined = original_alphabets.join('');
        const reversed = combined.split('').reverse().join('');
        let alternating_caps = '';
        for (let i = 0; i < reversed.length; i++) {
            if (i % 2 === 0) {
                alternating_caps += reversed[i].toUpperCase();
            } else {
                alternating_caps += reversed[i].toLowerCase();
            }
        }

        return res.json({
            is_success: true,
            user_id: "krati_patidar_15042005",
            email: "kratipatidar230124@acropolis.in",
            roll_number: "0827CI231063",
            odd_numbers: odd_numbers,
            even_numbers: even_numbers,
            alphabets: alphabets,
            special_characters: special_characters,
            sum: String(total_sum),
            concat_string: alternating_caps
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

const handleHealth = (req, res) => {
    return res.status(200).json({
        status: "healthy",
        message: "API is up and running"
    });
};

// Mount route handlers on multiple endpoints to ensure routing matches correctly
app.post('/bfhl', handlePost);
app.get('/bfhl', handleGet);

app.post('/api/bfhl', handlePost);
app.get('/api/bfhl', handleGet);

app.get('/health', handleHealth);
app.get('/api/health', handleHealth);

app.post('/', handlePost);
app.get('/', handleGet);

// Fallback/catch-all
app.use((req, res) => {
    const path = req.path.toLowerCase();
    if (path.includes('health')) {
        return handleHealth(req, res);
    }
    if (req.method === 'POST') {
        return handlePost(req, res);
    } else if (req.method === 'GET') {
        return handleGet(req, res);
    }
    return res.status(405).json({ error: 'Method Not Allowed' });
});

module.exports.handler = serverless(app);

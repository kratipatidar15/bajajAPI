const axios = require('axios');

exports.handler = async function(event, context) {
    // Handle CORS preflight request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "GET, OPTIONS"
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    const email = event.queryStringParameters.email || process.env.USER_EMAIL;

    if (!email) {
        return {
            statusCode: 400,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ error: 'Missing email query parameter' })
        };
    }

    try {
        console.log(`Fetching data for email: ${email}`);
        
        // Step 1: Fetch data
        const getResponse = await axios.get(`https://dev-api.healthrx.co.in/campus-hiring/input?email=${email}`, {
            headers: { 'Accept': 'application/json' }
        });
        
        const data = getResponse.data;
        
        // Extract secret and array of numbers from the response payload dynamically
        let arr = [];
        let secret = '';
        
        for (const key in data) {
            if (Array.isArray(data[key])) {
                arr = data[key];
            } else if (typeof data[key] === 'string' && key.toLowerCase().includes('secret')) {
                secret = data[key];
            }
        }
        
        if (!arr || arr.length === 0) {
           return {
               statusCode: 400,
               headers: { "Access-Control-Allow-Origin": "*" },
               body: JSON.stringify({ error: 'Could not find array of numbers in API response', data })
           };
        }

        // Step 2: Calculate metrics
        const count = arr.length;
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        
        const sum = arr.reduce((a, b) => a + b, 0);
        const mean = parseFloat((sum / count).toFixed(2));
        
        // Median
        const sorted = [...arr].sort((a, b) => a - b);
        const mid = Math.floor(count / 2);
        const median = count % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
        
        // Mode
        const frequency = {};
        let maxFreq = 0;
        let mode = [];
        for (const num of arr) {
            frequency[num] = (frequency[num] || 0) + 1;
            if (frequency[num] > maxFreq) {
                maxFreq = frequency[num];
            }
        }
        for (const key in frequency) {
            if (frequency[key] === maxFreq) {
                mode.push(Number(key));
            }
        }
        
        // Use the first mode if multiple exist, or adjust based on specific rules if known.
        const modeResult = mode[0];

        const payload = {
            "Size": count,
            "Mean": mean,
            "Median": median,
            "Mode": modeResult,
            "Min": min,
            "Max": max,
            "Secret": secret
        };
        
        console.log("Calculated metrics:", payload);

        // Step 3: POST request
        const postResponse = await axios.post(`https://dev-api.healthrx.co.in/campus-hiring/submit?email=${email}`, payload, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log("Submission successful");

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type"
            },
            body: JSON.stringify({
                message: "Successfully processed and submitted metrics",
                metrics_calculated: payload,
                submission_response: postResponse.data
            })
        };

    } catch (error) {
        console.error("Error processing request:", error.response ? error.response.data : error.message);
        return {
            statusCode: error.response ? error.response.status : 500,
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            body: JSON.stringify({
                error: "Failed to process request",
                details: error.response ? error.response.data : error.message
            })
        };
    }
}

const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const VENICE_AI_CONFIG = {
    baseUrl: 'https://outerface.venice.ai/api/inference/chat',
    headers: {
        'authority': 'outerface.venice.ai',
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9',
        'content-type': 'application/json',
        'origin': 'https://venice.ai',
        'referer': 'https://venice.ai/',
        'sec-ch-ua': '"Chromium";v="137", "Not/A)Brand";v="24"',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36',
        'x-venice-version': 'interface@20250626.212124+945291c',
    },
    cookies: {
        '_gcl_au': '1.1.329263119.1750998023',
        '_fbp': 'fb.1.1750998024226.311392533836643191',
        '_dcid': 'dcid.1.1750998025185.736259404',
        '__client_uat': '0',
        '__client_uat_aKq7rGhf': '0',
        '__stripe_mid': '6c48ddc6-76cc-46fc-8a50-e666d3b079d584dfb5',
        '__stripe_sid': 'b157457f-0baf-4e2f-be1d-a2e11f9d552f45e4f5',
        'ph_phc_4Yg9V0hm9Lgavwcr6LZACe64tya7UqfyHePVNOzYREF_posthog': '%7B%22distinct_id%22%3A%220197af9d-7fe5-7447-8a56-b00f36b35b27%22%2C%22%24sesid%22%3A%5B1750998158559%2C%220197af9d-7fe1-7309-b568-e2f29c3a4882%22%2C1750998024161%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Fvenice.ai%2F%22%7D%7D',
    }
};

app.post('/api/chat', async (req, res) => {
    try {
        const payload = req.body;

        const cookieString = Object.entries(VENICE_AI_CONFIG.cookies)
            .map(([key, value]) => `${key}=${value}`)
            .join('; ');

        const headers = {
            ...VENICE_AI_CONFIG.headers,
            'Cookie': cookieString,
            'Content-Length': Buffer.byteLength(JSON.stringify(payload))
        };

        const options = {
            hostname: 'outerface.venice.ai',
            path: '/api/inference/chat',
            method: 'POST',
            headers: headers
        };

        const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                res.send(data);
            });
        });

        request.on('error', (error) => {
            console.error('Request error:', error);
            res.status(500).json({ error: error.message });
        });

        request.write(JSON.stringify(payload));
        request.end();

    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SALMAN'S AI Server running on port ${PORT}`);
});

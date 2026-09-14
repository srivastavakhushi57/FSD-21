const http = require('http');

const server = http.createServer((req, res) => {

    if (req.url === '/') {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });

        res.end('Hello World');
    } 
    else {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });

        res.end('404 - Page Not Found');
    }
});

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
import { createServer } from 'node:http';

const port = process.env.PORT;

export const initApp = () => {
  const server = createServer((req, res) => {
    console.log(`Method: `, req.method);
    console.log(`Http version: `, req.httpVersion);
    console.log(`Http version: `, req.url);
    console.log(`Headers: `, req.headers);

    res.writeHead(200);
    res.end();
  });

  server.listen(port, () => {
    console.log(`Server is listening on PORT ${port}`);
  });
};

import cluster from 'cluster';
import os from 'node:os';
import app from './App.js';

const port = process.env.PORT || 9000;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  const numCpus = os.cpus().length;
  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  // Start the Express server.
  app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}

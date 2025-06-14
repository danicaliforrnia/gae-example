# Google App Engine Example

Let’s walk through deploying a simple web app using **Google App Engine Standard**. 
We’ll build a small Node.js API and a React frontend (you can find the source code in Git). 
No Kubernetes, no YAML nightmares, just code and a few CLI commands.

```
my-app/
├── backend/
│   ├── index.js
│   ├── package.json
│   └── app.yaml
├── frontend/
│   ├── dist/
│   ├── package.json
│   ├── app.yaml
│   └── (React source files)
```

### **Backend: Node.js API**

Let’s start with a super basic Express server, the classic.

```jsx
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.send({ message: 'Hello from App Engine!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### **Frontend: React App**

Create a Vite React app using:

```bash
npm create vite@latest my-react-app -- --template react
cd frontend
npm i
npm run build
```

Now let’s serve the static files using Express:

```jsx
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (_, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Frontend running on port ${PORT}`);
});
```

### **Understanding app.yaml**

Now the real magic—**app.yaml**.

Every App Engine service needs an `app.yaml` file. It tells Google Cloud how to **run your app**, **what runtime to use**, and **how to scale it**. Think of it as a mini blueprint for deployment.

Here’s a minimal version for our Node.js API:

```yaml
runtime: nodejs20
service: backend
env: standard
```

**What this means:**

- `runtime`: nodejs20 → Use Node.js 20 runtime (GAE supports several).
- `service`: api → This gives the service a name (defaults to “default” if omitted). It becomes part of the deployed URL: `api-dot-YOUR_PROJECT_ID.ey.r.appspot.com`
- `env`: standard → Use the **Standard Environment**, which supports rapid scaling and quick startup times.

For the frontend, basically the same:

```yaml
runtime: nodejs20
env: standard
```

> Note that we're omitting the service field here because App Engine requires having a "default" service.

### **Deploying to App Engine**

As easy as:

1. **Set your project** (once):

    ```yaml
    gcloud auth login
    gcloud config set project YOUR_PROJECT_ID
    ```

2. **Deploy each service**:

    ```yaml
    cd api
    gcloud app deploy
    
    cd ../frontend
    gcloud app deploy
    ```


After deployment, you can access your services immediately via the URLs provided in the CLI output.

### **Scaling & Traffic**

App Engine automatically scales services up or down based on incoming traffic. You pay only for what you use. No traffic? No cost (unless you specify `min_instances`).

Want more control? Modify `app.yaml` with custom scaling settings:

```yaml
automatic_scaling:
  min_instances: 1
  max_instances: 5
  target_cpu_utilization: 0.65
```

- **`min_instances: 1`**

  This keeps at least **one instance always running**, even if there’s no traffic. It’s useful for low-latency apps where you don’t want cold starts (App Engine may otherwise scale down to zero when idle).

- **`max_instances: 5`**

  This caps the number of instances to a maximum of **5**. App Engine will scale up if demand increases—but won’t spin up more than 5 instances, even during high traffic. This prevents surprise bills or runaway scaling.

- **`target_cpu_utilization: 0.65`**

  This is a **performance target**. It tells App Engine to start a new instance if the average CPU usage across existing instances goes above **65%**. Think of it as your auto-scaling trigger threshold.

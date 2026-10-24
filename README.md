# Student Information Management System (three-tier cloud app)

```
Browser -> Netlify (React frontend) -> Render (Node/Express API) -> MongoDB Atlas (studentDB.students)
```

| Tier | Folder | Tech | Hosted on |
| --- | --- | --- | --- |
| Presentation | `frontend/` | React + Vite + React Router | Netlify |
| Application | `backend/` | Node.js, Express, Mongoose | Render |
| Database | n/a | MongoDB (`studentDB` > `students`) | MongoDB Atlas |

The frontend never talks to MongoDB. The connection string lives only in the backend environment (`MONGODB_URI`).

## 1. MongoDB Atlas (database tier)

1. Sign in at https://cloud.mongodb.com and create a free **M0** cluster (any nearby region).
2. **Database Access > Add New Database User**: choose a username and a strong password. Under *Database User Privileges* pick *Specific Privileges* > `readWrite` on database `studentDB` (least privilege).
3. **Network Access > Add IP Address**: add *your current IP* for local work. For Render (which has no fixed IP on the free plan) add `0.0.0.0/0`. Protect the database with a strong user password.
4. **Clusters > Connect > Drivers**: copy the connection string and edit it:
   `mongodb+srv://<db_user>:<db_password>@cluster0.xxxxx.mongodb.net/studentDB?retryWrites=true&w=majority`
   Replace the user and password. URL-encode special characters in the password (`@` becomes `%40`).
5. The database and collection are created automatically on the first insert. To create them by hand: **Browse Collections > Add My Own Data**, database `studentDB`, collection `students`.

## 2. Run locally in VS Code

Requirements: Node.js 18 or newer, VS Code.

**Terminal 1: backend** (Terminal > New Terminal)

```bash
cd backend
npm install
cp .env.example .env          # Windows CMD: copy .env.example .env
# open .env and paste your MONGODB_URI
npm run seed                  # optional: adds 4 sample students
npm run dev
```

You should see `API running on port 5000` and `MongoDB connected: database "studentDB"`. Check http://localhost:5000/api/health.

**Terminal 2: frontend** (use the + button for a second terminal)

```bash
cd frontend
npm install
cp .env.example .env          # VITE_API_URL=http://localhost:5000
npm run dev
```

Open http://localhost:5173.

## 3. REST API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/students` | All students (`?search=term` filters by ID, name, email, department) |
| GET | `/api/students/:id` | One student (`:id` is the Student ID such as ST101) |
| POST | `/api/students` | Add a student |
| PUT | `/api/students/:id` | Update a student |
| DELETE | `/api/students/:id` | Delete a student |
| GET | `/api/health` | API and database status |

Quick test:

```bash
curl -X POST http://localhost:5000/api/students -H "Content-Type: application/json" \
  -d '{"studentId":"ST201","name":"Test Student","department":"CSE","semester":5}'
curl http://localhost:5000/api/students
curl -X PUT http://localhost:5000/api/students/ST201 -H "Content-Type: application/json" -d '{"semester":6}'
curl -X DELETE http://localhost:5000/api/students/ST201
```

## 4. Deploy

Push the whole project to a GitHub repository first (`.env` files are git-ignored).

**Backend on Render**
1. New > Web Service > connect the repository.
2. Root Directory `backend`, Build Command `npm install`, Start Command `npm start`.
3. Environment variables: `MONGODB_URI` (your Atlas string), `NODE_ENV=production`, `FRONTEND_URL` (set after step Netlify; use a placeholder for now). Render sets `PORT` itself.
4. Deploy, then open `https://<your-service>.onrender.com/api/health`.

**Frontend on Netlify**
1. Add new site > Import from Git > pick the repository.
2. Base directory `frontend`, Build command `npm run build`, Publish directory `dist`.
3. Site configuration > Environment variables: `VITE_API_URL` = your Render URL (no trailing slash). Set it before the build.
4. Deploy.

**Finish CORS:** on Render set `FRONTEND_URL` to the Netlify URL (for example `https://student-management-system.netlify.app`, no trailing slash) and redeploy. Only that origin can then call the API from a browser.

Note: free Render services sleep after inactivity, so the first request can take up to a minute.

## 5. Test cases from the problem statement

1. Add `ST101` / Rahul Sharma / CSE / semester 5 and see "Student added successfully."
2. Open Student list and confirm all records appear (the API call is `GET /api/students`).
3. Edit ST101, change semester 5 to 6, save, and confirm the change in Atlas.
4. Delete ST101 and confirm it disappears from Atlas.
5. In Atlas > Browse Collections > `studentDB.students`, verify each frontend action changed the data.

## Security notes
- Credentials are only in environment variables (`.env` locally, Render dashboard in production).
- Input is validated in the browser and again on the server (Mongoose schema).
- CORS allows only `FRONTEND_URL`; Helmet adds secure headers; error responses hide server details.

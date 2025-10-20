# Cache Money (local dev)

Backend (Node/Express) and Frontend (Expo/React Native) in one repo.

Backend quick start

1. cd backend
2. cp .env.example .env and edit MONGO_URI and JWT_SECRET
3. npm install
4. npm run dev

Frontend quick start

1. cd project root
2. npm install
3. npm start
4. Open in Expo (simulator or device)

Notes
- If testing on a physical device, set the API base in `app/config/api.js` to `http://<your-lan-ip>:<port>`

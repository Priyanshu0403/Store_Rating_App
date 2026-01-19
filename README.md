# Store Rating App

## How to Run the Project Locally

### 1. Clone the Repository

git clone <your-github-repo-link>
cd Store_Rating_App

### 2. Backend Setup
cd backend
npm install

### Create a .env file inside the backend folder
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=1234
DB_NAME=store_rating_db
JWT_SECRET=your_jwt_secret

#### Start the backend server
npm run dev
Backend will run on:
http://localhost:5000

###3. Frontend Setup
cd frontend
npm install
npm run dev
Frontend will run on:
http://localhost:5173


⸻


# 🚀 Job Assistant Agent

An AI-powered job application assistant that helps users apply to jobs smarter and faster — by autofilling applications, tailoring recruiter answers, and scoring resume-to-JD matches using AI.

---

## 👤 Built by
**Lalith Aditya** — Full-Stack Developer (Frontend + Backend)

---

## 📌 Features

- 📝 Multi-step profile form with resume upload & job preferences
- 🤖 AI Agents:
  - **Autofill Agent** – Fills job applications using saved profile
  - **Resume-to-JD Score Agent** – Scores how well your resume fits a job
  - **Tailored Answer Agent** – Generates recruiter answers with AI
- 📄 AI-generated cover letter
- 💼 Suggested Jobs via RapidAPI JSearch + AI-filtered ones
- 📊 Application Tracker (status, progress)
- 🔍 Custom JD matching and Q&A in Tailored Resume page

---

## 🧠 Tech Stack

| Frontend            | Backend              | AI Services              | Database |
|---------------------|----------------------|---------------------------|----------|
| React + TailwindCSS | Node.js + Express    | DeepSeek R1 (via Azure)  | PostgreSQL + Prisma |
| React Router        | Zod Validation       | RapidAPI JSearch         | Multer for file upload |

---

## 🛠️ How to Clone & Run Locally

### 🔁 Clone the Repo
```bash
git clone https://github.com/your-username/Job-Assistant-Agent.git
cd Job-Assistant-Agent


⸻

🖥️ Run Backend
	1.	Navigate to backend folder:

cd Backend

	2.	Install dependencies:

npm install

	3.	Create .env file:

PORT=5000
DATABASE_URL=your_postgres_db_url
AZURE_API_KEY=your_azure_key
AZURE_API_ENDPOINT=https://your-azure-endpoint
RAPID_API_KEY=your_rapidapi_key

	4.	Run Prisma:

npx prisma generate
npx prisma migrate dev --name init

	5.	Start the server:

npm run dev

Server runs at: http://localhost:5000

⸻

🌐 Run Frontend
	1.	Open a new terminal and go to frontend:

cd ../Frontend

	2.	Install dependencies:

npm install

	3.	Create .env file:

VITE_BACKEND_URL=http://localhost:5000

	4.	Start the dev server:

npm run dev

Frontend runs at: http://localhost:5173

⸻

🧪 Testing the App Locally
	•	Visit: http://localhost:5173
	•	Sign up or log in with test user
	•	Upload resume & fill profile
	•	View suggested jobs → click Auto Apply
	•	Review recruiter answers, cover letter
	•	Application gets tracked in the dashboard

⸻

📁 Folder Structure

Job-Assistant-Agent/
├── Backend/
│   ├── controllers/
│   ├── routes/
│   ├── prisma/
│   └── index.js
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── api.js
│   └── index.html


⸻

💡 Future Enhancements
	•	Submit job to external forms (currently only saved/tracked)
	•	AI-powered resume rewriting
	•	Google OAuth sign-in
	•	JD scoring analytics & resume visualizations
	•	Email alerts for matching jobs
	•	Unit + integration tests

⸻

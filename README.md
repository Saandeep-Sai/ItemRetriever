# 📦 Item-Retriever

A full-stack web application built with **Next.js 15** and **Firebase** for secure item retrieval using OTP (One-Time Password) verification.

## 🚀 Features

- 🔐 OTP-based email verification
- ✅ Firebase Authentication integration
- 📦 Firebase Firestore for secure data storage
- 🌐 RESTful API routes for OTP sending and verification
- ⚙️ Environment configuration via `.env.local`
- 📁 Modular code structure with `app/` and `api/` routing

---

## 🧰 Tech Stack

- **Frontend & Backend**: [Next.js 15](https://nextjs.org/)
- **Authentication & Database**: [Firebase](https://firebase.google.com/)
- **Languages**: TypeScript, JavaScript
- **Other**: Webpack, TailwindCSS (if used)

---

## 🗂️ Project Structure

\`\`\`
src/
├── app/
│   ├── api/
│   │   ├── send-otp/route.ts     # API route to send OTP via email
│   │   └── verify-otp/route.ts   # API route to verify OTP
│   ├── auth/
│   │   └── authAction.ts         # Auth logic (imported in APIs)
│   └── page.tsx                  # Main UI page
├── styles/
│   └── globals.css               # Global styles
.env.local                        # Environment variables
tsconfig.json                     # TypeScript configuration
\`\`\`

---

## ⚙️ Getting Started

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/item-retriever.git
cd item-retriever
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure environment variables

Create a \`.env.local\` file in the root and add:

\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

### 4. Run the development server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🛠️ Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

---

## 📬 API Endpoints

### \`POST /api/send-otp\`
Sends a one-time password (OTP) to a user's email.

**Request:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

---

### \`POST /api/verify-otp\`
Verifies the submitted OTP.

**Request:**
\`\`\`json
{
  "email": "user@example.com",
  "otp": "123456"
}
\`\`\`

---

## ❗ Troubleshooting

### ❌ Module not found: \`@/app/auth/authAction\`

- Ensure the file \`src/app/auth/authAction.ts\` exists
- Check \`tsconfig.json\` includes the \`@/*\` path alias:

\`\`\`json
"paths": {
  "@/*": ["src/*"]
}
\`\`\`

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

- Saandeep (replace this with your name and contact info)

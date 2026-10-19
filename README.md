# 🍔 FoodApp — Food Delivery Web Application

FoodApp is a full-stack food delivery web application built with **HTML, CSS, JavaScript, Node.js, Express.js, and Microsoft SQL Server**. It provides a web interface for browsing restaurants, managing a cart, placing orders, and accessing an admin dashboard.

## ✨ Features

- Browse restaurants and food items.
- Add food items to a shopping cart.
- Proceed to checkout and place orders.
- User authentication using JSON Web Tokens (JWT).
- Password hashing using bcryptjs.
- Admin dashboard for managing application data.
- REST API built with Node.js and Express.js.
- Microsoft SQL Server database integration.
- File upload support using Multer.
- Separate frontend and backend architecture.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Web page structure |
| CSS3 | Styling and responsive layouts |
| JavaScript | Frontend functionality |
| Node.js | Backend runtime |
| Express.js | API and server development |
| Microsoft SQL Server | Database management |
| `mssql` | SQL Server connectivity |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File uploads |

## 📁 Project Structure

```text
FoodApp/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── uploads/
│   ├── utils/
│   ├── crypt.js
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── css/
    ├── js/
    ├── index.html
    ├── login.html
    ├── cart.html
    ├── checkout.html
    └── admin.html
```

## 🚀 Getting Started

### Prerequisites

Install the following tools before running the project:

- [Node.js and npm](https://nodejs.org/)
- Microsoft SQL Server
- SQL Server Management Studio (SSMS), or another SQL Server client

### 1. Clone the repository

```bash
git clone https://github.com/Udit-Shrivastava01/FoodApp.git
cd FoodApp
```

### 2. Configure the database

Set up your SQL Server instance and create the database required by the application.

Check the configuration files inside `backend/config/` to identify the required connection settings. Make sure your SQL Server instance is running and accessible.

### 3. Configure environment variables

If required by the backend, create a `backend/.env` file containing the environment variables expected by the application, such as database connection settings and the JWT secret.

**Important:** Never commit passwords, tokens, or other private credentials to GitHub.

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Start the backend server

For development:

```bash
npm run dev
```

For a standard start:

```bash
npm start
```

Check the terminal for the server's startup message and configured port.

### 6. Run the frontend

Open `frontend/index.html` in your browser or serve the `frontend` directory using a local development server.

Ensure that the API URL configured in the frontend JavaScript matches the address of your running backend.

## 📜 Available Scripts

Run these commands from the `backend` directory.

| Command | Description |
|---|---|
| `npm run dev` | Starts the backend with Nodemon for development. |
| `npm start` | Starts the backend with Node.js. |

## 🔐 Security

- JWT-based authentication.
- Password hashing support through bcryptjs.
- Environment variables for sensitive configuration.
- Keep database credentials and authentication secrets private.
- Configure HTTPS, appropriate CORS rules, and input validation before production deployment.

## 🔮 Future Improvements

- Deploy the application for public access.
- Add automated testing and API documentation.
- Improve mobile responsiveness and accessibility.
- Add advanced restaurant search and filtering.
- Introduce enhanced order tracking and status updates.

## 👨‍💻 Author

**Udit Shrivastava**

- GitHub: [Udit-Shrivastava01](https://github.com/Udit-Shrivastava01)
- Project repository: [FoodApp](https://github.com/Udit-Shrivastava01/FoodApp)

---

*Built as a full-stack food delivery application project.*

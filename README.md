# Mini Expense Tracker

A full-stack expense tracking app built with **React + Vite** (frontend) and **Node.js + Express** (backend). Users can log daily spending across categories, filter by date range and category, and see a live summary panel with a pie chart. Data is persisted to a JSON file on the server so it survives restarts.

---

## Live Demo

- **Frontend:** https://expense-tracker-sigma-orcin.vercel.app
- **Backend:**  https://expense-tracker-api-dfe5.onrender.com

---

## Tech Stack

| Layer     | Technology                      | Why                                                            |
|-----------|---------------------------------|----------------------------------------------------------------|
| Frontend  | React 18 + Vite + TypeScript    | Fast dev server, simple SPA setup, type safety                 |
| Styling   | Tailwind CSS v3                 | Utility-first, no extra CSS files needed                       |
| Chart     | Recharts                        | Easy Pie/Bar charts with good React integration                |
| Backend   | Node.js + Express               | Minimal setup, familiar REST API patterns                      |
| Storage   | JSON file (`server/data/`)      | Simple persistence without a database dependency               |
| IDs       | uuid v4                         | Unique IDs for each expense                                    |

---

## How to Run Locally

> Assumes you have **Node.js 18+** installed. That's it.

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/expense-tracker.git
cd expense-tracker
```

### 2. Start the backend

```bash
cd server
npm install
npm run dev
```

Server starts at **http://localhost:5000**

### 3. Start the frontend (new terminal)

```bash
cd client
npm install
npm run dev
```

Frontend starts at **http://localhost:5173**

Open **http://localhost:5173** in your browser. Done!

> The Vite dev server proxies `/api` requests to `localhost:5000`, so no CORS issues locally.

---

## API Documentation

Base URL: `http://localhost:5000`

### `GET /api/expenses`

Returns a list of expenses, sorted newest first.

**Query params (all optional):**
| Param      | Example          | Description              |
|------------|------------------|--------------------------|
| `category` | `Food`           | Filter by category       |
| `from`     | `2025-06-01`     | Filter from date (inclusive) |
| `to`       | `2025-06-30`     | Filter to date (inclusive)   |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "amount": 250.00,
    "category": "Food",
    "date": "2025-06-10",
    "note": "Lunch",
    "createdAt": "2025-06-10T12:00:00.000Z"
  }
]
```

---

### `GET /api/expenses/summary`

Returns aggregated summary data for the current month.

**Response `200`:**
```json
{
  "totalThisMonth": 4500.00,
  "topCategory": { "category": "Food", "amount": 2000.00 },
  "highestExpense": { "category": "Bills", "amount": 3000.00 },
  "byCategoryThisMonth": [
    { "category": "Food", "amount": 2000.00 },
    { "category": "Transport", "amount": 1500.00 }
  ]
}
```

---

### `GET /api/expenses/:id`

Returns a single expense by ID.

**Response `200`:** Expense object  
**Response `404`:** `{ "error": "Expense not found" }`

---

### `POST /api/expenses`

Creates a new expense.

**Request body:**
```json
{
  "amount": 250,
  "category": "Food",
  "date": "2025-06-10",
  "note": "Lunch with team"
}
```

**Validation rules:**
- `amount` — required, positive number
- `category` — required, one of: Food, Transport, Bills, Entertainment, Other
- `date` — required, cannot be a future date
- `note` — optional

**Response `201`:** Created expense object  
**Response `400`:** `{ "errors": { "amount": "...", "category": "..." } }`

---

### `PUT /api/expenses/:id`

Updates an existing expense. Same request body and validation as POST.

**Response `200`:** Updated expense object  
**Response `404`:** `{ "error": "Expense not found" }`

---

### `DELETE /api/expenses/:id`

Deletes an expense.

**Response `204`:** No content  
**Response `404`:** `{ "error": "Expense not found" }`

---

### `GET /health`

Health check endpoint.

**Response `200`:** `{ "status": "ok" }`

---

## Project Structure

```
expense-tracker/
├── client/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── CategoryChart.tsx   # Recharts pie chart
│   │   │   ├── ConfirmDialog.tsx   # Delete confirmation modal
│   │   │   ├── ExpenseForm.tsx     # Add / Edit modal form
│   │   │   ├── ExpenseTable.tsx    # Expenses list with edit/delete
│   │   │   └── SummaryCards.tsx    # 3 stat cards at the top
│   │   ├── hooks/
│   │   │   └── useExpenses.ts      # All API calls + state management
│   │   ├── App.tsx                 # Main page — layout + filters
│   │   ├── main.tsx                # React entry point
│   │   └── index.css               # Tailwind base styles
│   ├── index.html
│   ├── vite.config.ts              # Vite config with /api proxy
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                   # Express backend
│   ├── src/
│   │   └── index.js               # All routes + business logic
│   ├── data/
│   │   └── expenses.json          # Auto-created, persists data
│   └── package.json
│
├── .gitignore
├── package.json               # Root scripts for convenience
└── README.md
```

---

## Deployment

### Backend → Render (free)

1. Push code to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Copy the Render URL (e.g. `https://expense-tracker-api.onrender.com`)

### Frontend → Netlify (free)

1. Go to [netlify.com](https://netlify.com) → Add new site → Import from GitHub
2. Set **Base directory** to `client`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable: `VITE_API_URL` = your Render URL
6. Deploy!

---

## What Works

- ✅ Add / Edit / Delete expenses with validation
- ✅ Filter by category and date range (This Month, Last Month, Custom, All Time)
- ✅ Summary cards — total this month, top category, highest expense
- ✅ Pie chart of spending by category (current month)
- ✅ Loading and error states
- ✅ Empty state UI
- ✅ Data persists to JSON file across server restarts
- ✅ INR currency formatting (₹)
- ✅ Form validation (no negative amounts, no future dates)
- ✅ Delete confirmation dialog
- ✅ Responsive on mobile

## Next Steps

With more time, I would add:

- **CSV export** — download filtered expenses as a spreadsheet
- **Budget per category** — set a monthly limit and show a progress bar when nearing it
- **Search by note** — quick text search across expense notes
- **Authentication** — multi-user support with JWT
- **PostgreSQL / SQLite** — replace the JSON file with a proper database
- **Tests** — Jest tests for the API endpoints (at minimum: POST validation, summary calculation)

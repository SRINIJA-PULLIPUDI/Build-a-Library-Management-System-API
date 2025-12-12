#  Library Management System API

A RESTful API built using **Node.js**, **Express.js**, **MySQL**, and **Sequelize ORM** to manage books, members, borrowing transactions, and fines.  
This project demonstrates state–machine logic, enforcement of complex business rules, and relational data design.

---

##  Features

- Full CRUD operations for Books & Members  
- Borrow & Return workflow with state transitions  
- Fine calculation for overdue books  
- Borrowing restriction rules (max books, unpaid fines, membership status)  
- Overdue detection + automatic member suspension  
- Reporting endpoints for available books, borrowed books, overdue transactions, and fines  

---

##  Technologies Used

- **Node.js / Express.js** – REST API  
- **MySQL** – Relational Database  
- **Sequelize ORM** – Models, queries, relationships  
- **Day.js** – Date and time calculations  
- **Nodemon** – Development auto-reload  

---

#  Project Setup

## 1️ Requirements

Before running the project, ensure you have installed:

- Node.js (v18+ recommended)  
- MySQL (v8+)  
- npm package manager  

---

## 2️ Installation

Clone the repository:

```bash
git clone https://github.com/SRINIJA-PULLIPUDI/Build-a-Library-Management-System-API.git
cd Build-a-Library-Management-System-API
```

Install dependencies:

```bash
npm install
```

---

## 3️ Environment Variables

Create a `.env` file in the project root directory:

```
DB_HOST=localhost
DB_USER=root
DB_PASS=your_mysql_password
DB_NAME=library
DB_DIALECT=mysql
PORT=3000
```

**I did not commit `.env` into GitHub.**

---

## 4️ Start the Server

### Development mode:
```bash
npm run dev
```

### Production mode:
```bash
node src/server.js
```

Expected output:

```
Database connected successfully
Models synchronized
Library API listening on port 3000
```

---

#  Project Structure

```
src/
 ├── config/
 ├── models/
 ├── controllers/
 ├── services/
 ├── routes/
 ├── app.js
 └── server.js
```

---

#  Database Schema

##  Books Table

| Field            | Type        | Description                                      |
|------------------|-------------|--------------------------------------------------|
| id               | INT (PK)    | Unique identifier                                |
| isbn             | VARCHAR     | Unique ISBN                                      |
| title            | VARCHAR     | Book title                                       |
| author           | VARCHAR     | Author name                                      |
| category         | VARCHAR     | Genre/category                                   |
| status           | ENUM        | available / borrowed / reserved / maintenance    |
| total_copies     | INT         | Total stock in library                           |
| available_copies | INT         | Remaining copies                                 |
| created_at       | TIMESTAMP   | Creation date                                    |

---

##  Members Table

| Field             | Type                    |
|-------------------|-------------------------|
| id                | INT (PK)                |
| name              | VARCHAR                 |
| email             | VARCHAR (unique)        |
| membership_number | VARCHAR (unique)        |
| status            | ENUM(active, suspended) |
| created_at        | TIMESTAMP               |

---

##  Transactions Table

| Field        | Type                            |
|--------------|---------------------------------|
| id           | INT (PK)                        |
| book_id      | INT (FK → Books)                |
| member_id    | INT (FK → Members)              |
| borrowed_at  | DATETIME                        |
| due_date     | DATETIME                        |
| returned_at  | DATETIME (nullable)             |
| status       | ENUM(active, returned, overdue) |

---

##  Fines Table

| Field          | Type                            |
|----------------|---------------------------------|
| id             | INT (PK)                        |
| member_id      | INT (FK → Members)              |
| transaction_id | INT (FK → Transactions)         |
| amount         | DECIMAL                         |
| paid_at        | DATETIME (nullable)             |

---

#  Database Schema Diagram
This is the database schema diagram obtained by **mysql workbench**
![Database Schema](Workbench Schema Diagram.png)

---

#  State Machine Logic

##  Book State Transitions
```
available → borrowed → available
```

### Rules:
- Borrowing decreases **available_copies**  
- If `available_copies = 0` → status becomes **borrowed**  
- Returning increases copies  
- Book becomes available again when returned

---

##  Transaction State Transitions
```
active → overdue → returned
```

### Rules:
- `active` when borrowed  
- Automatically becomes `overdue` when due_date < now  
- Becomes `returned` when book is returned  

---

#  Business Rules Implementation

###  Rule 1 — Borrow limit (max 3 books)
Implemented in **rules.service.js → canBorrow()**  
- Count active transactions for a member  
- Throw error If ≥ 3 → borrowing is blocked  

---

###  Rule 2 — Loan period = 14 days
**calculateDueDate() adds 14 days to borrowed date.
```
due_date = borrowed_at + 14 days
```

---

###  Rule 3 — Fine = $0.50 per overdue day
Fine is generated only when the book is returned.
Implemented in `calculateFine()`:
```
fine = overdue_days * 0.50
```
To test Rule 3, we need a book that is already overdue when returned.

Since Postman cannot modify database timestamps directly, I manually updated the **due_date** inside MySQL using this command:
```
UPDATE transactions
SET due_date = DATE_SUB(NOW(), INTERVAL 4 DAY)
WHERE id = 2;
```
This makes the transaction 4 days overdue

---

###  Rule 4 — Unpaid fines block borrowing
In `canBorrow()`:
- Count unpaid fines  
- If any exist → borrowing is denied  

---

###  Rule 5 — Automatic suspension (3+ overdue books)
In `refreshOverduesAndSuspensions()`:
- Identify overdue transactions  
- If a member has ≥ 3 overdue → **status = suspended**  
To verify this rule 5, the due_date values for multiple active transactions must be moved into the past so that they become overdue.

Since Postman cannot modify timestamps directly, I manually updated them in MySQL using the following command:
```
UPDATE transactions
SET due_date = DATE_SUB(NOW(), INTERVAL 10 DAY)
WHERE member_id = 2 AND status = 'active';
```

---

#  API Documentation

##  BOOKS ENDPOINTS

| Method | Endpoint           | Description            |
|--------|--------------------|------------------------|
| POST   | /books             | Add a book             |
| GET    | /books             | List all books         |
| GET    | /books/:id         | Get book by ID         |
| PUT    | /books/:id         | Update book            |
| DELETE | /books/:id         | Remove a book          |
| GET    | /books/available   | List available books   |

---

##  MEMBERS ENDPOINTS

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| POST   | /members               | Add a member                 |
| GET    | /members               | List all members             |
| GET    | /members/:id           | Get member details by ID     |
| PUT    | /members/:id           | Update member                |
| DELETE | /members/:id           | Delete member                |
| GET    | /members/:id/borrowed  | Books borrowed by a member   |

---

##  TRANSACTIONS ENDPOINTS

| Method | Endpoint                     | Description                          |
|--------|------------------------------|--------------------------------------|
| POST   | /transactions/borrow         | Borrow a book                        |
| POST   | /transactions/:id/return     | Return a book                        |
| GET    | /transactions                | List all transactions                |
| GET    | /transactions/:id            | Get transaction by ID                |
| GET    | /transactions/overdue        | Mark overdue + suspend members       |

---

##  FINES ENDPOINTS

| Method | Endpoint           | Description          |
|--------|--------------------|----------------------|
| GET    | /fines             | List all fines       |
| GET    | /fines/:id         | Get fine by ID       |
| POST   | /fines/:id/pay     | Mark fine as paid    |

---

#  Postman Collection
This project includes a Postman collection for testing

A complete Postman file is included to test:
- CRUD operations
- Borrow/Return flow
- Overdue scenarios
- Fine payment
- Suspension workflow

Postman Collection File:
[`Library-Management-System-API.postman_collection.json`](./Library-Management-System-API.postman_collection.json)


Located at:
```
./Library-Management-System-API.postman_collection.json
```

---

#  Error Handling

Proper HTTP status codes  
- 400 Bad Request
- 404 Resource Not Found
- 409 Business Rule Violation
- 500 Server Errors
Consistent JSON error format is used across all controllers  
Covers validation + business rules  

---

#  Conclusion

This project satisfies the requirements:

-  Correct database schema
-  Complete REST API implementation 
-  CRUD operations 
-  All business rules enforced  
-  State machine behavior implemented  
-  Clean modular architecture  
-  Data Integrity with Sequelize
-  Full documentation & Postman collection  
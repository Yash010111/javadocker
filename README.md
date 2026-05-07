# MarketPusle Backend

![Spring Boot](https://upload.wikimedia.org/wikipedia/commons/4/44/Spring_Framework_Logo_2018.svg)

## Overview

MarketPusle is the backend API server for a stock portfolio tracking application. This Spring Boot service provides user authentication, stock lookup, portfolio management, and administrative configuration. It is hosted live on Railway (URL hidden) and serves as the backend for the MarketPusle frontend.

## Deployment

- Platform: Railway
- Status: Live
- Purpose: Backend API for MarketPusle stock trading dashboard
- Note: The public Railway URL is intentionally hidden in this documentation.

## Tech Stack

- Java 17
- Spring Boot 4.0.6
- Spring Web (REST API)
- Spring Security (JWT authentication)
- Spring Data JPA
- MySQL / MariaDB via `mysql-connector-j`
- JSON processing with Jackson
- Validation with `spring-boot-starter-validation`
- Authentication with JWT via `jjwt`
- Build tool: Maven
- Lombok for DTO/entity boilerplate reduction

## Key Backend Features

- JWT-based authentication and authorization
- User registration and login
- Portfolio holdings management (buy/sell stocks)
- Real-time stock symbol search and stock quote retrieval
- Admin user management and API key configuration
- MySQL persistence with JPA entities
- CORS support for frontend origins including Railway and Vercel

## API Endpoints

| HTTP Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register a new user | No |
| POST | `/api/auth/login` | Authenticate user and issue JWT | No |
| GET | `/api/stocks?symbol={symbol}&interval={interval}` | Fetch stock quote data for a symbol and interval | Yes |
| GET | `/api/stocks/search?keyword={keyword}` | Search stock symbols by keyword | Yes |
| GET | `/api/portfolio` | Get the authenticated user's current portfolio holdings | Yes |
| POST | `/api/portfolio/buy` | Buy stock shares for authenticated user | Yes |
| POST | `/api/portfolio/sell` | Sell stock shares for authenticated user | Yes |
| GET | `/api/admin/users` | List all registered users | Admin only |
| PUT | `/api/admin/users/{id}` | Update user fields for a given user ID | Admin only |
| DELETE | `/api/admin/users/{id}` | Delete a user account | Admin only |
| GET | `/api/admin/config` | Read current API key configuration | Admin only |
| PUT | `/api/admin/config` | Update stored API key configuration | Admin only |

### Request / Response Notes

- Auth endpoints accept `username` and `password`.
- Portfolio buy/sell operations require `symbol`, `quantity`, and `price`.
- Stock lookup requires `symbol` and `interval` query parameters.
- Search endpoint uses `keyword` to return matching symbol suggestions.

## SQL Structure

The backend stores data in MySQL via JPA entities with the following table layout:

### `users`
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `username` VARCHAR(255) NOT NULL UNIQUE
- `password` VARCHAR(255) NOT NULL
- `role` VARCHAR(255) NOT NULL DEFAULT 'ROLE_USER'

### `holdings`
- `id` BIGINT AUTO_INCREMENT PRIMARY KEY
- `user_id` BIGINT NOT NULL
- `symbol` VARCHAR(255) NOT NULL
- `quantity` DECIMAL(19,6) NOT NULL
- `average_price` DECIMAL(19,6) NOT NULL
- Unique constraint on (`user_id`, `symbol`)

### `api_config`
- `id` BIGINT PRIMARY KEY
- `api_key` VARCHAR(255)

## Security & Auth

- Stateless JWT authentication with token expiry of `3600000` ms (1 hour)
- Passwords hashed with `BCryptPasswordEncoder`
- Public access for `/api/auth/**`
- Admin-only access for `/api/admin/**`
- All other API routes require authentication
- CORS allows Railway and Vercel frontend origins

## Application Configuration

Important environment variables used by this backend:

- `MYSQL_URL` — JDBC connection string for the MySQL database
- `MYSQLUSER` — database username
- `MYSQLPASSWORD` — database password
- `JWT_SECRET` — secret used to sign JWT tokens

The project uses `spring.jpa.hibernate.ddl-auto=update`, so JPA will manage schema updates automatically during startup.

## How to Run Locally

1. Set environment variables: `MYSQL_URL`, `MYSQLUSER`, `MYSQLPASSWORD`, `JWT_SECRET`
2. Build and run with Maven:
   - `./mvnw spring-boot:run`
3. Access API endpoints on `http://localhost:8080`

## Notes

- This document describes the backend service only.
- Frontend-specific content is excluded.
- The application is configured for MySQL and deployed as a backend API on Railway.

## 👥 Authors & Contact

- Yash Paraskar — yashparaskar2@gmail.com
- GitHub: https://github.com/Yash010111

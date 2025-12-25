# Perfect Bakery - Backend API

A scalable Node.js/Express backend with MongoDB for the Perfect Bakery e-commerce application.

## 🏗️ Architecture

```
backend/
├── config/           # Database and service configurations
│   ├── db.js         # MongoDB connection
│   └── razorpay.js   # Razorpay payment gateway
│
├── controllers/      # Request handlers (business logic)
│   ├── authController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── userController.js
│   └── paymentController.js
│
├── middleware/       # Express middleware
│   ├── authMiddleware.js   # JWT authentication & authorization
│   └── errorMiddleware.js  # Global error handling
│
├── models/           # Mongoose schemas
│   ├── User.js       # User model with auth
│   ├── Product.js    # Product catalog
│   └── Order.js      # Order management
│
├── routes/           # API route definitions
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── orderRoutes.js
│   ├── userRoutes.js
│   └── paymentRoutes.js
│
├── seeders/          # Database seeders
│   └── seed.js       # Initial data seeding
│
├── utils/            # Utility functions
│   ├── ApiError.js   # Custom error class
│   ├── ApiResponse.js # Standard response format
│   ├── asyncHandler.js # Async error wrapper
│   ├── constants.js  # App constants
│   └── helpers.js    # Helper functions
│
├── validators/       # Input validation
│   └── index.js      # Validation functions
│
└── server.js         # Application entry point
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Seed database (optional)
npm run seed

# Start server
npm run dev
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| POST | `/api/auth/logout` | Logout user | Public |
| POST | `/api/auth/refresh` | Refresh JWT token | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update profile | Private |
| PUT | `/api/auth/change-password` | Change password | Private |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/products` | List products (with filters) | Public |
| GET | `/api/products/:id` | Get single product | Public |
| GET | `/api/products/category/:category` | Products by category | Public |
| GET | `/api/products/meta/categories` | List categories | Public |
| GET | `/api/products/featured` | Featured products | Public |
| GET | `/api/products/bestsellers` | Bestseller products | Public |
| POST | `/api/products` | Create product | Admin |
| PUT | `/api/products/:id` | Update product | Admin |
| DELETE | `/api/products/:id` | Delete product | Admin |
| PATCH | `/api/products/:id/stock` | Update stock | Admin |
| POST | `/api/products/:id/reviews` | Add review | Private |

### Orders
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/orders` | Create order | Private |
| GET | `/api/orders/my-orders` | Get user's orders | Private |
| GET | `/api/orders/:id` | Get order by ID | Private |
| PUT | `/api/orders/:id/cancel` | Cancel order | Private |
| GET | `/api/orders` | List all orders | Admin |
| PUT | `/api/orders/:id/status` | Update order status | Admin |
| GET | `/api/orders/stats` | Order statistics | Admin |

### Users (Admin)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users | Admin |
| GET | `/api/users/:id` | Get user details | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Deactivate user | Admin |
| PATCH | `/api/users/:id/role` | Update user role | Admin |
| PATCH | `/api/users/:id/rewards` | Adjust rewards | Admin |
| GET | `/api/users/stats` | User statistics | Admin |

### Payments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/payments/create-order` | Create Razorpay order | Private |
| POST | `/api/payments/verify` | Verify payment | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Request Headers
```
Authorization: Bearer <token>
```

### Token Types
- **Access Token**: Short-lived (30 days), used for API requests
- **Refresh Token**: Long-lived (90 days), used to get new access tokens

## 📝 Query Parameters

### Pagination
```
GET /api/products?page=1&limit=10
```

### Filtering
```
GET /api/products?category=Cakes&minPrice=100&maxPrice=500
GET /api/products?tag=bestseller&inStock=true
```

### Sorting
```
GET /api/products?sort=-price    # Price descending
GET /api/products?sort=name      # Name ascending
GET /api/products?sort=-createdAt,name  # Multiple fields
```

### Search
```
GET /api/products?search=chocolate
GET /api/products/search?q=cake
```

## 🛡️ Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Server Error

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `SESSION_SECRET` | Session secret | - |
| `RAZORPAY_KEY_ID` | Razorpay key ID | - |
| `RAZORPAY_KEY_SECRET` | Razorpay secret | - |

## 🧪 Testing

```bash
# Health check
curl http://localhost:3000/api/health

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@perfectbakery.com","password":"admin123"}'

# Get products
curl http://localhost:3000/api/products
```

## 📦 Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with nodemon
npm run seed    # Seed database with sample data
```

## 🔒 Security Features

- Password hashing with bcrypt (salt rounds: 12)
- JWT token authentication
- Rate limiting on auth endpoints
- CORS configuration
- Input validation and sanitization
- Account lockout after failed attempts
- HTTP-only cookies for sessions

## 📄 License

ISC

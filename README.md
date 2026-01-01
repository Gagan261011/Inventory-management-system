# Inventory Management System

A comprehensive enterprise-grade Inventory Management System built with **Angular 17** frontend and **Spring Boot 3.2.1** microservices backend. Features multiple API types (REST, GraphQL, SOAP), JWT authentication with role-based access control, and structured JSON logging with correlation ID tracing.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Angular Frontend (Port 4200)                     │
│                    Material UI • RxJS • Role-based Views                │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
        ┌────────────────────────┼────────────────────────────┐
        │                        │                            │
        ▼                        ▼                            ▼
┌───────────────┐      ┌───────────────┐            ┌───────────────┐
│  Auth Service │      │Catalog Service│            │Audit Service  │
│   (Port 8081) │      │  (Port 8082)  │            │  (Port 8084)  │
│               │      │               │            │               │
│   • REST API  │      │   • REST API  │            │   • REST API  │
│   • JWT Auth  │      │   • GraphQL   │            │   • Event Log │
│   • User Mgmt │      │   • Products  │            │   • Dashboard │
└───────────────┘      └───────────────┘            └───────────────┘
                                 │
                                 ▼
                       ┌───────────────┐
                       │Inventory Svc  │
                       │  (Port 8083)  │
                       │               │
                       │   • REST API  │
                       │   • SOAP API  │
                       │   • Warehouse │
                       │   • Stock Mgmt│
                       └───────────────┘
```

## 📋 Features

### Backend Services

| Service | Port | Description | APIs |
|---------|------|-------------|------|
| **auth-service** | 8081 | Authentication, user management, JWT tokens | REST |
| **catalog-service** | 8082 | Product catalog, categories, suppliers | REST, GraphQL |
| **inventory-service** | 8083 | Stock management, warehouses, movements | REST, SOAP |
| **audit-service** | 8084 | Event logging, audit trails, correlation tracking | REST |

### Frontend Features

- **User Portal**: Stock levels, movements, replenishment requests
- **Admin Portal**: Full system management, audit logs, approvals
- **Material UI**: Modern, responsive design
- **Role-based Access**: Separate views for USER and ADMIN roles

## 🚀 Quick Start

### Prerequisites

- **Java 17** or higher
- **Maven 3.8+**
- **Node.js 18+** and npm
- **Angular CLI 17**: `npm install -g @angular/cli`

### 1. Start Backend Services

Open 4 separate terminal windows and start each service:

```powershell
# Terminal 1 - Auth Service
cd backend/auth-service
mvn spring-boot:run

# Terminal 2 - Catalog Service  
cd backend/catalog-service
mvn spring-boot:run

# Terminal 3 - Inventory Service
cd backend/inventory-service
mvn spring-boot:run

# Terminal 4 - Audit Service
cd backend/audit-service
mvn spring-boot:run
```

### 2. Start Frontend

```powershell
cd frontend
npm install
ng serve
```

### 3. Access the Application

- **Frontend**: http://localhost:4200
- **Auth Service**: http://localhost:8081
- **Catalog Service**: http://localhost:8082
- **GraphQL Playground**: http://localhost:8082/graphiql
- **Inventory Service**: http://localhost:8083
- **SOAP WSDL**: http://localhost:8083/ws/inventoryReport.wsdl
- **Audit Service**: http://localhost:8084

## 🔐 Demo Users

| Email | Password | Role | Warehouse |
|-------|----------|------|-----------|
| admin@demo.com | Admin@123 | ADMIN | All |
| user1@demo.com | User@123 | USER | WH-1 |
| user2@demo.com | User@123 | USER | WH-2 |

## 📡 API Documentation

### Authentication APIs (Port 8081)

#### Login (General)
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin@123"
  }'
```

#### Login (User Portal)
```bash
curl -X POST http://localhost:8081/api/auth/login/user \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user1@demo.com",
    "password": "User@123"
  }'
```

#### Login (Admin Portal)
```bash
curl -X POST http://localhost:8081/api/auth/login/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@demo.com",
    "password": "Admin@123"
  }'
```

#### Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "email": "admin@demo.com",
  "roles": ["ROLE_ADMIN"],
  "warehouseId": null
}
```

### User Management APIs

```bash
# Get all users (Admin only)
curl -X GET http://localhost:8081/api/users \
  -H "Authorization: Bearer <token>"

# Create user
curl -X POST http://localhost:8081/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@demo.com",
    "password": "Password@123",
    "firstName": "New",
    "lastName": "User",
    "roles": ["USER"],
    "warehouseId": "WH-1"
  }'

# Get current user profile
curl -X GET http://localhost:8081/api/users/me \
  -H "Authorization: Bearer <token>"
```

---

### Catalog APIs (Port 8082)

#### REST Endpoints

```bash
# Get all items (paginated)
curl -X GET "http://localhost:8082/api/items?page=0&size=10" \
  -H "Authorization: Bearer <token>"

# Search items
curl -X GET "http://localhost:8082/api/items/search?keyword=laptop" \
  -H "Authorization: Bearer <token>"

# Get items by category
curl -X GET "http://localhost:8082/api/items/category/1" \
  -H "Authorization: Bearer <token>"

# Create item
curl -X POST http://localhost:8082/api/items \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "sku": "NEW-001",
    "name": "New Product",
    "description": "Product description",
    "categoryId": 1,
    "supplierId": 1,
    "unitPrice": 99.99,
    "reorderLevel": 10,
    "reorderQuantity": 50
  }'

# Get all categories
curl -X GET http://localhost:8082/api/categories \
  -H "Authorization: Bearer <token>"

# Get all suppliers
curl -X GET http://localhost:8082/api/suppliers \
  -H "Authorization: Bearer <token>"
```

#### GraphQL Endpoint

Access GraphQL Playground at: http://localhost:8082/graphiql

**Sample Queries:**

```graphql
# Get all items
query {
  items {
    id
    sku
    name
    description
    unitPrice
    category {
      id
      name
    }
    supplier {
      id
      name
    }
  }
}

# Get single item
query {
  item(id: 1) {
    id
    sku
    name
    unitPrice
  }
}

# Get items by category
query {
  itemsByCategory(categoryId: 1) {
    id
    sku
    name
    unitPrice
  }
}

# Search items
query {
  searchItems(keyword: "laptop") {
    id
    sku
    name
  }
}

# Get all categories with items
query {
  categories {
    id
    name
    description
    items {
      id
      name
    }
  }
}

# Get all suppliers
query {
  suppliers {
    id
    name
    contactEmail
    contactPhone
    items {
      id
      name
    }
  }
}
```

**Sample Mutations:**

```graphql
# Create item
mutation {
  createItem(input: {
    sku: "GQL-001"
    name: "GraphQL Created Item"
    description: "Created via GraphQL"
    categoryId: 1
    supplierId: 1
    unitPrice: 149.99
    reorderLevel: 5
    reorderQuantity: 25
  }) {
    id
    sku
    name
  }
}

# Update item
mutation {
  updateItem(id: 1, input: {
    name: "Updated Item Name"
    unitPrice: 199.99
  }) {
    id
    name
    unitPrice
  }
}

# Delete item
mutation {
  deleteItem(id: 5)
}

# Create category
mutation {
  createCategory(input: {
    name: "New Category"
    description: "Category description"
  }) {
    id
    name
  }
}

# Create supplier
mutation {
  createSupplier(input: {
    name: "New Supplier"
    contactEmail: "supplier@example.com"
    contactPhone: "555-1234"
    address: "123 Supplier St"
  }) {
    id
    name
  }
}
```

---

### Inventory APIs (Port 8083)

#### REST Endpoints

```bash
# Get all warehouses
curl -X GET http://localhost:8083/api/warehouses \
  -H "Authorization: Bearer <token>"

# Get stock levels (paginated)
curl -X GET "http://localhost:8083/api/stock-levels?page=0&size=10" \
  -H "Authorization: Bearer <token>"

# Get stock levels by warehouse
curl -X GET "http://localhost:8083/api/stock-levels/warehouse/WH-1" \
  -H "Authorization: Bearer <token>"

# Get low stock items
curl -X GET http://localhost:8083/api/stock-levels/low-stock \
  -H "Authorization: Bearer <token>"

# Get stock movements
curl -X GET "http://localhost:8083/api/stock-movements?page=0&size=20" \
  -H "Authorization: Bearer <token>"

# Create stock movement
curl -X POST http://localhost:8083/api/stock-movements \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouseCode": "WH-1",
    "itemSku": "ELEC-001",
    "movementType": "IN",
    "quantity": 100,
    "reference": "PO-12345",
    "reason": "Purchase order received"
  }'

# Get replenishment requests
curl -X GET "http://localhost:8083/api/replenishments?page=0&size=10" \
  -H "Authorization: Bearer <token>"

# Get pending replenishments
curl -X GET "http://localhost:8083/api/replenishments/status/PENDING" \
  -H "Authorization: Bearer <token>"

# Create replenishment request
curl -X POST http://localhost:8083/api/replenishments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "warehouseCode": "WH-1",
    "itemSku": "ELEC-001",
    "requestedQuantity": 50,
    "priority": "HIGH",
    "reason": "Stock running low"
  }'

# Approve replenishment (Admin only)
curl -X PUT "http://localhost:8083/api/replenishments/1/approve?notes=Approved" \
  -H "Authorization: Bearer <token>"

# Reject replenishment (Admin only)
curl -X PUT "http://localhost:8083/api/replenishments/1/reject?notes=Budget constraints" \
  -H "Authorization: Bearer <token>"
```

#### SOAP Endpoint

**WSDL**: http://localhost:8083/ws/inventoryReport.wsdl

**Get Stock Report:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:inv="http://inventory.ims.com/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <inv:getStockReportRequest>
         <inv:warehouseCode>WH-1</inv:warehouseCode>
      </inv:getStockReportRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

**Get Low Stock Items:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" 
                  xmlns:inv="http://inventory.ims.com/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <inv:getLowStockItemsRequest>
         <inv:threshold>20</inv:threshold>
      </inv:getLowStockItemsRequest>
   </soapenv:Body>
</soapenv:Envelope>
```

**Test with curl:**
```bash
# Get Stock Report
curl -X POST http://localhost:8083/ws \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:inv="http://inventory.ims.com/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <inv:getStockReportRequest>
         <inv:warehouseCode>WH-1</inv:warehouseCode>
      </inv:getStockReportRequest>
   </soapenv:Body>
</soapenv:Envelope>'

# Get Low Stock Items
curl -X POST http://localhost:8083/ws \
  -H "Content-Type: text/xml" \
  -d '<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:inv="http://inventory.ims.com/soap">
   <soapenv:Header/>
   <soapenv:Body>
      <inv:getLowStockItemsRequest>
         <inv:threshold>20</inv:threshold>
      </inv:getLowStockItemsRequest>
   </soapenv:Body>
</soapenv:Envelope>'
```

---

### Audit APIs (Port 8084)

```bash
# Get audit events (paginated)
curl -X GET "http://localhost:8084/api/audit?page=0&size=20" \
  -H "Authorization: Bearer <token>"

# Search audit events
curl -X GET "http://localhost:8084/api/audit/search?serviceName=auth-service&eventType=LOGIN_SUCCESS" \
  -H "Authorization: Bearer <token>"

# Get events by service
curl -X GET "http://localhost:8084/api/audit/service/auth-service" \
  -H "Authorization: Bearer <token>"

# Get events by correlation ID
curl -X GET "http://localhost:8084/api/audit/correlation/<correlation-id>" \
  -H "Authorization: Bearer <token>"

# Get events by user
curl -X GET "http://localhost:8084/api/audit/user/admin@demo.com" \
  -H "Authorization: Bearer <token>"

# Get audit dashboard
curl -X GET http://localhost:8084/api/audit/dashboard \
  -H "Authorization: Bearer <token>"

# Create audit event (internal use)
curl -X POST http://localhost:8084/api/audit \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "test-service",
    "eventType": "TEST",
    "action": "Test action",
    "username": "admin@demo.com",
    "entityType": "Test",
    "entityId": "1",
    "details": "Test audit event",
    "success": true
  }'
```

---

## 📊 Database Consoles (H2)

Each service exposes an H2 console for database inspection:

| Service | H2 Console URL | JDBC URL |
|---------|---------------|----------|
| auth-service | http://localhost:8081/h2-console | jdbc:h2:mem:authdb |
| catalog-service | http://localhost:8082/h2-console | jdbc:h2:mem:catalogdb |
| inventory-service | http://localhost:8083/h2-console | jdbc:h2:mem:inventorydb |
| audit-service | http://localhost:8084/h2-console | jdbc:h2:mem:auditdb |

**Credentials**: `sa` / (empty password)

---

## 🔧 Configuration

### JWT Configuration

All services share the same JWT secret for cross-service token validation:

```properties
jwt.secret=YourSuperSecretKeyForJWTTokenGenerationMustBeLongEnough256Bits!!
jwt.expiration=86400000
```

### CORS Configuration

All services are configured to allow requests from:
- `http://localhost:4200` (Angular dev server)

### Logging Configuration

All services use structured JSON logging with:
- **Logback** with Logstash encoder
- **MDC** (Mapped Diagnostic Context) for correlation IDs
- **Request/Response** logging with timing

Log files location: `logs/<service-name>.log`

Sample log entry:
```json
{
  "@timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "logger": "com.ims.auth.controller.AuthController",
  "message": "Login successful for user: admin@demo.com",
  "correlationId": "abc123-def456-ghi789",
  "service": "auth-service"
}
```

---

## 📁 Project Structure

```
Inventory-management-system/
├── README.md
├── backend/
│   ├── auth-service/
│   │   ├── pom.xml
│   │   └── src/main/java/com/ims/auth/
│   │       ├── config/
│   │       ├── controller/
│   │       ├── dto/
│   │       ├── entity/
│   │       ├── repository/
│   │       ├── security/
│   │       └── service/
│   ├── catalog-service/
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/ims/catalog/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── entity/
│   │       │   ├── repository/
│   │       │   ├── resolver/      # GraphQL resolvers
│   │       │   ├── security/
│   │       │   └── service/
│   │       └── resources/
│   │           └── graphql/
│   │               └── schema.graphqls
│   ├── inventory-service/
│   │   ├── pom.xml
│   │   └── src/main/
│   │       ├── java/com/ims/inventory/
│   │       │   ├── config/
│   │       │   ├── controller/
│   │       │   ├── dto/
│   │       │   ├── entity/
│   │       │   ├── repository/
│   │       │   ├── security/
│   │       │   ├── service/
│   │       │   └── soap/          # SOAP endpoint
│   │       └── resources/
│   │           └── xsd/
│   │               └── inventory.xsd
│   └── audit-service/
│       ├── pom.xml
│       └── src/main/java/com/ims/audit/
│           ├── config/
│           ├── controller/
│           ├── dto/
│           ├── entity/
│           ├── repository/
│           ├── security/
│           └── service/
└── frontend/
    ├── package.json
    ├── angular.json
    └── src/
        ├── app/
        │   ├── core/              # Services, guards, interceptors
        │   ├── shared/            # Shared module
        │   ├── auth/              # Login components
        │   ├── user/              # User portal
        │   └── admin/             # Admin portal
        ├── environments/
        └── styles.scss
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend/<service-name>
mvn test
```

### Frontend Tests
```bash
cd frontend
ng test
```

---

## 🔄 Development Workflow

1. **Start all backend services** (in separate terminals)
2. **Start frontend** with `ng serve`
3. **Access** http://localhost:4200
4. **Login** with demo credentials
5. **Use H2 consoles** for database inspection
6. **Use GraphQL Playground** for testing queries
7. **Check logs** in `logs/` directory

---

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Windows - Find and kill process on port
netstat -ano | findstr :8081
taskkill /PID <pid> /F
```

### Maven Build Issues
```bash
cd backend/<service-name>
mvn clean install -DskipTests
```

### Angular Build Issues
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### JWT Token Issues
- Tokens expire after 24 hours
- Ensure all services use the same JWT secret
- Check correlation ID in headers for tracing

---

## 📝 License

This project is for educational/demonstration purposes.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a Pull Request

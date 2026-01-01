# ============================================================
# Inventory Management System - API Test Script (PS5.1 Compatible)
# ============================================================

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$reportFile = "api-test-report_$timestamp.txt"

# Service URLs
$authService = "http://localhost:8081"
$catalogService = "http://localhost:8082"
$inventoryService = "http://localhost:8083"
$auditService = "http://localhost:8084"

# Test credentials
$adminEmail = "admin@demo.com"
$adminPassword = "Admin@123"
$userEmail = "user1@demo.com"
$userPassword = "User@123"

# Results tracking
$results = @()
$passed = 0
$failed = 0
$adminToken = $null
$userToken = $null

function Write-Report {
    param([string]$message)
    Write-Host $message
    Add-Content -Path $reportFile -Value $message
}

function Test-Api {
    param(
        [string]$name,
        [string]$method,
        [string]$url,
        [string]$body = $null,
        [string]$token = $null,
        [string]$contentType = "application/json",
        [int[]]$expectedStatus = @(200, 201)
    )
    
    $result = @{
        Name = $name
        Method = $method
        URL = $url
        Status = "FAILED"
        StatusCode = 0
        Response = ""
        Error = ""
    }
    
    try {
        $headers = @{}
        if ($token) {
            $headers["Authorization"] = "Bearer $token"
        }
        
        $params = @{
            Uri = $url
            Method = $method
            ContentType = $contentType
            Headers = $headers
            ErrorAction = "Stop"
        }
        
        if ($body -and $method -ne "GET") {
            $params["Body"] = $body
        }
        
        $response = Invoke-RestMethod @params
        $result.StatusCode = 200
        $result.Response = ($response | ConvertTo-Json -Depth 5 -Compress) 
        
        if ($result.StatusCode -in $expectedStatus) {
            $result.Status = "PASSED"
            $script:passed++
        }
        
        return $result, $response
    }
    catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        $result.StatusCode = $statusCode
        $result.Error = $_.Exception.Message
        
        if ($statusCode -in $expectedStatus) {
            $result.Status = "PASSED"
            $script:passed++
        } else {
            $script:failed++
        }
        
        return $result, $null
    }
}

function Test-ServiceHealth {
    param([string]$serviceName, [string]$baseUrl)
    
    Write-Report "`n--- Testing $serviceName Health ---"
    
    $result, $response = Test-Api -name "$serviceName Health" -method "GET" -url "$baseUrl/actuator/health"
    $script:results += $result
    Write-Report "  Health Check: $($result.Status) (HTTP $($result.StatusCode))"
    
    return $result.Status -eq "PASSED"
}

# ============================================================
# MAIN TEST EXECUTION
# ============================================================

Write-Report "============================================================"
Write-Report "INVENTORY MANAGEMENT SYSTEM - API TEST REPORT"
Write-Report "============================================================"
Write-Report "Test Started: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Report "============================================================"

# Wait for services to be ready
Write-Report "`nWaiting for services to start..."
Start-Sleep -Seconds 3

# ============================================================
# 1. SERVICE HEALTH CHECKS
# ============================================================
Write-Report "`n============================================================"
Write-Report "1. SERVICE HEALTH CHECKS"
Write-Report "============================================================"

$authHealthy = Test-ServiceHealth -serviceName "Auth Service (8081)" -baseUrl $authService
$catalogHealthy = Test-ServiceHealth -serviceName "Catalog Service (8082)" -baseUrl $catalogService
$inventoryHealthy = Test-ServiceHealth -serviceName "Inventory Service (8083)" -baseUrl $inventoryService
$auditHealthy = Test-ServiceHealth -serviceName "Audit Service (8084)" -baseUrl $auditService

# ============================================================
# 2. AUTHENTICATION TESTS
# ============================================================
Write-Report "`n============================================================"
Write-Report "2. AUTHENTICATION TESTS"
Write-Report "============================================================"

if ($authHealthy) {
    # Test Admin Login
    Write-Report "`n--- Admin Login ---"
    $loginBody = @{email=$adminEmail; password=$adminPassword} | ConvertTo-Json
    $result, $response = Test-Api -name "Admin Login" -method "POST" -url "$authService/api/auth/login/admin" -body $loginBody
    $results += $result
    Write-Report "  Admin Login: $($result.Status) (HTTP $($result.StatusCode))"
    if ($response -and $response.token) {
        $adminToken = $response.token
        Write-Report "  Admin Token: Obtained successfully"
    } else {
        Write-Report "  Admin Token: FAILED - $($result.Error)"
    }
    
    # Test User Login
    Write-Report "`n--- User Login ---"
    $loginBody = @{email=$userEmail; password=$userPassword} | ConvertTo-Json
    $result, $response = Test-Api -name "User Login" -method "POST" -url "$authService/api/auth/login/user" -body $loginBody
    $results += $result
    Write-Report "  User Login: $($result.Status) (HTTP $($result.StatusCode))"
    if ($response -and $response.token) {
        $userToken = $response.token
        Write-Report "  User Token: Obtained successfully"
    } else {
        Write-Report "  User Token: FAILED - $($result.Error)"
    }
    
    # Test Validate Token (Admin)
    if ($adminToken) {
        Write-Report "`n--- Validate Token (Admin) ---"
        $result, $response = Test-Api -name "Validate Admin Token" -method "POST" -url "$authService/api/auth/validate" -token $adminToken
        $results += $result
        Write-Report "  Validate Token: $($result.Status) (HTTP $($result.StatusCode))"
    }
    
    # Test Get All Users (Admin only)
    if ($adminToken) {
        Write-Report "`n--- Get All Users (Admin) ---"
        $result, $response = Test-Api -name "Get All Users" -method "GET" -url "$authService/api/admin/users" -token $adminToken
        $results += $result
        Write-Report "  Get All Users: $($result.Status) (HTTP $($result.StatusCode))"
    }
} else {
    Write-Report "`n  SKIPPED - Auth Service not healthy"
}

# ============================================================
# 3. CATALOG SERVICE TESTS
# ============================================================
Write-Report "`n============================================================"
Write-Report "3. CATALOG SERVICE TESTS"
Write-Report "============================================================"

if ($catalogHealthy -and $adminToken) {
    # Test Get Categories
    Write-Report "`n--- Categories ---"
    $result, $response = Test-Api -name "Get All Categories" -method "GET" -url "$catalogService/api/catalog/categories" -token $adminToken
    $results += $result
    Write-Report "  Get All Categories: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Create Category
    $categoryBody = @{name="Test Category"; description="Test Description"; code="TEST001"} | ConvertTo-Json
    $result, $response = Test-Api -name "Create Category" -method "POST" -url "$catalogService/api/catalog/categories" -body $categoryBody -token $adminToken -expectedStatus @(200, 201, 400)
    $results += $result
    Write-Report "  Create Category: $($result.Status) (HTTP $($result.StatusCode))"
    $categoryId = if ($response -and $response.id) { $response.id } else { $null }
    
    # Test Get Items
    Write-Report "`n--- Items ---"
    $result, $response = Test-Api -name "Get All Items" -method "GET" -url "$catalogService/api/catalog/items" -token $adminToken
    $results += $result
    Write-Report "  Get All Items: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Create Item (if category exists)
    if ($categoryId) {
        $itemBody = @{
            name="Test Item"
            description="Test Item Description"
            sku="SKU-TEST-001"
            categoryId=$categoryId
            unitPrice=99.99
            reorderLevel=10
            reorderQuantity=50
        } | ConvertTo-Json
        $result, $response = Test-Api -name "Create Item" -method "POST" -url "$catalogService/api/catalog/items" -body $itemBody -token $adminToken -expectedStatus @(200, 201, 400)
        $results += $result
        Write-Report "  Create Item: $($result.Status) (HTTP $($result.StatusCode))"
    }
    
    # Test Get Suppliers
    Write-Report "`n--- Suppliers ---"
    $result, $response = Test-Api -name "Get All Suppliers" -method "GET" -url "$catalogService/api/catalog/suppliers" -token $adminToken
    $results += $result
    Write-Report "  Get All Suppliers: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Create Supplier
    $supplierBody = @{
        name="Test Supplier"
        contactPerson="John Doe"
        email="supplier@test.com"
        phone="1234567890"
        address="123 Test St"
    } | ConvertTo-Json
    $result, $response = Test-Api -name "Create Supplier" -method "POST" -url "$catalogService/api/catalog/suppliers" -body $supplierBody -token $adminToken -expectedStatus @(200, 201, 400)
    $results += $result
    Write-Report "  Create Supplier: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test GraphQL endpoint
    Write-Report "`n--- GraphQL ---"
    $graphqlBody = @{query="{ categories { id name } }"} | ConvertTo-Json
    $result, $response = Test-Api -name "GraphQL Query" -method "POST" -url "$catalogService/graphql" -body $graphqlBody -token $adminToken
    $results += $result
    Write-Report "  GraphQL Query: $($result.Status) (HTTP $($result.StatusCode))"
    
} else {
    Write-Report "`n  SKIPPED - Catalog Service not healthy or no admin token"
}

# ============================================================
# 4. INVENTORY SERVICE TESTS
# ============================================================
Write-Report "`n============================================================"
Write-Report "4. INVENTORY SERVICE TESTS"
Write-Report "============================================================"

if ($inventoryHealthy -and $adminToken) {
    # Test Get Warehouses
    Write-Report "`n--- Warehouses ---"
    $result, $response = Test-Api -name "Get All Warehouses" -method "GET" -url "$inventoryService/api/inventory/warehouses" -token $adminToken
    $results += $result
    Write-Report "  Get All Warehouses: $($result.Status) (HTTP $($result.StatusCode))"
    $warehouseId = if ($response -and $response.Count -gt 0) { $response[0].id } else { $null }
    
    # Test Create Warehouse
    $warehouseBody = @{
        name="Test Warehouse"
        code="WH-TEST-001"
        address="456 Warehouse St"
        city="Test City"
        state="TS"
        country="Testland"
        zipCode="12345"
    } | ConvertTo-Json
    $result, $response = Test-Api -name "Create Warehouse" -method "POST" -url "$inventoryService/api/inventory/warehouses" -body $warehouseBody -token $adminToken -expectedStatus @(200, 201, 400)
    $results += $result
    Write-Report "  Create Warehouse: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Get Stock
    Write-Report "`n--- Stock ---"
    $result, $response = Test-Api -name "Get All Stock" -method "GET" -url "$inventoryService/api/inventory/stock" -token $adminToken
    $results += $result
    Write-Report "  Get All Stock: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Get Low Stock Items
    Write-Report "`n--- Low Stock ---"
    $result, $response = Test-Api -name "Get Low Stock Items" -method "GET" -url "$inventoryService/api/inventory/stock/low" -token $adminToken
    $results += $result
    Write-Report "  Get Low Stock Items: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Get Replenishment Requests
    Write-Report "`n--- Replenishment ---"
    $result, $response = Test-Api -name "Get Pending Replenishments" -method "GET" -url "$inventoryService/api/inventory/replenishments/pending" -token $adminToken
    $results += $result
    Write-Report "  Get Pending Replenishments: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test SOAP endpoint (WSDL)
    Write-Report "`n--- SOAP Service ---"
    $result, $response = Test-Api -name "SOAP WSDL" -method "GET" -url "$inventoryService/ws/inventoryReport.wsdl" -token $null -contentType "text/xml"
    $results += $result
    Write-Report "  SOAP WSDL: $($result.Status) (HTTP $($result.StatusCode))"
    
} else {
    Write-Report "`n  SKIPPED - Inventory Service not healthy or no admin token"
}

# ============================================================
# 5. AUDIT SERVICE TESTS
# ============================================================
Write-Report "`n============================================================"
Write-Report "5. AUDIT SERVICE TESTS"
Write-Report "============================================================"

if ($auditHealthy -and $adminToken) {
    # Test Get Audit Events
    Write-Report "`n--- Audit Events ---"
    $result, $response = Test-Api -name "Get All Audit Events" -method "GET" -url "$auditService/api/audit/events" -token $adminToken
    $results += $result
    Write-Report "  Get All Audit Events: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Get Audit Events by Event Type
    $result, $response = Test-Api -name "Get Audit Events by Type" -method "GET" -url "$auditService/api/audit/events/type/LOGIN" -token $adminToken
    $results += $result
    Write-Report "  Get Events by Type: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test Get Audit Events by Service
    $result, $response = Test-Api -name "Get Audit Events by Service" -method "GET" -url "$auditService/api/audit/events/service/AUTH_SERVICE" -token $adminToken
    $results += $result
    Write-Report "  Get Events by Service: $($result.Status) (HTTP $($result.StatusCode))"
    
} else {
    Write-Report "`n  SKIPPED - Audit Service not healthy or no admin token"
}

# ============================================================
# 6. USER ROLE TESTS
# ============================================================
Write-Report "`n============================================================"
Write-Report "6. USER ROLE ACCESS TESTS"
Write-Report "============================================================"

if ($userToken) {
    # Test User access to stock (should work)
    Write-Report "`n--- User Access Tests ---"
    $result, $response = Test-Api -name "User: Get Stock" -method "GET" -url "$inventoryService/api/inventory/stock" -token $userToken
    $results += $result
    Write-Report "  User Get Stock: $($result.Status) (HTTP $($result.StatusCode))"
    
    # Test User access to admin endpoints (should fail with 403)
    $result, $response = Test-Api -name "User: Get All Users (Should Fail)" -method "GET" -url "$authService/api/admin/users" -token $userToken -expectedStatus @(403)
    $results += $result
    Write-Report "  User Get All Users (expect 403): $($result.Status) (HTTP $($result.StatusCode))"
} else {
    Write-Report "`n  SKIPPED - No user token available"
}

# ============================================================
# SUMMARY
# ============================================================
Write-Report "`n============================================================"
Write-Report "TEST SUMMARY"
Write-Report "============================================================"
Write-Report "Total Tests: $($passed + $failed)"
Write-Report "Passed: $passed"
Write-Report "Failed: $failed"
Write-Report "Success Rate: $([math]::Round(($passed / [math]::Max(1, $passed + $failed)) * 100, 2))%"
Write-Report "`n============================================================"
Write-Report "FAILED TESTS DETAILS"
Write-Report "============================================================"

$failedTests = $results | Where-Object { $_.Status -eq "FAILED" }
if ($failedTests) {
    foreach ($test in $failedTests) {
        Write-Report "`n[$($test.Name)]"
        Write-Report "  URL: $($test.URL)"
        Write-Report "  Method: $($test.Method)"
        Write-Report "  Status Code: $($test.StatusCode)"
        Write-Report "  Error: $($test.Error)"
    }
} else {
    Write-Report "`nNo failed tests!"
}

Write-Report "`n============================================================"
Write-Report "Test Completed: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Report "Report saved to: $reportFile"
Write-Report "============================================================"

# Return summary for script usage
@{
    Total = $passed + $failed
    Passed = $passed
    Failed = $failed
    Results = $results
    AdminToken = $adminToken
    UserToken = $userToken
}

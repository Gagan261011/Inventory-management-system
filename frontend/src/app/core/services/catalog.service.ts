import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Item, CreateItemRequest, UpdateItemRequest, Category, CreateCategoryRequest, Supplier, CreateSupplierRequest } from '../models/catalog.model';
import { Page } from '../models/audit.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private apiUrl = environment.apiUrl.catalog;

  constructor(private http: HttpClient) { }

  // Items
  getAllItems(page = 0, size = 20): Observable<Page<Item>> {
    return this.http.get<Page<Item>>(`${this.apiUrl}/items?page=${page}&size=${size}`);
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}`);
  }

  getItemBySku(sku: string): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/sku/${sku}`);
  }

  getItemsByCategory(categoryId: number, page = 0, size = 20): Observable<Page<Item>> {
    return this.http.get<Page<Item>>(`${this.apiUrl}/items/category/${categoryId}?page=${page}&size=${size}`);
  }

  getItemsBySupplier(supplierId: number, page = 0, size = 20): Observable<Page<Item>> {
    return this.http.get<Page<Item>>(`${this.apiUrl}/items/supplier/${supplierId}?page=${page}&size=${size}`);
  }

  searchItems(query: string, page = 0, size = 20): Observable<Page<Item>> {
    return this.http.get<Page<Item>>(`${this.apiUrl}/items/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`);
  }

  createItem(request: CreateItemRequest): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, request);
  }

  updateItem(id: number, request: UpdateItemRequest): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, request);
  }

  deleteItem(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/items/${id}`);
  }

  // Categories
  getAllCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`);
  }

  getCategory(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  createCategory(request: CreateCategoryRequest): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, request);
  }

  updateCategory(id: number, request: CreateCategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, request);
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`);
  }

  // Suppliers
  getAllSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers`);
  }

  getSupplier(id: number): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.apiUrl}/suppliers/${id}`);
  }

  searchSuppliers(query: string): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(`${this.apiUrl}/suppliers/search?query=${encodeURIComponent(query)}`);
  }

  createSupplier(request: CreateSupplierRequest): Observable<Supplier> {
    return this.http.post<Supplier>(`${this.apiUrl}/suppliers`, request);
  }

  updateSupplier(id: number, request: CreateSupplierRequest): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.apiUrl}/suppliers/${id}`, request);
  }

  deleteSupplier(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/suppliers/${id}`);
  }
}

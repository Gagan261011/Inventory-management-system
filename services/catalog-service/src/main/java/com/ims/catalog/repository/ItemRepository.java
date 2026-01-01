package com.ims.catalog.repository;

import com.ims.catalog.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemRepository extends JpaRepository<Item, Long> {
    Optional<Item> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    List<Item> findByActiveTrue();
    
    Page<Item> findByActiveTrue(Pageable pageable);
    
    List<Item> findByCategoryId(Long categoryId);
    
    List<Item> findBySupplierId(Long supplierId);
    
    @Query("SELECT i FROM Item i WHERE " +
           "(:text IS NULL OR LOWER(i.name) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(i.sku) LIKE LOWER(CONCAT('%', :text, '%')) " +
           "OR LOWER(i.description) LIKE LOWER(CONCAT('%', :text, '%'))) " +
           "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
           "AND i.active = true")
    List<Item> searchItems(@Param("text") String text, @Param("categoryId") Long categoryId);
    
    @Query("SELECT i FROM Item i WHERE i.name LIKE %:search% OR i.sku LIKE %:search% OR i.description LIKE %:search%")
    Page<Item> searchByText(@Param("search") String search, Pageable pageable);
}

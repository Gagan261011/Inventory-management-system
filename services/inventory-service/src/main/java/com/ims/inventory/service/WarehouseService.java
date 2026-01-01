package com.ims.inventory.service;

import com.ims.inventory.dto.CreateWarehouseRequest;
import com.ims.inventory.dto.WarehouseResponse;
import com.ims.inventory.entity.Warehouse;
import com.ims.inventory.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    public List<WarehouseResponse> getAllWarehouses() {
        return warehouseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<WarehouseResponse> getActiveWarehouses() {
        return warehouseRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public WarehouseResponse getWarehouseById(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        return mapToResponse(warehouse);
    }

    @Transactional
    public WarehouseResponse createWarehouse(CreateWarehouseRequest request) {
        log.info("Creating warehouse: {}", request.getName());
        
        Warehouse warehouse = Warehouse.builder()
                .name(request.getName())
                .code(request.getCode())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .contactPerson(request.getContactPerson())
                .contactPhone(request.getContactPhone())
                .active(true)
                .build();

        Warehouse saved = warehouseRepository.save(warehouse);
        log.info("Warehouse created: {}", saved.getName());
        return mapToResponse(saved);
    }

    @Transactional
    public WarehouseResponse updateWarehouse(Long id, CreateWarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));

        warehouse.setName(request.getName());
        warehouse.setCode(request.getCode());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setCountry(request.getCountry());
        warehouse.setContactPerson(request.getContactPerson());
        warehouse.setContactPhone(request.getContactPhone());

        Warehouse updated = warehouseRepository.save(warehouse);
        log.info("Warehouse updated: {}", updated.getName());
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = warehouseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Warehouse not found with id: " + id));
        warehouse.setActive(false);
        warehouseRepository.save(warehouse);
        log.info("Warehouse deactivated: {}", id);
    }

    private WarehouseResponse mapToResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .code(warehouse.getCode())
                .address(warehouse.getAddress())
                .city(warehouse.getCity())
                .country(warehouse.getCountry())
                .contactPerson(warehouse.getContactPerson())
                .contactPhone(warehouse.getContactPhone())
                .active(warehouse.isActive())
                .build();
    }
}

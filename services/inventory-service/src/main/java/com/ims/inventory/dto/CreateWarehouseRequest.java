package com.ims.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateWarehouseRequest {
    @NotBlank(message = "Name is required")
    private String name;
    
    @NotBlank(message = "Code is required")
    private String code;
    
    private String address;
    private String city;
    private String country;
    private String contactPerson;
    private String contactPhone;
}

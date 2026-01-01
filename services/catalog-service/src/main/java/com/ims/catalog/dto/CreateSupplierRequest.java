package com.ims.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateSupplierRequest {
    @NotBlank(message = "Name is required")
    private String name;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
}

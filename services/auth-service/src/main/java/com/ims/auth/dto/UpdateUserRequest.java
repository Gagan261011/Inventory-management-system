package com.ims.auth.dto;

import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private Long warehouseId;
    private Boolean active;
}

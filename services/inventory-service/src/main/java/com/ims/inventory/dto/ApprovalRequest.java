package com.ims.inventory.dto;

import lombok.Data;

@Data
public class ApprovalRequest {
    private boolean approved;
    private String reason;
}

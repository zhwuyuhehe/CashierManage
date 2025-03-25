package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
@TableName(value = "bill", autoResultMap = true)
public class bill_e {
    @Id
    private Long id;
    private Long member;
    private double sum;
    private String purchased;
    private java.time.OffsetDateTime create_time;
    private Boolean state;
}

package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
@TableName(value = "repository", autoResultMap = true)
public class repository_e {
    @Id
    @TableId
    private String name;
    private Long isn;
    private String category;
    private double cost;
    private double price;
    private Long stock;
    private double promoting;
    private java.time.OffsetDateTime update_time;
}

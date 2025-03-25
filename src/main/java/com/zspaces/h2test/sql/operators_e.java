package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
@TableName(value = "operators", autoResultMap = true)
public class operators_e {
    @Id
    @TableId
    private Long tel;
    private String pwd;
    private String nickname;
    private Boolean privilege;
    private Boolean activation;
    private java.time.OffsetDateTime create_time;
    private java.time.OffsetDateTime update_time;
}

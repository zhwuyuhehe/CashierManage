package com.zspaces.h2test.sql;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
@TableName(value = "members", autoResultMap = true)
public class members_e {
    private Long id;
    @Id
    @TableId
    private Long tel;
    private Long score;
    private java.time.OffsetDateTime create_time;
    private java.time.OffsetDateTime update_time;
}

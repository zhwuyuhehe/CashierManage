package com.zspaces.h2test.util;

import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Service;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Arrays;
import java.util.List;

@Service
public class ResetMemoryDatabase {

    private final DataSource dataSource;
    private final ResourceLoader resourceLoader;
    private final List<String> initScripts = Arrays.asList(
            "classpath:/schema.sql",
            "classpath:/data.sql"
    );

    public ResetMemoryDatabase(DataSource dataSource, ResourceLoader resourceLoader) {
        this.dataSource = dataSource;
        this.resourceLoader = resourceLoader;
    }

    public void ResetMyDatabase() {
        try (Connection connection = dataSource.getConnection()) {
            // 清空现有数据（可选）
            ScriptUtils.executeSqlScript(connection,
                    resourceLoader.getResource("classpath:/cleanup.sql"));

            // 顺序执行初始化脚本
            for (String script : initScripts) {
                Resource resource = resourceLoader.getResource(script);
                ScriptUtils.executeSqlScript(connection, resource);
            }
        } catch (Exception e) {
            throw new RuntimeException("数据库重置失败：" + e.getMessage(), e);
        }
    }
}

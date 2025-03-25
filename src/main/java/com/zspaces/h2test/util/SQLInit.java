package com.zspaces.h2test.util;


import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;
import org.springframework.web.context.WebApplicationContext;

import java.sql.Connection;
import java.sql.DriverManager;

@Slf4j
@Component
public class SQLInit implements ApplicationListener<ApplicationReadyEvent> {
    @Resource
    private WebApplicationContext webApplicationContext;
    @Value("${spring.datasource.url}")
    private String databaseUrl;
    @Value("${spring.datasource.username}")
    private String databaseUsername;
    @Value("${spring.datasource.password}")
    private String databasePassword;

    @Override
    public void onApplicationEvent(@NotNull ApplicationReadyEvent event) {
        // 在这里执行数据库连接检查逻辑
        if (isDatabaseConnected()) {
            log.info("数据库连接成功，系统启动完毕！");
        } else {
            log.error("服务器连接失败，系统即将关闭！");
            try {
                Thread.sleep(1500);
            } catch (InterruptedException e) {
                throw new RuntimeException(e);
            }
            System.exit(SpringApplication.exit(webApplicationContext));
            // 在这里可以考虑停止应用程序或采取其他必要的操作

        }
    }

    private boolean isDatabaseConnected() {
        try {
            // 在这测试连接数据库
            Connection connection = DriverManager.getConnection(databaseUrl, databaseUsername, databasePassword);
            connection.close();
            return true; //连接成功则返回真
        } catch (Exception e) {
            log.error(e.getMessage(), e);
            return false; // 此处表示数据库连接异常
        }
    }
}

package com.zspaces.h2test;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.sql.*;

@RestController
public class bill_e {
    @RequestMapping("/listBill")
    String listBill() throws SQLException {
        Connection conn = DriverManager.getConnection("jdbc:h2:mem:zlinux");
        Statement stmt = conn.createStatement();

//        stmt.execute("INSERT INTO PUBLIC.\"bill\" (ID, MEMBER, SUM, PURCHASED, CREATE_TIME, STATE) VALUES (2024032028726679, 15237166683, 96, '[{\"name\": \"卫龙大面筋\", \"count\": 16, \"price\": 6.0, \"subTotal\": 96.0}]', '2024-03-20 09:58:46.682320 +00:00', true);");

        ResultSet res = stmt.executeQuery("select * from \"bill\"");
        if (res.next()) {
            System.out.println(res.getInt(1));
        }
        return "执行完毕，看控制台。";
    }
}

package com.zspaces.h2test.util;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zspaces.h2test.sql.repository_e;
import com.zspaces.h2test.sql.repository_m;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Part;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.sql.*;
import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Slf4j
@RestController
public class repository {
    private final repository_m RepositoryMapper;

    @Autowired
    public repository(repository_m repositoryMapper) {
        RepositoryMapper = repositoryMapper;
    }

    @RequestMapping(value = "/PrintAllRepository", method = POST)
    Flux<String> PrintAllRepository() {
        List<repository_e> re = RepositoryMapper.selectList(null);
        JSONObject res = new JSONObject();
        res.put("code", 0);
        res.put("count", re.size());
        res.put("data", re);
        return Flux.just(JSONObject.toJSONString(res));
    }

    @RequestMapping(value = "/SearchRepository", method = POST)
    JSONObject SearchRepository(@RequestParam String tradeName) {
        JSONObject searchRes = new JSONObject();
        List<repository_e> re = (RepositoryMapper.SelectLike(tradeName));
        searchRes.put("code", 0);
        searchRes.put("count", re.size());
        searchRes.put("data", re);
        return searchRes;
    }

    @RequestMapping(value = "/SearchOneISN", method = POST)
    JSONObject SearchOneISN(@RequestParam Long ISN) {
        JSONObject searchISN = new JSONObject();
        List<repository_e> re = RepositoryMapper.SelectISN(ISN);
        searchISN.put("code", 0);
        searchISN.put("count", 1);
        searchISN.put("data", re);
        return searchISN;
    }

    @RequestMapping(value = "/AddTrade", method = POST)
    Boolean AddTrade(@RequestParam String tradeName, @RequestParam Long tradeISN, @RequestParam String tradeCategory, @RequestParam Double tradeCost, @RequestParam Double tradePrice, @RequestParam Long tradeStock, @RequestParam Double tradePromoting) {
        return RepositoryMapper.InsertRepository(tradeName, tradeISN, tradeCategory, tradeCost, tradePrice, tradeStock, tradePromoting);
    }

    @RequestMapping(value = "/DelManyRepository", method = POST)
    int DelManyMembers(@NotNull @RequestParam(value = "name[]") List<String> tradeName, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return RepositoryMapper.deleteBatchIds(tradeName);
    }

    @RequestMapping(value = "/EditRepositoryCost", method = POST)
    Boolean EditRepositoryCost(@RequestParam String Name, @RequestParam Double Cost) {
        System.out.println(Name + Cost);
        return RepositoryMapper.update(new LambdaUpdateWrapper<repository_e>().eq(repository_e::getName, Name).set(repository_e::getCost, Cost).set(repository_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/EditRepositoryPrice", method = POST)
    Boolean EditRepositoryPrice(@RequestParam String Name, @RequestParam Double Price) {
        return RepositoryMapper.update(new LambdaUpdateWrapper<repository_e>().eq(repository_e::getName, Name).set(repository_e::getPrice, Price).set(repository_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/EditRepositoryStock", method = POST)
    Boolean EditRepositoryStock(@RequestParam String Name, @RequestParam Long Stock) {
        return RepositoryMapper.update(new LambdaUpdateWrapper<repository_e>().eq(repository_e::getName, Name).set(repository_e::getStock, Stock).set(repository_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/EditRepositoryPromoting", method = POST)
    Boolean EditRepositoryPromoting(@RequestParam String Name, @RequestParam Double Promoting) {
        return RepositoryMapper.update(new LambdaUpdateWrapper<repository_e>().eq(repository_e::getName, Name).set(repository_e::getPromoting, Promoting).set(repository_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/RepositoryUploadCSV", method = POST)
    Boolean RepositoryUploadCSV(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException, ServletException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        Part File = request.getPart("MyData");
        InputStream FileInput = File.getInputStream();
        CSVFormat csvFormat = CSVFormat.DEFAULT.builder().setHeader("name", "isn", "category", "cost", "price", "stock", "promoting").setSkipHeaderRecord(true).build();
        CSVParser csvParser = new CSVParser(new InputStreamReader(FileInput), csvFormat);
        String url = "jdbc:h2:mem:zlinux";
        String username = "zlinux";
        String password = "zlinux";
        List<CSVRecord> csvRecords = csvParser.getRecords();
        try {
            Connection connection = DriverManager.getConnection(url, username, password);
            PreparedStatement ps = connection.prepareStatement("insert into repository(name, isn, category, cost, price, stock, promoting,update_time) values (?,?,?,?,?,?,?,CURRENT_TIMESTAMP)");
            for (CSVRecord csvRecord : csvRecords) {
//                ps.setLong(1, Long.parseLong(csvRecord.get("tel")));
                ps.setString(1, csvRecord.get("name"));
                ps.setLong(2, Long.parseLong(csvRecord.get("isn")));
                ps.setString(3, csvRecord.get("category"));
                ps.setDouble(4, Double.parseDouble(csvRecord.get("cost")));
                ps.setDouble(5, Double.parseDouble(csvRecord.get("price")));
                ps.setLong(6, Long.parseLong(csvRecord.get("stock")));
                ps.setDouble(7, Double.parseDouble(csvRecord.get("promoting")));
                ps.addBatch();
            }
            ps.executeBatch();
            ps.clearParameters();
            ps.clearBatch();
            connection.close();
        } catch (SQLException e) {
            log.error(String.valueOf(new SQLDataException(e)));
            return false;
        }
        return true;
    }

}

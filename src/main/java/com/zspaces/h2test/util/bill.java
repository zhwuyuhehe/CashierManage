package com.zspaces.h2test.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONArray;
import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zspaces.h2test.sql.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Slf4j
@RestController
public class bill {
    private final bill_m BillMapper;
    private final repository_m RepositoryMapper;
    private final members_m MembersMapper;

    @Autowired
    public bill(bill_m billMapper, repository_m repositoryMapper, members_m membersMapper) {
        BillMapper = billMapper;
        RepositoryMapper = repositoryMapper;
        MembersMapper = membersMapper;
    }

    //    下列是bill表有关的操作
    @RequestMapping(value = "/PurchasedInfo", method = POST)
    JSONObject PurchasedSelectById(@RequestParam Long billId, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("UTF-8");
        JSONObject res = new JSONObject();
        res.put("code", 0);
        res.put("count", 1);
        res.put("data", JSON.parseArray(BillMapper.SelectPurchasedById(billId)));
        return (res);
    }

    @RequestMapping(value = "/BillInsert", method = POST)
    Boolean BillInsertData(@RequestParam Long member, @RequestParam String cartData, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("UTF-8");
        Double sum = 0.0;
//        System.out.println(member);
        JSONArray purchased = new JSONArray();

        JSONArray cartArray = JSONArray.parseArray(cartData);
        for (int i = 0; i < cartArray.size(); i++) {
            sum += cartArray.getJSONObject(i).getDouble("subTotal");

            JSONObject addPurchased = new JSONObject();
            addPurchased.put("name", cartArray.getJSONObject(i).getString("name"));
            addPurchased.put("price", cartArray.getJSONObject(i).getDoubleValue("price"));
            addPurchased.put("count", cartArray.getJSONObject(i).getLongValue("count"));
            addPurchased.put("subTotal", cartArray.getJSONObject(i).getDoubleValue("subTotal"));
            RepositoryMapper.update(new LambdaUpdateWrapper<repository_e>().eq(repository_e::getName, cartArray.getJSONObject(i).getString("name")).set(repository_e::getStock, cartArray.getJSONObject(i).getLongValue("stock") - cartArray.getJSONObject(i).getLongValue("count")));
            purchased.add(addPurchased);

        }

        LocalDateTime dateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        long billId = Long.parseLong(dateTime.format(formatter).concat(String.valueOf((Instant.now().toEpochMilli() % 100000000))));
        MembersMapper.update(new LambdaUpdateWrapper<members_e>().eq(members_e::getTel,member).setSql(String.format(" score = score + %d",Math.round(sum))));
        return BillMapper.InsertData(billId, member, String.valueOf(purchased), sum);
    }

    @RequestMapping(value = "/DelManyBill", method = POST)
    int DelManyMembers(@NotNull @RequestParam(value = "id[]") List<Long> id, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return BillMapper.deleteBatchIds(id);
    }

    @RequestMapping(value = "/BillUpdateState", method = POST)
    Boolean BillUpdateState(@NotNull @RequestBody JSONObject requestData, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return BillMapper.UpdateState(requestData.getLong("id"), requestData.getBoolean("state"));
    }

    @RequestMapping(value = "/PrintAllBill", method = POST)
    JSONObject PrintAllBill() {
        List<bill_e> be = BillMapper.selectList(null);
        JSONObject res = new JSONObject();
        res.put("code", 0);
        res.put("count", (long) be.size());
        res.put("data", be);
        return res;
    }

    @RequestMapping(value = "/SearchBill", method = POST)
    JSONObject SearchBill(@RequestParam Long billId, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("UTF-8");
        List<bill_e> be = BillMapper.SearchBill(billId);
        JSONObject searchRes = new JSONObject();
        searchRes.put("code", 0);
        searchRes.put("count", be.size());
        searchRes.put("data", be);
        return (searchRes);
    }

}

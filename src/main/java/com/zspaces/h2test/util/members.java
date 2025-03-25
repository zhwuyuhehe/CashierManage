package com.zspaces.h2test.util;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zspaces.h2test.sql.members_e;
import com.zspaces.h2test.sql.members_m;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
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
public class members {
    private final members_m MembersMapper;//查找表内所有信息

    @Autowired
    public members(members_m membersMapper) {
        MembersMapper = membersMapper;
    }

    //    下列是members表有关的操作
    @RequestMapping(value = "/PrintAllMembers", method = POST)
    JSONObject MemberSelectAll(@RequestParam int page, @RequestParam int limit, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("UTF-8");
        List<members_e> me = MembersMapper.selectList(null);
        JSONObject allMembers = new JSONObject();
        allMembers.put("count", me.size());
        allMembers.put("code", 0);
        int fromIndex = (page - 1) * limit;
        int toIndex = Math.min(((page - 1) * limit + limit), me.size());
        allMembers.put("data", me.subList(fromIndex, toIndex));
        return allMembers;
    }

    @RequestMapping(value = "/RegisterMember", method = POST)
    String RegisterMember(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        Long tel = Long.valueOf(request.getParameter("usr"));//手机号，唯一标识
        if (String.valueOf(tel).length() != 11) {
            return "请输入正确的手机号！";
        }
        LocalDateTime dateTime = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
        Long id = Long.valueOf(dateTime.format(formatter).concat(String.valueOf((Instant.now().toEpochMilli() % 100000000))));

        if (String.valueOf(MembersMapper.selectById(tel)).equals("null"))
            return String.valueOf(MembersMapper.InsertMember(id, tel));
        else return "用户已存在！";
    }

    @RequestMapping(value = "/DelManyMembers", method = POST)
    int DelManyMembers(@NotNull @RequestParam(value = "tel[]") List<Long> tel, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return MembersMapper.deleteBatchIds(tel);
    }

    @RequestMapping(value = "/SearchMember", method = POST)
    JSONObject SearchMember(@RequestParam int page, @RequestParam int limit, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        Long searchKey = Long.valueOf(request.getParameter("tel"));
        List<members_e> me = MembersMapper.SelectLike(searchKey, (page - 1) * limit, limit);
        JSONObject SearchRes = new JSONObject();
        SearchRes.put("code", 0);
        SearchRes.put("count", MembersMapper.SelectLikeCount(searchKey));
        SearchRes.put("data", me);
        return SearchRes;
    }

    @RequestMapping(value = "/EditMemberTableScore", method = POST)
    Boolean EditMemberTableScore(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return MembersMapper.update(new LambdaUpdateWrapper<members_e>().eq(members_e::getTel, Long.valueOf(request.getParameter("tel"))).set(members_e::getScore, Long.valueOf(request.getParameter("score"))).set(members_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/MemberIsExist", method = POST)
    Boolean MemberIsExist(@RequestParam Long tel) {
        return MembersMapper.exists(new LambdaQueryWrapper<members_e>().eq(members_e::getTel, tel));
    }
}

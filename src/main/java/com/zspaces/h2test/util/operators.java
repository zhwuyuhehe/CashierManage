package com.zspaces.h2test.util;

import com.alibaba.fastjson2.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.zspaces.h2test.sql.operators_e;
import com.zspaces.h2test.sql.operators_m;
import jakarta.servlet.annotation.MultipartConfig;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.extern.slf4j.Slf4j;
import org.jetbrains.annotations.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.List;

import static org.springframework.web.bind.annotation.RequestMethod.POST;

@Slf4j
@RestController
@MultipartConfig(maxFileSize = 1L)
public class operators {
    // 这里包含了登录，退出，注册，编辑职工用户信息，获取session.key的接口
    private final operators_m OperatorsMapper;
    private final ResetMemoryDatabase RMD;

    @Autowired
    public operators(operators_m operatorsMapper,  ResetMemoryDatabase RMD) {
        OperatorsMapper = operatorsMapper;//注入OperatorsMapper
        this.RMD = RMD;

    }

    @RequestMapping(value = "/Login", method = POST)
    JSONObject Login(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        HttpSession session = request.getSession();
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("application/json");
        String user = request.getParameter("usr");
        String IpGet = request.getRemoteAddr();
        if (IpGet.equals("0:0:0:0:0:0:0:1")) {
            IpGet = "localhost";
        } else if (request.getHeader("X-Forwarded-For") != null) {
            IpGet = request.getHeader("X-Forwarded-For").split(",")[0].trim();
        } else IpGet = "null";

        //初始化类型为JSON对象的login中的各项值
        String initLoginJSON = """
                {"loginStatus":"false",
                "userTel":"null",
                "userNickname":"null",
                "isRoot":"false",
                "isActive":"false",
                "loginInfo":"登录错误"}
                """;
        JSONObject login = JSONObject.parseObject(initLoginJSON);
        //先验证是不是已经登录过的账户，未登录的账户在判断体内进行下一步操作，否则返回请勿重复登录。
        if (!user.equals(session.getAttribute("user")) || session.isNew()) {
            String pwd = request.getParameter("pwd");
            //从数据库中验证用户名和密码，若正确，返回字符串true。否则返回账户名或密码错误。
            if (OperatorsMapper.selectList(new LambdaQueryWrapper<operators_e>().eq(operators_e::getTel, Long.valueOf(user))).isEmpty()) {
                login.put("loginInfo", "无此账户");
            } else {
                operators_e sqlRes = OperatorsMapper.selectById(Long.valueOf(user));
                if (sqlRes.getPwd().equals(pwd)) {
//                    设置了session用户名user和昵称userNickname
                    session.setAttribute("user", user);
                    session.setAttribute("userNickname", sqlRes.getNickname());
                    login.put("loginStatus", true);
                    login.put("loginInfo", "登录成功");
                    login.put("userTel", user);
                    login.put("userNickname", session.getAttribute("userNickname"));
                    login.put("isActive", String.valueOf(sqlRes.getActivation()));
                    if (sqlRes.getPrivilege()) {
//                        设置了session记录isRoot的状态
                        session.setAttribute("isRoot", true);
//                        System.out.println("我设置了isRoot为真");
                        login.put("isRoot", true);
                    }
                } else {
                    login.put("loginInfo", "账户名或密码错误");
                }
            }
        } else {
            login.put("loginStatus", true);
            login.put("loginInfo", "请勿重复登录");
        }
        log.info("来自" + IpGet + "的用户访问了此系统" + login.toJSONString());
        return login;
    }

    @RequestMapping(value = "/Logout", method = POST)
    Boolean Logout(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/plain");
        HttpSession session = request.getSession();
        session.removeAttribute("user");
        session.removeAttribute("isRoot");
        session.removeAttribute("nickname");
        session.invalidate();
//        todo 重置数据库;测试是否可行
        RMD.ResetMyDatabase();
        return true;
    }

    @RequestMapping(value = "/RegisterOperator", method = POST)
    String RegisterOperator(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        Long tel = Long.valueOf(request.getParameter("usr"));//手机号，唯一标识
        String pwd = request.getParameter("pwd");//密码
        if (String.valueOf(OperatorsMapper.selectById(tel)).equals("null"))
            return String.valueOf(OperatorsMapper.InsertOperator(tel, pwd));
        else return "用户已存在";
    }

    @RequestMapping(value = "/PrintAllOperator", method = POST)
    JSONObject PrintAllOperator() {
        List<operators_e> oe = OperatorsMapper.selectList(null);
        JSONObject res = new JSONObject();
        res.put("code", 0);
        res.put("count", (long) oe.size());
        res.put("data", oe);
        return res;
    }

    @RequestMapping(value = "/EditUser", method = POST)
    Boolean EditUser(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        response.setContentType("text/html");
        Long tel = Long.valueOf(request.getParameter("tel"));//手机号，唯一标识
        String nickname = request.getParameter("nickname");
        String pwd = request.getParameter("pwd");//密码
        String pwdRe = request.getParameter("pwdRe");//密码

        if (OperatorsMapper.selectById(tel).getPwd().equals(pwd)) {
            if (pwdRe.isEmpty()) {
                OperatorsMapper.UpdateNickname(tel, nickname);
            } else {

                OperatorsMapper.UpdatePwdAndNickname(tel, nickname, pwdRe);
            }
            request.getSession().setAttribute("userNickname", nickname);
            return true;
        } else return false;

    }

    @RequestMapping(value = "/EditOperatorTableNickname", method = POST)
    Boolean EditOperatorTableNickname(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        if (request.getSession().getAttribute("user") == request.getParameter("tel")) {
            request.getSession().setAttribute("nickname", request.getParameter("nickname"));
        }
        return OperatorsMapper.update(new LambdaUpdateWrapper<operators_e>().eq(operators_e::getTel, Long.valueOf(request.getParameter("tel"))).set(operators_e::getNickname, request.getParameter("nickname")).set(operators_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;

    }

    @RequestMapping(value = "/EditActivationStatus", method = POST)
    Boolean EditActivationStatus(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return OperatorsMapper.update(new LambdaUpdateWrapper<operators_e>().eq(operators_e::getTel, Long.valueOf(request.getParameter("tel"))).set(operators_e::getActivation, Boolean.valueOf(request.getParameter("activation"))).set(operators_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/EditAdministratorStatus", method = POST)
    Boolean EditAdministratorStatus(@NotNull @RequestBody JSONObject requestData, @NotNull HttpServletResponse response) {
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return OperatorsMapper.update(new LambdaUpdateWrapper<operators_e>().eq(operators_e::getTel, requestData.getLong("tel")).set(operators_e::getPrivilege, requestData.getBoolean("isRoot")).set(operators_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/DelManyOperators", method = POST)
    int DelOperators(@NotNull @RequestParam(value = "tel[]") List<Long> tel, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return OperatorsMapper.deleteBatchIds(tel);
    }

    @RequestMapping(value = "/ChangeOperatorPwd", method = POST)
    Boolean ChangeOperatorPwd(@NotNull @RequestParam Long tel, @RequestParam String pwd, @NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        return OperatorsMapper.update(new LambdaUpdateWrapper<operators_e>().eq(operators_e::getTel, tel).set(operators_e::getPwd, pwd).set(operators_e::getUpdate_time,java.time.LocalDateTime.now())) == 1;
    }

    @RequestMapping(value = "/GetSession", method = POST)
    Object GetSession(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        String key = request.getParameter("key");
        return request.getSession().getAttribute(key);
    }

    @RequestMapping(value = "/SearchOperator", method = POST)
    JSONObject SearchOperator(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("utf-8");
        response.setCharacterEncoding("utf-8");
        response.setContentType("text/html");
        Long searchKey = Long.valueOf(request.getParameter("usrTel"));
        List<operators_e> oe = OperatorsMapper.SelectLike(searchKey);
        JSONObject SearchRes = new JSONObject();
        SearchRes.put("code", 0);
        SearchRes.put("count", (long) oe.size());
        SearchRes.put("data", oe);
        return SearchRes;
    }

}

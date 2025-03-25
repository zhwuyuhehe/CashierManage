//登录按钮使用的JS
layui.use(['sliderVerify', 'jquery', 'form',], function () {
    let $ = layui.jquery;
    let sliderVerify = layui.sliderVerify;
    let form = layui.form;
    let slider = sliderVerify.render({
        elem: '#slider',
        bg: 'layui-bg-blue',
        onOk: function () {//当验证通过回调
            return null;
            // layer.msg("滑块验证通过");
        }
    });
    //重置滑块
    $('#reset_slider').click(function () {
        slider.reset();
    });
    //监听提交
    form.on('submit(formDemo)', function () {
        let login_pwd = $('#login_pwd').val();
        let login_num = $('#login_num').val();
        if (slider.isOk()) {//用于表单验证是否已经滑动成功
            $.ajax({
                url: 'Login',
                type: 'post',
                async: true,
                data: {
                    usr: login_num,
                    pwd: new Hashes.MD5().hex(login_pwd),
                },
                success: function (resData) {
                    // 这里把返回值给到一个常量里，是为了消除编译器提示无此字段的报错，因为这里的变量名字都是我单独设置的。
                    const res = {
                        loginStatus: resData.loginStatus,
                        userTel: resData.userTel,
                        userNickname: resData.userNickname,
                        isRoot: resData.isRoot,
                        isActive: resData.isActive,
                        loginInfo: resData.loginInfo
                    };

                    if (res.loginStatus === true) {
                        if (res.loginInfo === "请勿重复登录") {
                            layer.msg("请勿重复登录，跳转中！", {icon: 0, time: 2000}, function () {
                                window.location.href = './user.html';
                            });
                        } else {
                            layer.msg("欢迎" + login_num + "登录", {icon: 1});
                            sessionStorage.setItem("userNickname", res.userNickname);
                            sessionStorage.setItem("isActive", res.isActive);
                            setTimeout(function () {
                                if (res.isRoot === true) {
                                    window.location.href = './admin.html';
                                } else if (sessionStorage.isActive === 'true') {
                                    window.location.href = './cashier.html'
                                } else {
                                    window.location.href = './user.html';
                                }
                            }, 1000);
                        }

                    } else {
                        layer.msg(res.loginInfo, {icon: 2})
                    }


                    //     if (res.loginInfo === "\"请勿重复登录\"") {
                    //     layer.msg("请勿重复登录，跳转中！", {icon: 0, time: 2000}, function () {
                    //         window.location.href = 'index.html';
                    //     });
                    // } else if (res.loginInfo === "\"账户名或密码错误\"") {
                    //     layer.msg(res, {icon: 2});
                    // } else {
                    //     layer.msg(res, {icon: 2})
                    // }
                },
                error: function (data) {
                    let res = JSON.stringify(data);
                    layer.alert('服务器异常' + res, {icon: 2});
                }
            });
            // slider.reset(); // 重置滑块位置

        } else {
            layer.msg("请先通过滑块验证");
        }
        return false;
    });
});

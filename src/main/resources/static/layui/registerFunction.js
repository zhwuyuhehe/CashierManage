<!--注册页面使用的JS-->
layui.use(['jquery', 'form'], function () {
    const form = layui.form;
    const layer = layui.layer;
    const $ = layui.jquery;
    //自定义验证规则
    form.verify({
        confirmVerify: function (value) {
            let verifyCode = $('#validationCaptcha').val();
            if (value.toLowerCase() !== verifyCode) {
                return '你输入的\"' + value + '\"验证码错误,为什么呢？\<br\>' + '正确的验证码是：' + verifyCode
            }
        },
        my_user_pwd: [
            /^(?!^(\d+|[a-z]+|[A-Z]+)$)[\da-zA-Z]{8,16}$/
            , '密码必须8到16位，只能包含字母和数字且混合。'
        ],
        my_phone: [
            /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
            , '请输入正确的手机号。例：18888888888'
        ],
        confirmPwd: function (value) {
            let passwordValue = $('#pwd').val();
            if (value !== passwordValue) {
                return '两次密码输入不一致';
            }
        }
    });
    // 提交事件
    form.on('submit(registerButton)', function () {
        // let field = data.field; // 获取表单字段值
        // 显示填写结果，仅作演示用
        // layer.alert(JSON.stringify(field), {
        //     title: '当前填写的字段值'
        // });

        // 此处可执行 Ajax 等操作
        // 调用后端，把注册的信息给后端，传入手机号和密码。
        let usrPhone = $('#phoneNum').val();
        let regPwd = $('#pwd').val();
        $.ajax({
            url: 'RegisterOperator',
            type: 'post',
            async: true,
            data: {
                usr: usrPhone,
                pwd: new Hashes.MD5().hex(regPwd),
            },
            success: function (data) {
                let res = JSON.stringify(data);
                if (res === "\"true\"") {
                    layer.msg("欢迎" + usrPhone + "加入我们", {icon: 1});
                    setTimeout(function () {
                        window.location.href = './index.html';
                    }, 1000);

                } else if (res === "\"用户已存在\"") {
                    layer.msg("用户已存在,请勿重复注册！", {icon: 0});
                }
            },
            error: function (data) {
                let res = JSON.stringify(data);
                layer.alert('服务器异常' + res, {icon: 2});
            }
        });

        return false; // 阻止默认 form 跳转
    });
});

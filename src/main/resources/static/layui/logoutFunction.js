let throttle = layui.throttle(function () {
    axios.post('/Logout').then(function (response) {
        if (response.data === true)
            layui.layer.msg("注销成功", {icon: 6, time: 1000}, () => {
                window.location.href = './index.html';
            });
        sessionStorage.clear();
    });
}, 3000);

// 注销功能使用的JS
function logout() {
    throttle();
}

//菜单中判断权限跳转页面
function JumpTo() {
    const reqData = new URLSearchParams();
    reqData.append('key', 'isRoot');
    axios.post('/GetSession', reqData).then((sessionIsRoot) => {
        if (sessionIsRoot.data) {
            window.location.href = './admin.html';
        } else {
            window.location.href = './user.html';
        }
    }).catch(
        (errorRes) => {
            layui.layer.msg("服务器错误<br>" + errorRes, {icon: 2})
        }
    );
}

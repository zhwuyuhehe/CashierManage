//渲染职工信息的表格
layui.use(function () {
    const table = layui.table;
    const layer = layui.layer;
    const dropdown = layui.dropdown;
    const form = layui.form;
    const util = layui.util;
    const $ = layui.jquery;

    // 创建渲染实例
    table.render({
        elem: '#OperatorTable'
        , url: '/PrintAllOperator' // 实际使用时需换成真实接口
        , method: 'post'
        , toolbar: '#OperatorToolBar'
        , defaultToolbar: ['filter', 'exports', {
            title: '提示'
            , layEvent: 'LAYTABLE_TIPS'
            , icon: 'layui-icon-tips'
        }]
        , height: 'full-200' // 最大高度减去其他容器已占有得高度差'full-35'
        , cellMinWidth: 80
        // , totalRow: true // 开启合计行
        // , page: true // 开启分页

        , cols: [[
            {type: 'checkbox', fixed: 'left'}
            , {
                field: 'tel',
                fixed: 'left',
                width: 120,
                fieldTitle: '账户名',
                title: '账户名',
                sort: true
            }
            , {
                field: 'nickname',
                width: 120,
                title: '昵称<i class="layui-icon layui-icon-tips layui-font-14" title="这里可以编辑" style="margin-left: 5px;"></i>',
                fieldTitle: '昵称',
                edit: 'textarea',
                sort: true
            }
            , {
                field: 'privilege',
                fieldTitle: '权限',
                title: '权限',
                templet: '#privilegeStatus',
                exportTemplet: function (d, obj) {
                    //     处理该字段的导出数据
                    let td = obj.td(this.field); // 获取当前 td
                    return td.find('.layui-form-switch>div').text(); // 返回 span 中的内容,而不是span标签内的val值

                }
            }
            , {
                field: 'activation',
                title: '激活',
                width: 100,
                templet: '#activation_dropdown'
            }, {
                field: 'create_time',
                width: 240,
                title: '创建时间',
                sort: true,
                minWidth: 80,
                templet: function (d) {
                    return util.toDateString(d.create_time, "yyyy年MM月dd日 HH:mm:ss")
                }
            },
            {
                field: 'update_time',
                title: '修订时间',
                width: 240,
                sort: true,
                minWidth: 80,
                templet: function (d) {
                    return util.toDateString(d.update_time, "yyyy年MM月dd日HH:mm:ss")
                }
            }
            , {fixed: 'right', title: '操作', width: 160, minWidth: 125, toolbar: '#operatorColBar'}
        ]]
        , initSort: {
            field: 'tel' // 排序字段，对应 cols 设定的各字段名
            , type: 'desc' // 排序方式  asc: 升序；desc: 降序、null: 默认排序
        }
        , done: function (res, curr, count, origin) {
            // 获取当前编辑行的数据
            const option = this;//这里是个局部变量，获取当前的组件id
            table.getRowData = function (tableId, elem) {
                const index = $(elem).closest('tr').data('index');
                return table.cache[tableId][index] || {};
            };

            // dropdown 方式的下拉选择，设置是否为管理员
            dropdown.render({
                elem: '.dropdown-operator'
                // ,trigger: 'hover'
                // 此处的 data 值，可根据 done 返回的 res 遍历来赋值，<这里是下拉的选项?>
                , data: [{
                    title: 'T'
                    , id: 1
                }, {
                    title: 'F'
                    , id: 0
                }]
                , style:"min-width:60px"
                , click: function (obj) {
                    let data_val = table.getRowData(option.id, this.elem); // 获取当前行数据(如 id 等字段，以作为数据修改的索引),Layui，自动获取
                    this.elem.find('span').html();
                    let activationStatus = obj.title === 'T';//获取下拉框中，你所选择的值。
                    let Phone = data_val.tel;
                    this.elem.find('span').html(obj.title);
                    $.ajax({
                        url: '/EditActivationStatus',
                        type: 'post',
                        async: true,
                        data: {
                            tel: Phone,
                            activation: activationStatus
                        },
                        success: function (res) {
                            if (res === true) {
                                layer.msg("设置管理员权限为：" + activationStatus, {icon: 1});
                            } else {
                                layer.msg(res, {icon: 2});
                            }
                        },
                        error: function (data) {
                            let res = JSON.stringify(data); // 得到 JSON 字符串形式的所有键值
                            layer.alert('服务器异常' + res, {icon: 2});
                        }
                    });
                }
            });

            // 行模式-单行多行（设置了行高）
            dropdown.render({
                elem: '#operatorRowMode'
                , data: [{
                    id: 'default-row',
                    title: '单行模式（默认）'
                }, {
                    id: 'multi-row',
                    title: '多行模式'
                }]
                // 菜单被点击的事件
                , click: function (obj) {
                    let checkStatus = table.checkStatus(option.id);
                    // let data = checkStatus.data; // 获取选中的数据
                    switch (obj.id) {
                        case 'default-row':
                            table.reload('OperatorTable', {
                                lineStyle: null // 恢复单行
                            });
                            layer.msg('已设为单行');
                            break;
                        case 'multi-row':
                            table.reload('OperatorTable', {
                                // 设置行样式，此处以设置多行高度为例。若为单行，则没必要设置改参数 - 注：v2.7.0 新增
                                lineStyle: 'height: 95px;'
                            });
                            layer.msg('已设置多行');
                            break;
                    }
                }
            });
        }
        , error: function (res, msg) {
            console.log(res, msg)
        }
    });

    table.on('sort(OperatorFilter)',function (obj) {
        table.reload('OperatorTable');
    });
    //搜索账户名的搜索栏和功能
    form.on('submit(operator_search)', function (data) {
        let field = data.field; // 获得表单字段
        if (field.search_Phone) {
            // 执行搜索重载,可以遍历全部数据，查看包含，实现模糊搜索
            table.reload('OperatorTable', {
                where: {usrTel: field.search_Phone} // 搜索的字段，name的值为search_Phone获取整个输入框的值
                , method: 'post'
                , url: '/SearchOperator'
            });

            layer.msg('搜索成功<br>' + field.search_Phone);
            return false; // 阻止默认 form 跳转
        }
        layer.msg('啊哦？你要搜什么呢？');
        return false;
    });

    // 权限状态 - 开关操作
    form.on('switch(filter-privilege-status)', function (obj) {
        const id = obj.value;
        layer.tips('即将把' + id + '的值更改为: ' + obj.elem.checked, obj.othis, axios.post('/EditAdministratorStatus', {
                tel: id,
                isRoot: obj.elem.checked
            }).then((response) => {
                if (response.data === true)
                    layer.msg("更改成功", {icon: 1})
                else {
                    layer.msg("出错啦~" + JSON.stringify(response))
                }
            }).catch((error) => {
                layer.confirm(error)
            })
        );
    });


    // 头部菜单栏工具栏事件
    table.on('toolbar(OperatorFilter)', function (obj) {
        let id = obj.config.id;
        let checkStatus = table.checkStatus(id);//框架自动处理选中行的数据
        switch (obj.event) {
            case 'getCheckData'://获取选中行的数据，未使用。
                let data = checkStatus.data;//定义一个data变量，储存选中的信息。
                layer.alert(layui.util.escape(JSON.stringify(data)));//格式化输出选择的信息
                break;
            case 'getData'://获取当前页数据，未使用。
                let getData = table.getData(id);
                layer.alert(layui.util.escape(JSON.stringify(getData)));//格式化输出信息
                break;
            case 'isAll'://判断是否全选的函数，未使用。
                layer.msg(layui.table.checkStatus(obj.config.id).isAll ? '全选' : '未全选');
                break;
            case 'insert_data':
                let form_index =
                    layer.open({
                        type: 1,// page 层类型，内部包含了一个页面。
                        area: ['auto', '300px'],
                        resize: false,// 禁止拉伸
                        shadeClose: true,// 点击遮罩开启，背景变暗
                        title: '添加用户信息',
                        content: '<div class="layui-form" style="margin: 16px;">\n' +

                            '<div class="layui-form-item">\n' +
                            '                    <div class="layui-input-wrap">\n' +
                            '                        <div class="layui-input-prefix">\n' +
                            '                            <i class="layui-icon layui-icon-cellphone"></i>\n' +
                            '                        </div>\n' +
                            '                        <input type="text" name="userTel" value="" lay-verify="phone" placeholder="手机号" lay-reqtext="请填写手机号" autocomplete="off" class="layui-input">\n' +
                            '                    </div>\n' +
                            '                </div>' +
                            '        <div class="layui-form-item">\n' +
                            '            <div class="layui-input-wrap">\n' +
                            '                <div class="layui-input-prefix">\n' +
                            '                    <i class="layui-icon layui-icon-password"></i>\n' +
                            '                </div>\n' +
                            '                <input type="password" name="password" value="" lay-verify="required" placeholder="密码" lay-reqtext="请填写密码" autocomplete="off" class="layui-input" lay-affix="eye">\n' +
                            '            </div>\n' +
                            '        </div>\n' +
                            '        <div class="layui-form-item">\n' +
                            '            <button class="layui-btn layui-btn-fluid" lay-submit lay-filter="InsertOperator">确认</button>\n' +
                            '        </div>\n' +

                            '</div>',
                        success: function () {
                            form.render();// 对弹层中的表单进行初始化渲染
                            form.verify({
                                phone: [
                                    /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/
                                    , '请输入正确的手机号。例：18812341234'
                                ]
                            });
                            // 表单提交事件
                            form.on('submit(InsertOperator)', function (data) {
                                // console.log("表单提交事件\n" + JSON.stringify(data.field));
                                let field = data.field; // 获取表单字段值
                                // 显示填写结果，仅作演示用
                                layer.close(form_index);
                                layer.msg(JSON.stringify(field));
                                let usrPhone = field.userTel;
                                let regPwd = field.password;
                                $.ajax({
                                    url: '/RegisterOperator',//请求地址
                                    type: 'post',//请求方式
                                    async: true,//是否异步请求
                                    data: {//请求参数
                                        usr: usrPhone,//手机号，作为用户名，唯一不可重复，传给后端的名字：传递的值
                                        pwd: new Hashes.MD5().hex(regPwd),
                                    },
                                    success: function (data) {
                                        let res = JSON.stringify(data);//将返回的数据转换成字符串
                                        if (res === "\"true\"") {//后端的返回值是否为true
                                            layer.msg("添加" + usrPhone + "成功", {icon: 1});
                                        } else {
                                            layer.msg(res, {icon: 2});
                                        }
                                        table.reloadData('OperatorTable', {
                                            scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                                            , url: '/PrintAllOperator'
                                        });
                                    },
                                    error: function (data) {
                                        let res = JSON.stringify(data);
                                        layer.alert('服务器异常' + res, {icon: 2});
                                    }
                                });
                                return false; // 阻止默认 form 跳转
                            });
                        }
                    });
                break;
            case 'reload':
                // 数据重载 - 参数重置
                table.reloadData('OperatorTable', {
                    // where: {
                    // id: '20050100001'
                    //,test: '新的 test2'
                    //,token: '新的 token2'
                    // },
                    scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                    , height: 2000 // 测试无效参数（即与数据无关的参数设置无效，此处以 height 设置无效为例）
                    , url: '/PrintAllOperator'
                    //,page: {curr: 1, limit: 30} // 重新指向分页
                });
                layer.msg('已重新加载数据');
                break;
            case 'del_many':
                let data_del = checkStatus.data;//获取当前选中行的信息
                if ($.isEmptyObject(data_del)) {
                    layer.msg("你要删除什么呢？", {icon: 3});
                    return false;
                }
                let del_phones = [];//储存用户手机号，用来批量删除
                for (let x of data_del) {//依次把手机号添加到del_Phones里
                    del_phones.push(x['tel']);
                }
                // console.log(del_phones);
                layer.confirm('真的删除行 [用户名: ' + del_phones + '] 么', function () {
                    $.ajax({
                        url: '/DelManyOperators',
                        type: 'post',
                        async: true,
                        data: {
                            "tel": del_phones
                        },
                        success: function (data_inner) {
                            let res = JSON.stringify(data_inner);
                            layer.msg("成功删除了" + res + "条数据", {icon: 1});
                            table.reloadData('OperatorTable', {
                                scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                                , height: 2000 // 测试无效参数（即与数据无关的参数设置无效，此处以 height 设置无效为例）
                                , url: '/PrintAllOperator'
                            });
                        },
                        error: function (data_inner) {
                            let res = JSON.stringify(data_inner);
                            layer.alert('服务器异常' + res, {icon: 2});
                        }
                    });
                });
                break;
            case 'LAYTABLE_TIPS':
                layer.alert('<i class="layui-icon layui-icon-mute" style="font-size: 4em"></i>这里什么都没有', {
                    icon: 0,
                    title: '什么都没有'
                });
                break;
        }
    });

    // 触发单元格工具事件单元格操作栏目
    table.on('tool(OperatorFilter)', function (obj) { // 双击 toolDouble
        let data = obj.data; // 获得当前行数据
        // console.log(obj)
        if (obj.event === 'operator_edit_pwd') {
            layer.prompt({title: '请输入更改的密码', formType: 1}, function (value, index, elem) {
                if (value === '') return elem.focus();
                layer.msg('获得：' + util.escape(value)); // 显示 value
                $.ajax({
                    url: '/ChangeOperatorPwd',
                    type: 'post',
                    async: true,
                    data: {
                        tel: data.tel,
                        pwd: new Hashes.MD5().hex(util.escape(value))
                    },
                    success: function (data_inner) {
                        let res = JSON.stringify(data_inner);
                        if (data_inner === true) {
                            layer.msg("修改成功", {icon: 1});
                        } else {
                            layer.msg(res, {icon: 2});
                        }
                    },
                    error: function (data_inner) {
                        let res = JSON.stringify(data_inner);
                        layer.alert('服务器异常' + res, {icon: 2});
                    }
                });
                // 关闭 prompt
                layer.close(index);
            });

        } else if (obj.event === 'operator_del_val') {
            layer.confirm('真的删除行 [用户名: ' + data.tel + '] 么', function (index) {
                //向服务端发送删除指令
                $.ajax({
                    url: '/DelManyOperators',
                    type: 'post',
                    async: true,
                    data: {
                        tel: Array.of(data.tel)
                    },
                    success: function (data_inner) {
                        let res = JSON.stringify(data_inner);
                        if (data_inner === 1) {
                            obj.del(); // 删除对应行（tr）的DOM结构，并更新缓存
                            layer.close(index);
                            layer.msg("删除成功", {icon: 1});
                        } else {
                            layer.msg(res, {icon: 2});
                        }
                    },
                    error: function (data_inner) {
                        let res = JSON.stringify(data_inner);
                        layer.alert('服务器异常' + res, {icon: 2});
                    }
                });
            });

        }
    });

    // 触发表格复选框选择
    table.on('checkbox(OperatorFilter)', function (obj) {
        // console.log(obj)
    });

    // 触发表格单选框选择
    table.on('radio(OperatorFilter)', function (obj) {
        // console.log(obj)
    });

    // 行单击事件
    table.on('row(OperatorFilter)', function (obj) {
        //console.log(obj);
        //layer.closeAll('tips');
    });
    // 行双击事件
    table.on('rowDouble(OperatorFilter)', function (obj) {
        // console.log(obj);
    });

    // 单元格编辑事件
    table.on('edit(OperatorFilter)', function (obj) {
        let field = obj.field; // 得到字段
        let value = obj.value; // 得到修改后的值
        let data_val = obj.data; // 得到所在行所有键值
        // 值的校验
        if (field === 'nickname') {
            if (!/^.{2,32}$/.test(obj.value)) {
                layer.tips('昵称必须大于2位，但不能过长。', this, {tips: 1});
                return obj.reedit(); // 重新编辑 -- v2.8.0 新增
            }
            $.ajax({
                url: '/EditOperatorTableNickname',
                type: 'post',
                async: true,
                data: {
                    tel: data_val.tel,
                    nickname: value
                },
                success: function (data) {
                    let res = JSON.stringify(data);
                    if (data === true) {
                        window.sessionStorage.setItem("userNickname", value);
                        layer.msg("编辑用户昵称为：" + value, {icon: 1});
                    } else {
                        layer.msg(res, {icon: 2});
                    }
                },
                error: function (data) {
                    layer.alert('服务器异常' + JSON.stringify(data), {icon: 2});
                }
            });
        }

        // 编辑后续操作，如提交更新请求，以完成真实的数据更新
        // …
        // layer.msg('编辑成功', {icon: 1});

        // 其他更新操作，修改后的更新表格操作。
        let update = {};
        update[field] = value;
        obj.update(update);

    });
});

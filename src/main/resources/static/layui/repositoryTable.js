// 渲染仓库表格的功能
layui.use(
    function () {
        const table = layui.table;
        const layer = layui.layer;
        const dropdown = layui.dropdown;
        const form = layui.form;
        const util = layui.util;
        const upload = layui.upload;
        const $ = layui.jquery;

        // 创建渲染表格实例
        table.render({
            elem: '#RepositoryTable',
            url: '/PrintAllRepository',
            method: 'post',
            toolbar: '#RepositoryToolBar',
            defaultToolbar: ['filter', 'exports', {
                title: '提示',
                layEvent: 'LAYTABLE_TIPS',
                icon: 'layui-icon-tips'
            }],
            height: 'full-200',
            cellMinWidth: 80,
            cols: [[
                {type: 'checkbox', fixed: 'left'},
                {
                    field: 'name',
                    width: 200,
                    fieldTitle: 'name',
                    title: '商品名称',
                    fixed: 'left',
                    sort: true
                }, {
                    field: 'isn',
                    width: 160,
                    title: '条形码',
                    fieldTitle: 'isn',
                    hide: true
                }, {
                    field: 'category',
                    title: '商品分类',
                    fieldTitle: 'category',
                    width: 160,
                    sort: true
                }, {
                    field: 'cost',
                    title: '商品进价',
                    fieldTitle: 'cost',
                    width: 88,
                    edit: 'text',
                    hide: true
                }, {
                    field: 'price',
                    title: '商品售价',
                    fieldTitle: 'price',
                    edit: 'text',
                    width: 88
                }, {
                    field: 'stock',
                    title: '商品库存',
                    fieldTitle: 'stock',
                    edit: 'text',
                    width: 88
                }, {
                    field: 'promoting',
                    title: '商品促销',
                    fieldTitle: 'promoting',
                    edit: 'text',
                    width: 88
                }, {
                    field: 'update_time',
                    title: '修订时间',
                    fieldTitle: 'update_time',
                    width: 240,
                    templet: function (d) {
                        return util.toDateString(d.update_time, "yyyy年MM月dd日 HH:mm:ss")
                    }
                }
            ]],
            initSort: {
                field: 'name',
                type: 'asc'
            },
            done: function (res, curr, count, origin) {
                // 获取当前编辑行的数据
                const option = this;//这里是个局部变量，获取当前的组件id
                table.getRowData = function (tableId, elem) {
                    const index = $(elem).closest('tr').data('index');
                    return table.cache[tableId][index] || {};
                };
                // 行模式-单行多行（设置了行高）
                dropdown.render({
                    elem: '#RepositoryRowMode'
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
                                table.reload('RepositoryTable', {
                                    lineStyle: null // 恢复单行
                                });
                                layer.msg('已设为单行');
                                break;
                            case 'multi-row':
                                table.reload('RepositoryTable', {
                                    // 设置行样式，此处以设置多行高度为例。若为单行，则没必要设置改参数 - 注：v2.7.0 新增
                                    lineStyle: 'height: 95px;'
                                });
                                layer.msg('已设为多行');
                                break;
                        }
                    }
                });
            },
            error: function (res, msg) {
                console.error(res, msg);
            }
        }); // 至此表格的渲染完成了。

        form.on('submit(repository_search)', function (data) {
            const field = data.field; // 获取表单提交的内容
            if (field.search_TradeName) {
                if ((/^\d*$/).test(field.search_TradeName)) {
                    table.reload('RepositoryTable', {
                        method: 'post',
                        url: '/SearchOneISN',
                        where: {'ISN': field.search_TradeName}
                    });
                    return false;
                }
                table.reload('RepositoryTable', {
                    where: {tradeName: field.search_TradeName},
                    method: 'post',
                    url: '/SearchRepository'
                });
                layer.msg('搜索成功<br>' + field.search_TradeName);
                return false;
            }
            layer.msg('啊哦？你要搜索什么呢？');
            return false;
        }); // 搜索功能已完成。

        table.on('toolbar(RepositoryFilter)', function (obj) {
            let id = obj.config.id;
            let checkStatus = table.checkStatus(id);
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
                            area: ['auto', '500px'],
                            resize: false,// 禁止拉伸
                            shadeClose: true,// 点击遮罩开启，背景变暗
                            title: '添加商品信息',
                            content: `
                            <div class="layui-form layui-form-pane" style="margin: 16px;">
                               
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradeName">商品名称</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradeName" name="tradeName" value="" lay-verify="required" placeholder="请输入商品名称" lay-reqtext="请填写商品名称" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradeISN">商品条码</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradeISN" name="tradeISN" value="" lay-verify="required" placeholder="请输入商品识别条码" lay-reqtext="请填写商品识别条码" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradeCategory">商品分别</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradeCategory" name="tradeCategory" value="" lay-verify="required" placeholder="请输入商品类别" lay-reqtext="请填写如何分类此商品" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradeCost">商品进价</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradeCost" name="tradeCost" value="" lay-verify="required" placeholder="请输入商品进价" lay-reqtext="请填写商品进价" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradePrice">商品售价</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradePrice" name="tradePrice" value="" lay-verify="required" placeholder="请输入商品售价" lay-reqtext="请填写商品售价" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradeStock">商品库存</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradeStock" name="tradeStock" value="" lay-verify="required" placeholder="请输入商品库存" lay-reqtext="请填写商品库存" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item">
                                <label class="layui-form-label" for="tradePromoting">商品折扣</label>
                                <div class="layui-input-block">
                                <input type="text" id="tradePromoting" name="tradePromoting" value="" lay-verify="required" placeholder="请输入商品折扣" lay-reqtext="请填写商品折扣" autocomplete="off" class="layui-input">
                                </div></div>
                                
                                <div class="layui-form-item"><button class="layui-btn layui-btn-radius layui-btn-fluid" lay-submit lay-filter="InsertRepository">确认</button></div>
                                
                            </div>
                            `,
                            success: function () {
                                form.render();// 对弹层中的表单进行初始化渲染

                                // 表单提交事件
                                form.on('submit(InsertRepository)', function (data) {
                                    // console.log("表单提交事件\n" + JSON.stringify(data.field));
                                    let field = data.field; // 获取表单字段值
                                    // 显示填写结果，仅作演示用
                                    layer.close(form_index);
                                    layer.msg(JSON.stringify(field));
                                    $.ajax({
                                        url: '/AddTrade',//请求地址
                                        type: 'post',//请求方式
                                        async: true,//是否异步请求
                                        data: {//请求参数
                                            tradeName: field.tradeName,
                                            tradeISN: field.tradeISN,
                                            tradeCategory: field.tradeCategory,
                                            tradeCost: field.tradeCost,
                                            tradePrice: field.tradePrice,
                                            tradeStock: field.tradeStock,
                                            tradePromoting: field.tradePromoting
                                        },
                                        success: function (data) {
                                            let res = JSON.stringify(data);//将返回的数据转换成字符串
                                            if (res) {//后端的返回值是否为true
                                                layer.msg("添加" + field.tradeName + "成功", {icon: 1});
                                            } else {
                                                layer.msg(res, {icon: 2});
                                            }
                                            table.reloadData('RepositoryTable', {
                                                scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                                                , url: '/PrintAllRepository'
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
                    table.reloadData('RepositoryTable', {
                        scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                        , url: '/PrintAllRepository'
                    });
                    layer.msg('已重新加载数据');
                    break;
                case 'del_many':
                    let data_del = checkStatus.data;//获取当前选中行的信息
                    if ($.isEmptyObject(data_del)) {
                        layer.msg("你要删除什么呢？", {icon: 3});
                        return false;
                    }
                    let del_names = [];//储存用户手机号，用来批量删除
                    for (let x of data_del) {//依次把手机号添加到del_Phones里
                        del_names.push(x['name']);
                    }
                    layer.confirm('真的删除行 [用户名: ' + del_names + '] 么', function () {
                        $.ajax({
                            url: '/DelManyRepository',
                            type: 'post',
                            async: true,
                            data: {
                                "name": del_names
                            },
                            success: function (data_inner) {
                                let res = JSON.stringify(data_inner);
                                layer.msg("成功删除了" + res + "条数据", {icon: 1});
                                table.reloadData('RepositoryTable', {
                                    scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                                    , url: '/PrintAllRepository'
                                });
                            },
                            error: function (data_inner) {
                                let res = JSON.stringify(data_inner);
                                layer.alert('服务器异常' + res, {icon: 2});
                            }
                        });
                    });
                    break;
                case 'fileUpload':
                    $('#fileUpload').click();
                    break;
                case 'LAYTABLE_TIPS':
                    layer.alert('<i class="layui-icon layui-icon-mute" style="font-size: 4em"></i>这里什么都没有', {
                        icon: 0,
                        title: '什么都没有'
                    });
                    break;
            }
        }); // 表格工具栏已完成

        table.on('edit(RepositoryFilter)', function (obj) {
            let field = obj.field; // 得到字段名，可以知道是编辑了哪个字段
            let value = obj.value; // 得到该字段修改后的值
            let data_val = obj.data; // 得到该字段未修改前的值
            switch (field) {
                case 'cost':
                    $.ajax({
                        url: '/EditRepositoryCost',
                        type: 'post',
                        async: true,
                        data: {
                            'Name': data_val.name,
                            'Cost': value
                        },
                        success: function (data) {
                            if (data) {
                                layer.msg("修改进价为：" + value, {icon: 1});
                            } else {
                                layer.msg(data, {icon: 2});
                            }
                        },
                        error: function (err) {
                            layer.alert('服务器异常' + JSON.stringify(err), {icon: 2});
                        }
                    });
                    break;
                case 'price':
                    $.ajax({
                        url: '/EditRepositoryPrice',
                        type: 'post',
                        async: true,
                        data: {
                            'Name': data_val.name,
                            'Price': value
                        },
                        success: function (data) {
                            if (data) {
                                layer.msg("修改售价为：" + value, {icon: 1});
                            } else {
                                layer.msg(data, {icon: 2});
                            }
                        },
                        error: function (err) {
                            layer.alert("服务器异常：" + JSON.stringify(err), {icon: 2});
                        }
                    });
                    break;
                case 'stock':
                    $.ajax({
                        url: '/EditRepositoryStock',
                        type: 'post',
                        async: true,
                        data: {
                            'Name': data_val.name,
                            'Stock': value
                        },
                        success: function (data) {
                            if (data) {
                                layer.msg("修改库存为：" + value, {icon: 1});
                            } else {
                                layer.msg(data, {icon: 2});
                            }
                        },
                        error: function (err) {
                            layer.alert("服务器异常：" + JSON.stringify(err), {icon: 2});
                        }
                    });
                    break;
                case 'promoting':
                    $.ajax({
                        url: '/EditRepositoryPromoting',
                        type: 'post',
                        async: true,
                        data: {
                            'Name': data_val.name,
                            'Promoting': value
                        },
                        success: function (data) {
                            if (data) {
                                layer.msg("修改促销折扣为：" + value, {icon: 1});
                            } else {
                                layer.msg(data, {icon: 2});
                            }
                        },
                        error: function (err) {
                            layer.alert("服务器异常：" + JSON.stringify(err), {icon: 2});
                        }
                    });
                    break;
            }

            // 其他更新操作，修改后的更新表格操作。
            let update = {};
            update[field] = value;
            obj.update(update);
        }); // 表单编辑事件的实现

        // 渲染上传文件的实例，完成文件上传批量插入的功能。
        upload.render({
            elem: '#fileUpload', // 绑定多单个元素
            url: '/RepositoryUploadCSV', // 此处配置你自己的上传接口即可
            method: 'post',
            field: 'MyData', // 文件域字段名，默认为file
            accept: 'file', // 普通文件
            drag: true, // 支持拖拽上传
            done: function (res_val) {
                if (res_val === true) {
                    layer.msg('上传成功');
                    table.reloadData('RepositoryTable', {
                        scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                        , url: '/PrintAllRepository'
                    });
                } else {
                    layer.msg('批量插入失败');
                }
            },
            error: function (res_val) {
                layer.alert('error' + JSON.stringify(res_val));
            }
        });

    });

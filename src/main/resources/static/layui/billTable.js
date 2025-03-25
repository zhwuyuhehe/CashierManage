// 渲染仓库表格的功能
layui.use(function () {
    const table = layui.table;
    const layer = layui.layer;
    const dropdown = layui.dropdown;
    const form = layui.form;
    const util = layui.util;
    const $ = layui.jquery;

    // 创建渲染表格实例
    table.render({
        elem: '#BillTable',
        url: '/PrintAllBill',
        method: 'post',
        toolbar: '#BillToolBar',
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
                field: 'id',
                fixed: 'left',
                width: 160,
                fieldTitle: 'id',
                title: '订单编号',
                sort: true
            }, {
                field: 'member',
                width: 160,
                title: '会员手机号',
                templet: function (d) {
                    return d.member === 10000000000 ? '无会员' : d.member
                },
                fieldTitle: 'member',
            }, {
                field: 'sum',
                title: '本单总价',
                fieldTitle: 'sum',
                width: 120,
                sort: true
            }, {
                field: 'create_time',
                title: '购买时间',
                fieldTitle: 'create_time',
                sort: true,
                templet: function (d) {
                    return util.toDateString(d.create_time, "yyyy年MM月dd日 HH:mm:ss")
                }
            }, {
                field: 'state',
                title: '订单状态',
                fieldTitle: 'state',
                sort: true,
                templet: '#billStatus',
                width: 120
            },
            {
                fixed: 'right',
                title: '操作',
                width: 100,
                toolbar: '#billPurchased'
            }
        ]],
        initSort: {
            field: 'id',
            type: 'desc'
        },
        done: function () {
            // 获取当前编辑行的数据
            const option = this;//这里是个局部变量，获取当前的组件id
            table.getRowData = function (tableId, elem) {
                const index = $(elem).closest('tr').data('index');
                return table.cache[tableId][index] || {};
            };
            // 行模式-单行多行（设置了行高）
            dropdown.render({
                elem: '#BillRowMode'
                , data: [{
                    id: 'default-row',
                    title: '单行模式（默认）'
                }, {
                    id: 'multi-row',
                    title: '多行模式'
                }]
                // 菜单被点击的事件
                , click: function (obj) {
                    switch (obj.id) {
                        case 'default-row':
                            table.reload('BillTable', {
                                lineStyle: null // 恢复单行
                            });
                            layer.msg('已设为单行');
                            break;
                        case 'multi-row':
                            table.reload('BillTable', {
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
    });

    form.on('submit(bill_search)', function (data) {
        const field = data.field;
        if (field.search_billId) {
            table.reload('BillTable', {
                where: {'billId': field.search_billId},
                method: 'post',
                url: '/SearchBill'
            });
            layer.msg('搜索成功<br>' + field.search_billId);
            return false;
        }
        layer.msg('啊哦？你要搜索什么呢？');
        return false;
    }); // 搜索功能已完成。

    form.on('switch(filter-bill-state)', function (obj) {
        const id = obj.value;
        layer.tips('即将把' + id + '的值更改为: ' + obj.elem.checked, obj.othis, axios.post('/BillUpdateState', {
                id: id,
                state: obj.elem.checked
            }).then((response) => {
                if (response.data === true)
                    layer.msg("更改成功", {icon: 1})
                else {
                    layer.alert("出错啦~" + JSON.stringify(response))
                }
            }).catch((error) => {
                layer.confirm(error)
            })
        );
    });

    table.on('toolbar(BillFilter)', function (obj) {
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
            case 'delMany':
                let data_del = checkStatus.data;//获取当前选中行的信息
                if ($.isEmptyObject(data_del)) {
                    layer.msg("你要删除什么呢？", {icon: 3});
                    return false;
                }
                let del_ids = [];//储存用户手机号，用来批量删除
                for (let x of data_del) {//依次把手机号添加到del_Phones里
                    del_ids.push(x['id']);
                }
                layer.confirm('真的删除行 [用户名: ' + del_ids + '] 么', function () {
                    $.ajax({
                        url: '/DelManyBill',
                        type: 'post',
                        async: true,
                        data: {
                            "id": del_ids
                        },
                        success: function (data_inner) {
                            let res = JSON.stringify(data_inner);
                            layer.msg("成功删除了" + res + "条数据", {icon: 1});
                            table.reloadData('BillTable', {
                                scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                                , url: '/PrintAllBill'
                            });
                        },
                        error: function (data_inner) {
                            let res = JSON.stringify(data_inner);
                            layer.alert('服务器异常' + res, {icon: 2});
                        }
                    });
                });
                break;
            case 'reload':
                // 数据重载 - 参数重置
                table.reloadData('BillTable', {
                    scrollPos: 'fixed'  // 保持滚动条位置不变 - v2.7.3 新增
                    , url: '/PrintAllBill'
                });
                layer.msg('已重新加载数据');
                break;
            case 'LAYTABLE_TIPS':
                layer.alert('<i class="layui-icon layui-icon-mute" style="font-size: 4em"></i>这里什么都没有', {
                    icon: 0,
                    title: '什么都没有'
                });
                break;
        }
    });

    table.on('tool(BillFilter)', function (obj) {
        let data = obj.data;
        if (obj.event === 'bill-purchased') {
            layer.open({
                type: 1,
                area: ['486px', '486px'],
                resize: false,
                title: ['订单明细', 'font-size:2rem'],
                closeBtn: 0,
                shadeClose: true,
                content: `
                <table id="purchasedTable" class="layui-hide">
                `
            });
            table.render({
                elem: '#purchasedTable',
                url: '/PurchasedInfo',
                method: 'post',
                where: {billId: data.id},
                totalRow: true,
                cols: [[
                    {field: 'name', title: '商品名称', width: 120, totalRowText: '合计'},
                    {field: 'price', title: '商品单价', width: 120},
                    {field: 'count', title: '商品数量', width: 120},
                    {field: 'subTotal', title: '小计', width: 120, totalRow: true}
                ]]

            });
        }
    });

});

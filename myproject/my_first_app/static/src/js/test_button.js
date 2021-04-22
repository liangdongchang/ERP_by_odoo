odoo.define('my_first_app.course.tree.button', function (require) {
    "use strict";
	var ajax = require('web.ajax');
    let ListController = require('web.ListController');

    ListController.include({
        renderButtons: function ($node) {
            let $buttons = this._super.apply(this, arguments);
            let tree_model = this.modelName;
            let context = this.initialState.context.test_button;
            // 只在myproject.course模型的tree视图中出现
            if (context && tree_model === 'myproject.course') {
                let but2 = "<button type=\"button\" t-if=\"widget.modelName == 'myproject.course'\" class=\"btn btn-primary\">测试按钮</button>";
                let button2 = $(but2).click(this.proxy('course_test_button_form'));
                // this.$buttons.prepend(button2);   //放在前面
                this.$buttons.append(button2);   // 放在后面
            }
            return $buttons;
        },
        // 按钮功能：弹出课程的form视图
        course_test_button_form: function () {
            let action = {
                name: '课程',
                type: 'ir.actions.act_window',
                res_model: 'myproject.course',
                view_mode: 'form',
                view_type: 'form',
                views: [[false, 'form']],

            };
            let self = this;
            this.do_action(action, {
                on_close: function () {
                    self.trigger_up('reload');
                }
            });
        },
        // 按钮功能，调用一个myproject.course模块中的js_test函数
        course_test_button_fuc: function () {
            ajax.jsonRpc('/web/dataset/call_kw', 'call', {
                model: 'myproject.course',
                method: 'js_test',
                args: [],
                kwargs: {}
            }).then(function (url) {

            });
        },
    });

});
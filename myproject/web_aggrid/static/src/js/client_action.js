// odoo.define('myproject.aggrid_client_action', function (require) {
//     "use strict";
//
//     // var ControlPanelMixin = require('web.ControlPanelMixin');
//     var Widget = require('web.Widget');
//     var ajax = require('web.ajax');
//     let time = require('web.time');
//     let fieldUtils = require('web.field_utils');
//     let session = require('web.session');
//     var ActionMixin = require('web.ActionMixin');
//     var ControlPanel = require('web.ControlPanel');
//
//     return  Widget.extend(ActionMixin, {
//         config: {
//             ControlPanel: ControlPanel,
//         },
//         template: 'myproject.ag_grid_client_action',
//         cssLibs: [
//             '/web_aggrid/static/lib/ag_grid/ag_grid.css',
//             '/web_aggrid/static/lib/ag_grid/ag_theme_balham.css?v=1.1.3',
//         ],
//         jsLibs: [
//             '/web_aggrid/static/lib/ag_grid/ag_grid_community.min.noStyle.js',
//             '/web_aggrid/static/lib/accounting.min.js',
//         ],
//         init: function (parent, action, options) {
//             this.title = action.display_name;
//             this.aggridLocaleText = {
//                 rowGroupColumnsEmptyMessage: '分组项',
//                 noRowsToShow: "数据为空",
//                 filters: "筛选",
//                 filterOoo: '筛选项',
//                 resetColumns: "重置列",
//                 expandAll: "展开全部",
//                 collapseAll: "关闭",
//                 pinLeft: '左侧固定',
//                 pinRight: '右侧固定',
//                 noPin: '不固定',
//                 autosizeThiscolumn: '自适应该列',
//                 autosizeAllColumns: "自适应所有列",
//                 groupBy: '排序',
//                 pinColumn: '固定列',
//                 copy: '复制',
//                 copyWithHeaders: '携带表头复制',
//                 paste: "粘贴",
//                 export: "导出",
//                 csvExport: "导出为CSV格式文件",
//                 excelExport: "导出到Excel",
//             };
//             return this._super.apply(this, arguments);
//         },
//         start: function () {
//             return $.when(
//                 this._super.apply(this, arguments),
//                 this._renderButtons(),
//                 // this._updateControlPanel()
//             );
//         },
//         do_show: function () {
//             this._super.apply(this, arguments);
//             // this._updateControlPanel();
//         },
//         /**
//          * @override
//          */
//         destroy: function () {
//             if (this.$buttons) {
//                 this.$buttons.off().destroy();
//             }
//             this._super.apply(this, arguments);
//         },
//         /**
//          * @override
//          */
//         on_attach_callback: function () {
//             this.isInDOM = true;
//             this._render();
//         },
//         /**
//          * @override
//          */
//         on_detach_callback: function () {
//             this.isInDOM = false;
//         },
//         willStart: function () {
//             return $.when(ajax.loadLibs(this), this._super.apply(this, arguments));
//         },
//         //--------------------------------------------------------------------------
//         // Private
//         //--------------------------------------------------------------------------
//         _updateControlPanel: function () {
//             this.update_control_panel({
//                 breadcrumbs: [{title: this.title, action: this}],
//                 cp_content: {
//                     $buttons: this.$buttons,
//                 },
//                 search_view_hidden: true
//             });
//         },
//         /**
//          * @private
//          */
//         _renderButtons: function () {
//         },
//         /**
//          * @private
//          * @returns {Deferred}
//          */
//          _renderAggrid: function () {
//         },
//
//         _render: function () {
//             if (this.isInDOM) {
//                 this._renderAggrid();
//             }
//         },
//
//
//         _formatDateTime: function (str) {
//             let d = new Date(str);
//             let date = fieldUtils.parse.datetime(str, {}, {timezone: true});
//             d.setSeconds(session.getTZOffset(date) * 60 * 2);
//             return time.datetime_to_str(d);
//         },
//
//         _utcDateTime: function (str) {
//             return time.datetime_to_str(new Date(str));
//         },
//
//         _currencyFormatter: function (params) {
//             if (!params.value) {
//                 return '';
//             }
//             return accounting.formatMoney(params.value, "", 2);
//         },
//
//         _dateTimeFormat: function (params) {
//             if (!params.value ) {
//                 return '';
//             }else if(params.node && ['bottom', 'top'].indexOf(params.node.rowPinned) !== -1){
//                 return params.value;
//             }
//             return this._formatDateTime(params.value);
//         },
//
//         _numberFormatter: function (params) {
//             if (!params.value) {
//                 return '';
//             }
//             return params.value;
//         },
//
//         _autoSizeAll: function (gridOptions, skipHeader) {
//             var allColumnIds = [];
//             gridOptions.columnApi.getAllColumns().forEach(function (column) {
//                 allColumnIds.push(column.colId);
//             });
//             gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
//         }
//
//
//     })
// });
odoo.define('myproject.aggrid_client_action', function (require) {
    "use strict";

    var ActionMixin = require('web.ActionMixin');
    var Widget = require('web.Widget');
    var ajax = require('web.ajax');
    let time = require('web.time');
    let fieldUtils = require('web.field_utils');
    let session = require('web.session');


    const ActionModel = require('web/static/src/js/views/action_model.js');
    var ControlPanel = require('web.ControlPanel');

    const { ComponentWrapper } = require('web.OwlCompatibility');



    var AggridAction = Widget.extend(ActionMixin, {
        config: {
            ControlPanel: ControlPanel,
        },
        template: 'myproject.ag_grid_client_action',
        cssLibs: [
            '/web_aggrid/static/lib/ag_grid/ag_grid.css',
            '/web_aggrid/static/lib/ag_grid/ag_theme_balham.css?v=1.1.3',
        ],
        jsLibs: [
            '/web_aggrid/static/lib/ag_grid/ag_grid_community.min.noStyle.js',
            '/web_aggrid/static/lib/accounting.min.js',
        ],
         hasControlPanel: false,
         loadControlPanel: false,
         withSearchBar: false,
         searchMenuTypes: [],
        /**
         * @override
         */
        init: function (parent, action, options) {
            this.title = action.display_name;
            this.aggridLocaleText = {
                rowGroupColumnsEmptyMessage: '分组项',
                noRowsToShow: "数据为空",
                filters: "筛选",
                filterOoo: '筛选项',
                resetColumns: "重置列",
                expandAll: "展开全部",
                collapseAll: "关闭",
                pinLeft: '左侧固定',
                pinRight: '右侧固定',
                noPin: '不固定',
                autosizeThiscolumn: '自适应该列',
                autosizeAllColumns: "自适应所有列",
                groupBy: '排序',
                pinColumn: '固定列',
                copy: '复制',
                copyWithHeaders: '携带表头复制',
                paste: "粘贴",
                export: "导出",
                csvExport: "导出为CSV格式文件",
                excelExport: "导出到Excel",
            };

            return this._super.apply(this, arguments);
        },
        start: function () {
            return $.when(
                this._super.apply(this, arguments),
                this._renderButtons(),
                // this._updateControlPanel()
            );
        },
        /**
         * @override
         */
        do_show: function () {
            this._super.apply(this, arguments);
            // this._updateControlPanel();
        },
        /**
         * @override
         */
        destroy: function () {
            if (this.$buttons) {
                this.$buttons.off().destroy();
            }
            this._super.apply(this, arguments);
        },
        /**
         * @override
         */
        on_attach_callback: function () {
            this.isInDOM = true;
            this._render();
        },
        /**
         * @override
         */
        on_detach_callback: function () {
            this.isInDOM = false;
        },
        willStart: function () {
            return $.when(ajax.loadLibs(this), this._super.apply(this, arguments));
        },
        //--------------------------------------------------------------------------
        // Private
        //--------------------------------------------------------------------------
        _updateControlPanel: function () {
            this.update_control_panel({
                breadcrumbs: [{title: this.title, action: this}],
                cp_content: {
                    $buttons: this.$buttons,
                },
                search_view_hidden: true
            });
        },
        /**
         * @private
         */
        _renderButtons: function () {
        },
        /**
         * @private
         * @returns {Deferred}
         */
        _render: function () {
            if (this.isInDOM) {
                this._renderAggrid();
            }
        },

        _renderAggrid: function () {
        },

        _formatDateTime: function (str) {
            let d = new Date(str);
            let date = fieldUtils.parse.datetime(str, {}, {timezone: true});
            d.setSeconds(session.getTZOffset(date) * 60 * 2);
            return time.datetime_to_str(d);
        },

        _utcDateTime: function (str) {
            return time.datetime_to_str(new Date(str));
        },

        _currencyFormatter: function (params) {
            if (!params.value) {
                return '';
            }
            return accounting.formatMoney(params.value, "", 2);
        },

        _dateTimeFormat: function (params) {
            if (!params.value ) {
                return '';
            }else if(params.node && ['bottom', 'top'].indexOf(params.node.rowPinned) !== -1){
                return params.value;
            }
            return this._formatDateTime(params.value);
        },

        _numberFormatter: function (params) {
            if (!params.value) {
                return '';
            }
            return params.value;
        },

        _autoSizeAll: function (gridOptions, skipHeader) {
            var allColumnIds = [];
            gridOptions.columnApi.getAllColumns().forEach(function (column) {
                allColumnIds.push(column.colId);
            });
            gridOptions.columnApi.autoSizeColumns(allColumnIds, skipHeader);
        }
    });

    return AggridAction;

});

odoo.define('web.AgGridView', function (require) {
    "use strict";

    var BasicView = require('web.BasicView');
    var core = require('web.core');

    var AgGridModel = require('web.AgGridModel');
    var AgGridRenderer = require('web.AgGridRenderer');
    var AgGridController = require('web.AgGridController');

    var view_registry = require('web.view_registry');

    var _lt = core._lt;
    var AgGridView = BasicView.extend({
        // accesskey: "ag",
        display_name: _lt('AgGrid'),
        icon: 'fa-list-alt',
        jsLibs: ['web_aggrid/static/lib/ag_grid/ag_grid_community.min.noStyle.js'],
        cssLibs: [
            '/web_aggrid/static/lib/ag_grid/ag_grid.css',
            '/web_aggrid/static/lib/ag_grid/ag_theme_balham.css',
        ],
        config: _.extend({}, BasicView.prototype.config, {
            Model: AgGridModel,
            Renderer: AgGridRenderer,
            Controller: AgGridController,
        }),
        viewType: 'aggrid',
        init: function (viewInfo, params) {
            this._super.apply(this, arguments);
            var gridOptions = {
                suppressDragLeaveHidesColumns: true,
                suppressMakeColumnVisibleAfterUnGroup: true,
                rowGroupPanelShow: 'always',
                defaultColDef: {
                    filter: true // set filtering on for all cols
                },
                floatingFilter: true
            };
            this.loadParams.gridOptions = gridOptions
            this.rendererParams.gridOptions = gridOptions
        }
    });
    view_registry.add('aggrid', AgGridView);
    return AgGridView;

});
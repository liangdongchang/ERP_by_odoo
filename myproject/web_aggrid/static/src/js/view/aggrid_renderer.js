odoo.define('web.AgGridRenderer', function (require) {
    "use strict";

    var BasicRenderer = require('web.BasicRenderer');

    var field_utils = require('web.field_utils');

    var AgGridRenderer = BasicRenderer.extend({
        className: "o_aggrid_view ag-theme-balham",
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            this._processColumns(params.columnInvisibleFields || {});

        },
        _render: function () {
            this.$el.removeClass('table-responsive').empty();
            var eGridDiv = this.$el.get(0);
            var gridOptions = {
                columnDefs: this._renderHeader(),
                rowData: this._renderBody(),
                suppressDragLeaveHidesColumns: true,
                suppressMakeColumnVisibleAfterUnGroup: true,
                rowGroupPanelShow: 'always',
                defaultColDef: {
                    filter: true // set filtering on for all cols
                },
                floatingFilter: true
            };

            new agGrid.Grid(eGridDiv, gridOptions);
            return this._super();
        },
        _renderHeader: function () {
            // var columnDefs = [
            //   {headerName: "Make", field: "make"},
            //   {headerName: "Model", field: "model"},
            //   {headerName: "Price", field: "price"}
            // ];
            var columnDefs = _.map(this.columns, this._renderHeaderCell.bind(this));
            return columnDefs;
        },
        _renderHeaderCell: function (node) {
            var name = node.attrs.name;
            var description;
            var field = this.state.fields[name];
            if (node.attrs.widget) {
                description = this.state.fieldsInfo.list[name].Widget.prototype.description;
            }
            if (description === undefined) {
                description = node.attrs.string || field.string;
            }
            var obj = {
                'headerName': description,
                'field': name,
                'enableRowGroup': true,
                filter: 'agTextColumnFilter'
            };
            if (this.state.groupedBy.length > 0) {
                var index = _.indexOf(this.state.groupedBy, name)
                if (index >= 0) {
                    obj['rowGroupIndex'] = index;
                    obj['rowGroup'] = true;

                }

            }
            return obj
        },
        _renderBody: function () {
            var $rows = this._renderRows();
            return $rows
        },
        _renderRows: function () {
            return _.map(this.state.data, this._renderRow.bind(this));
        },
        _renderRow: function (record) {
            var self = this;
            var cells = _.map(this.columns, function (node, index) {
                return self._renderBodyCell(record, node, index);
            });
            return _.object(cells);

        },
        _renderBodyCell: function (record, node, colIndex) {
            var name = node.attrs.name;
            var field = this.state.fields[name];
            var value = record.data[name];
            var formattedValue = field_utils.format[field.type](value, field, {
                data: record.data,
                escape: true,
                isPassword: 'password' in node.attrs,
            });
            return [name, formattedValue]

        },
        _processColumns: function (columnInvisibleFields) {
            var self = this;
            self.hasHandle = false;
            self.handleField = null;
            this.columns = _.reject(this.arch.children, function (c) {
                var reject = c.attrs.modifiers.column_invisible;
                // If there is an evaluated domain for the field we override the node
                // attribute to have the evaluated modifier value.
                if (c.attrs.name in columnInvisibleFields) {
                    reject = columnInvisibleFields[c.attrs.name];
                }
                if (!reject && c.attrs.widget === 'handle') {
                    self.handleField = c.attrs.name;
                }
                return reject;
            });
        },

    });
    return AgGridRenderer;
});
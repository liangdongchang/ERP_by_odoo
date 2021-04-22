odoo.define('session.analysis', function (require) {
"use strict";

var aggrid_client_action = require('myproject.aggrid_client_action');
var AbstractAction = require('web.AbstractAction');
var core = require('web.core');
var self_first = null;
var SessionAnalysis = aggrid_client_action.extend({
    cssLibs: aggrid_client_action.prototype.cssLibs.concat([
            '/my_first_app/static/src/css/session_aggrid.css?v=1.2',
        ]),
    events: {
        'click #query_first': 'clickQuery',
        'change #use_period': 'changeUsePeriod',
    },
   //
    init: function () {
        return this._super.apply(this, arguments);
    },

   _renderAggrid: function () {
        var self = this;

        var localeText = this.aggridLocaleText;
        var columnDefs = [];
        var gridOptions = {
            rowModelType: 'serverSide',
            cacheBlockSize: 100000,
            defaultColDef: {flex: 1,resizable: true,},
            masterDetail: true,
            columnDefs: columnDefs,
            localeText: localeText,
            suppressRowTransform: true,
        };

        self.$el.find('.ag_grid_content ').empty().css({'width': '98.3%', 'height': '95%'});
        var agDiv = $('<div class="ag-theme-balham ag-div "></div>');
        self.$el.find('.ag_grid_content').append(agDiv);
        new agGrid.Grid(agDiv.get(0), gridOptions);

        var filterDiv = $('<div class="o-datepicker"></div>');
        var toolbar = $('<div class="o-toolbar"></div>');
        self.$el.find('.ag_grid_content').prepend(toolbar.append(filterDiv));

        self.renderAccountPeriodSelect(filterDiv.get(0));


        //
        // self.$el.find('.ag_grid_content ').css({'width': '98.3%', 'height': '95%'});
        // var agDiv = $('<div class="ag-theme-balham ag-div "></div>');
        // self.$el.find('.ag_grid_content').append(agDiv);
        // new agGrid.Grid(agDiv.get(0), gridOptions);
        // var filterDiv = $('<div class="o-datepicker"></div>');
        // var toolbar = $('<div class="o-toolbar"></div>');
        // self.$el.find('.ag_grid_content').prepend(toolbar.append(filterDiv));
        // self.renderAccountPeriodSelect(filterDiv.get(0));
        filterDiv.find('#partner_ids').select2({
            multiple: true,
            ajax: {
                url: '/api/partner',
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                delay: 250,
                data: function (str) {
                    return {
                        keywords: str
                    }
                },
                results: function (data) {
                    return {
                        results: data
                    };
                },
                cache: true
            }
        });
        // self._rpc({
        //     model: 'res.users',
        //     method: 'search_read',
        //     args: [[['company_id', '=', web_session.company_id]]],
        //     fields: ['id', 'name'],
        //     limit: 1000
        // }).then(function (result) {
        //     var users = []
        //     for (var i in result) {
        //         users.push({
        //             id: result[i].id,
        //             text: result[i].name
        //         })
        //     }
        //     filterDiv.find('#user_ids').select2({
        //         data: users,
        //         multiple: true
        //     })
        // });
        self.aggridOptions = gridOptions;
        var datasource = {
            getRows(params) {

                var form_data = {
                    'use_period': self.use_period.is(':checked'),
                    'date_from': self._utcDateTime(self.dateInputFrom.val()),
                    'date_to': self._utcDateTime(self.dateInputTo.val()),
                    'partner_ids': self.partner_ids.val(),
                }
                self._rpc({
                    model: 'session.analysis',
                    method: 'master',
                    args: [form_data]
                }).then(function (data) {
                    self.aggridOptions.api.setColumnDefs(self.generateColumnDefs(data.columns, self));
                    $.when(params.successCallback(data.rows, data.lastRow)).then(function () {
                        self._autoSizeAll(self.aggridOptions, false);
                    });
                    self.createMasterPinnedData(data.sum, self.aggridOptions);
                });
            }
        };
        self_first = self;
        gridOptions.api.setServerSideDatasource(datasource);

   },
    _ratioFormatter: function (params) {
        if (!params.value) {
            return '';
        }
        if (params.value === '0'|| params.value === '0%'  || params.value === '0.0%' || params.value === '0.00%' ) {
            return '';
        }
        return params.value;
    },
    generateColumnDefs: function (cols, self) {
        function rowSpan(params) {
            if(params === undefined || params.data === undefined || !params.data.hasOwnProperty('merge_row')){
                return 1
            }else{
                return params.data['merge_row'][params.colDef['field']]
            }
        }
        var columnDefs = []
        for (let i in cols) {
            let valueFormatter = '';
            let cellClass = 'text-cell';
            let pinned = '';
            let headerName = '';
            let hide = false;

            if(cols[i].hasOwnProperty('parent_header_name')){
                let children = []
                for (var j=0;j < cols[i].children_count; j++){
                    var children_j = cols[i]['children_' + j.toString()];
                    if(children_j){
                        if (children_j.value_type === 'date') {
                            valueFormatter = self._dateTimeFormat.bind(self);
                            cellClass = 'text-cell';
                        } else if (children_j.value_type === 'number') {
                            valueFormatter = self._currencyFormatter;
                            cellClass = 'number-cell';
                        } else {
                            valueFormatter = self._ratioFormatter;
                            cellClass = 'text-cell'
                        }
                        children.push({
                            'headerName': children_j.header_name,
                            'field': children_j.field,
                            'cellClass': cellClass,
                            'valueFormatter': valueFormatter,
                        })
                    }

                }
                columnDefs.push(
                    {
                        headerName: cols[i].parent_header_name,
                        children: children
                    }
                )
            } else {
                valueFormatter = '';
                cellClass = 'text-cell';
                if (cols[i].hasOwnProperty('pinned')) {
                    pinned = cols[i].pinned;
                }

                if (cols[i].hasOwnProperty('headerName')) {
                    headerName = cols[i].headerName;
                } else {
                    headerName = cols[i].field;
                }
                if (cols[i].hasOwnProperty('hide') && cols[i].hide === 'true') {
                    hide = true;
                }

                if (cols[i].value_type === 'date') {
                    valueFormatter = self._dateTimeFormat.bind(self)
                } else if (cols[i].value_type === 'number') {
                    valueFormatter = self._currencyFormatter;
                    cellClass = 'number-cell';
                } else {

                }

                columnDefs.push({
                    'headerName': headerName,
                    'field': cols[i].field,
                    'hide': hide,
                    'pinned': pinned,
                    'cellClass': cellClass,
                    rowSpan: rowSpan,
                    cellClassRules: {
                      'show-cell': 'value !== undefined',
                    },
                    'valueFormatter': valueFormatter,
                })
            }
        }
        // columnDefs.push({'headerName': '', 'width': 1})
        return columnDefs;
    },

    renderAccountPeriodSelect: function (node) {
        var filterOptionsNode = $(`
            <div class="o-form-inline o_datepicker o_field_date o_field_widget filter-div">
                <div>
                    <input type="checkbox" id="use_period" class="o_boolean_toggle"/>
                    <label class="use_period_label">使用时间</label>
                    <label for="date_from" class="date_form_date_to date_form_date_to_label">开始时间：</label>
                    <input type="text" id="date_from" class="o_datepicker_input o_input date_form_date_to"/>
                    <label for="date_to" class="date_form_date_to date_form_date_to_label">结束时间：</label>
                    <input type="text" id="date_to" class="o_datepicker_input o_input  date_form_date_to"/>
                    <label for="partner_ids">参与者</label>
                    <span id="partner_ids" class="select2 select2_multiple"/>
                    <button id="query_first" class="btn btn-sm oe_highlight">查询</button>
                </div>
            </div>
        `);
        $(node).append(filterOptionsNode);
        var datePickerFrom = filterOptionsNode.find('#date_from');
        var datePickerTo = filterOptionsNode.find('#date_to');

        var options = {
            format: 'YYYY-MM-DD HH:mm',
            icons: {
                time: 'fa fa-clock-o',
                date: 'fa fa-calendar',
                next: 'fa fa-chevron-right',
                previous: 'fa fa-chevron-left',
                up: 'fa fa-chevron-up',
                down: 'fa fa-chevron-down',
                today: 'glyphicon glyphicon-screenshot',
                close: 'fa fa-times',
            },
            locale: moment.locale(),
            showTodayButton: true,
        };

        datePickerFrom.datetimepicker(options);
        datePickerTo.datetimepicker(options);

        this.dateInputFrom = datePickerFrom;
        this.dateInputTo = datePickerTo;
        this.datePickerFrom = datePickerFrom.data('DateTimePicker');
        this.datePickerTo = datePickerTo.data('DateTimePicker');
        this.account_period_code_start = filterOptionsNode.find('#account_period_code_start');
        this.account_period_code_end = filterOptionsNode.find('#account_period_code_end');
        this.partner_ids = filterOptionsNode.find('#partner_ids');
        this.use_period = filterOptionsNode.find('#use_period');

        $('.ag_grid_content > .o-toolbar').css({
            'position': 'relative',
            'top': '1px',
            'left': '30px',
        });
        $('.btn-analysis').css({
            'margin-left': '5px'
        });
        $('.select2_multiple').css({
            width: '350px'
        });
        $('.date_form_date_to').hide();
        $('.o_datepicker_input').css({'width': '120px'}).hide();
        $('.date_form_date_to_label').css({'width': '80px'}).hide();
        $('.multiple_select2').css({'width': '150px'});
        $('.use_period_label').css({'margin-right': '10px'});
        $('#query_first').css({'margin-left': '10px'});
    },

    clickQuery: function (event) {
        this.aggridOptions.api.purgeServerSideCache();
    },
    changeUsePeriod: function (event) {
        var isChecked = $('#use_period').is(":checked");
        if (isChecked) {
            $('.date_form_date_to').show();
        } else {
            $('.date_form_date_to').hide();
        }

    },
    createMasterPinnedData: function (data, aggridOptions) {
        var pinnedData = _.pick(data, _.filter(_.map(aggridOptions.columnApi.getAllColumns(), function (col) {
            return col.colDef.field;
        }), function (item) {
            return item;
        }));
        aggridOptions.api.setPinnedBottomRowData([pinnedData]);
    },

});
core.action_registry.add('session_analysisaction', SessionAnalysis);

return {
    SessionAnalysis: SessionAnalysis,
};

});
odoo.define('web.AgGridModel', function (require) {
    "use strict";


    var BasicModel = require('web.BasicModel');

    var AgGridModel = BasicModel.extend({
        // _load: function (dataPoint, options) {
        //     dataPoint.type = 'list';
        //     dataPoint.limit = 0;
        //     return this._fetchUngroupedList(dataPoint);
        // },
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
        },
        _makeDataPoint: function (list) {
            var res = this._super.apply(this, arguments);
            res.limit = 0;
            return res;

        },
        _readGroup: function (list, options) {
            return this._fetchUngroupedList(list);
        },
        _fetchUngroupedList: function (list) {
            return this._super.apply(this, arguments);
        }
    });


    return AgGridModel
});
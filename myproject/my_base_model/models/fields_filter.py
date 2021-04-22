# -*- coding: utf-8 -*-

import json
from odoo import models, fields, api

class FieldsFilter(models.AbstractModel):
    _name = 'fields.filter'

    @api.model
    def _register_hook(self):
        # 注册钩子函数
        origin_fields_get = models.AbstractModel.fields_get

        def parse_fields(res, fields, key='searchable'):
            if fields:
                for s in fields.split(','):
                    # 筛选
                    s = s.strip()
                    if s not in res:
                        continue

                    res[s][key] = True

        @api.model
        def fields_get(self, allfields=None, attributes=None):
            res = origin_fields_get(self, allfields, attributes)
            # 通过系统参数获取需要显示的字段
            fields_filter = self.env['ir.config_parameter'].sudo().get_param('show_fields_filter') or "{}"
            try:
                fields_filters = json.loads(fields_filter)
            except:
                return res

            # TODO  列表视图字段筛选、分组自定义需要的字段
            if self._name not in fields_filters:
                return res

            for key in res.keys():
                res[key]['searchable'] = False
                res[key]['sortable'] = False

            parse_fields(res, fields_filters[self._name].get('searchable'))
            parse_fields(res, fields_filters[self._name].get('sortable'), 'sortable')

            return res

        models.AbstractModel.fields_get = fields_get
        return super(FieldsFilter, self)._register_hook()

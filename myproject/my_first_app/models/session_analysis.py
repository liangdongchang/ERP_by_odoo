# -*- coding: utf-8 -*-
import pandas as pd

from odoo import models, api


class SessionAnalysis(models.AbstractModel):
    # 讲座分析表
    _name = 'session.analysis'

    def _where(self, form_data):
        # 查询条件
        partner_ids = form_data.get('partner_ids')
        if not partner_ids:
            partner_ids = str(self.env['res.partner'].sudo().search([]).ids)[1:-1]
        return partner_ids

    def _query(self, form_data):
        # 讲座分析查询sql
        partner_ids = self._where(form_data)
        if partner_ids:
            conditons = ' and rp.id in ({})'.format(partner_ids)
        else:
            conditons = ''

        sql = """
            select 
                mc.id as course_id,
		        ms.id as session_id,
                mc.name as 课程, 
                ms.name as session, 
                to_char(ms.start_date,'yyyy-mm-dd') as start_date,
                to_char(ms.end_date,'yyyy-mm-dd') as end_date,
                string_agg(rp.name, ',') as partner,
				count(rp.id) as partner_number 
                from myproject_session as ms
            left join myproject_course as mc on mc.id= ms.course_id
            left join myproject_session_res_partner_rel as msrpr on msrpr.myproject_session_id=ms.id
            left join res_partner as rp on rp.id=msrpr.res_partner_id
            where 1=1
                {}
            GROUP BY mc.id,ms.id
        """.format(conditons)
        cr = self.env.cr
        cr.execute(sql)
        return self.env.cr.dictfetchall()

    @api.model
    def master(self, form_data):
        datas = self._query(form_data)  # 查询出来的数据

        rows = []  # aggrid行记录
        sum_ = []  # 合计行
        # 列表头 header_name 表示显示的内容 field表示datas中对应字段的内容
        # value_type = ['str', 'number', 'date'] 表示字符串，数字，日期
        # hide=true 表示隐藏列
        # pinned=left 表示固定在左侧栏
        # cellRenderer=true 表示对该列合并相同值
        # parent_header_name表示有子列
        # children_0 表示第一个子列
        columns = [
            {'field': 'course_id', 'hide': 'true', 'value_type': 'str'},
            {'field': 'session_id', 'hide': 'true', 'value_type': 'str'},
            {'header_name': '课程', 'field': '课程', 'pinned': 'left', 'value_type': 'str', 'cellRenderer': 'true'},
            {'header_name': '讲座', 'field': 'session', 'pinned': 'left', 'value_type': 'str'},
            {'header_name': '开始时间', 'field': 'start_date', 'value_type': 'str'},
            {'header_name': '结束时间', 'field': 'end_date', 'value_type': 'str'},
            {
                'parent_header_name': '参与者',
                'children_count': 4,
                'children_0': {'header_name': '姓名', 'field': 'partner', 'value_type': 'str'},
                'children_1': {'header_name': '人数', 'field': 'partner_number', 'value_type': 'number'},
            }
        ]
        if datas:
            data_df = pd.DataFrame(datas)
            if not data_df.empty:
                # 对每一列求和，当列中有字符串或None值时则返回''
                sum_ = dict(data_df.fillna(0).apply(
                    lambda x: '' if any(isinstance(d, (str, list, tuple, dict)) for d in x) else round(x.sum(), 2)))
                # 合计行对应的日期列显示‘合计’两个字
                sum_['session'] = '合计'

                for i in range(len(datas)):
                    # 处理从数据库中查询出来的数据
                    # columns定义了几列，row就有几个键值对
                    row = {
                        'course_id': datas[i]['course_id'],
                        'session_id': datas[i]['session_id'],
                        'course': datas[i]['课程'],
                        'session': datas[i]['session'],
                        'start_date': datas[i]['start_date'],
                        'end_date': datas[i]['end_date'],
                        'partner': datas[i]['partner'],
                        'partner_number': datas[i]['partner_number'],
                    }
                    rows.append(row)
        return {
            'rows': rows,
            'lastRow': len(rows),  # 总行数
            'sum': sum_,  # 合计行
            'columns': columns,  # 列表头
        }
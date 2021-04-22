# -*- coding: utf-8 -*-

from odoo import models, fields, api

class Course(models.Model):
    """
    课程
    """
    _name = 'myproject.course'
    _inherit = ['mail.thread'] # 继承mail.thread保存字段值修改记录

    #  track_visibility表示字段值修改时，消息日志中会自动追踪
    name = fields.Char(string='课程名称', reqired=True, placeholder='填写课程名称', track_visibility='onchange')
    description = fields.Text(string='Description', placeholder='填写课程描述', track_visibility='onchange')
    sex = fields.Boolean(string='性别', default=True)
    state = fields.Selection(
        [('draft', "草稿"), ('open', "开启"), ('full', "满人"), ('cancel', "取消")], string="状态",
        help="课程状态", default="draft"
    )
    responsible_id = fields.Many2one('res.users', ondelete='set null', string="负责人", index=True)
    session_ids = fields.One2many('myproject.session', 'course_id', string="讲座")

    def copy(self, default=None):
        default = dict(default or {})
        copied_count = self.search_count(
            [('name', '=like', u"Copy of {}%".format(self.name))])
        if not copied_count:
            new_name = u"Copy of {}".format(self.name)
        else:
            new_name = u"Copy of {} ({})".format(self.name, copied_count)
        default['name'] = new_name
        return super(Course, self).copy(default)

    _sql_constraints = [
        ('name_description_check',
         'CHECK(name != description)',
         "The title of the course should not be the description"),
        ('name_unique',
         'UNIQUE(name)',
         "The course title must be unique"),
    ]

    @api.model
    def js_test(self):
        # 课程tree视图中测试按钮点击事件
        print('dddddddddd')

    @api.model
    def update_course_member(self):
        # 定时任务，更新课程参与人数
        for course in self.env['myproject.course'].sudo().search([]):
            sessions = self.env['myproject.session'].sudo().search([('course_id', '=', course.id)])
            attendees_count = 0
            for s in sessions:
                attendees_count += s.attendees_count

            course.description = '已参加人数有{}人'.format(attendees_count)
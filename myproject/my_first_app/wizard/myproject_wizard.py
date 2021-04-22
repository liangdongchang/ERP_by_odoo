# -*- coding: utf-8 -*-

from odoo import models, fields, api


class MyprojectWizard(models.TransientModel):
    _name = 'myproject.wizard'
    _description = '添加参与者'

    session_id = fields.Many2one('myproject.session', string="讲座", required=True)
    attendee_ids = fields.Many2many('res.partner', string="参与者")

    def subscribe(self):
        self.session_id.attendee_ids |= self.attendee_ids
        return {}


    @api.model
    def default_get(self, fields):
        result = super(MyprojectWizard, self).default_get(fields)
        result['session_id'] = self.env.context.get('active_id')

        return result


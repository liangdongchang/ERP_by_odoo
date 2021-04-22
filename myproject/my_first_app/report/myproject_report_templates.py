# -*- coding: utf-8 -*-
from odoo import api, models, fields

class SessionViewReport(models.AbstractModel):
    _name = 'report.my_first_app.report_myproject_report_templates'

    @api.model
    def _get_report_values(self, docids, data=None):
        ssession_ids = self.env['myproject.session'].browse(docids)

        return {
            'doc_ids': docids,
            'doc_model': self.env.context.get('active_model'),
            'data': data,
            'docs': ssession_ids,
        }
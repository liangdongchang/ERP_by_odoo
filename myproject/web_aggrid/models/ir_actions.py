# -*- coding: utf-8 -*-
from odoo import fields, models


class IrActionsActWindowView(models.Model):
    _inherit = 'ir.actions.act_window.view'

    view_mode = fields.Selection(selection_add=[('aggrid', "AgGrid")], ondelete={'aggrid': 'cascade'})

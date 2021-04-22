import json

from odoo import http
from odoo.http import request, JsonRequest, Response

class GetPartner(http.Controller):
    @http.route('/api/partner', auth='user')
    def partner(self, **kw):
        keywords = kw.get('keywords') or ''
        domain = [
            ('company_id', 'in', [1, request.env.user.company_id.id]),

        ]
        if keywords:
            domain += [('name', 'ilike', keywords)]

        partner = request.env['res.partner'].with_context({'search_default_customer': 1}).search(domain, limit=80)
        partners = []
        for res in partner:
            partners.append({
                'id': res.id,
                'text': res.name,
            })
        return json.dumps(partners)


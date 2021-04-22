# -*- coding: utf-8 -*-
{
    'name': "aggrid",

    'summary': """
        ag grid
    """,

    'description': """
        ag grid
    """,

    'author': "",
    'website': "",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/master/odoo/addons/base/module/module_data.xml
    # for the full list
    'category': '',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base'],

    # always loaded
    'data': [
        # 'security/ir.model.access.csv',

        'views/templates.xml',
    ],
    'qweb': [
        'static/src/xml/ag_grid.xml',
    ],
    'application': True,
}

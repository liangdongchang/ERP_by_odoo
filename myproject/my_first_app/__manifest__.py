# -*- coding: utf-8 -*-
{
    'name': "my_first_app",

    'summary': """
        第一个odoo应用，课程、课时模块""",

    'description': """
        第一个odoo应用，课程、课时模块
    """,

    'author': "LDC",
    'website': "http://odoo.qsxbc.com",

    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/14.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    'category': 'Uncategorized',
    'version': '0.1',

    # any module necessary for this one to work correctly
    'depends': ['base', 'website', 'board', 'web_aggrid'],

    # always loaded
    'data': [
        'security/myproject_security.xml',
        'security/ir.model.access.csv',
        'data/course_data.xml',
        'data/session_data.xml',
        'data/cron.xml',
        'views/menu_views.xml',
        'views/course_views.xml',
        'views/session_views.xml',
        'views/res_partner_views.xml',
        'wizard/myproject_wizard_view.xml',
        'wizard/actions_menu.xml',
        'report/myproject_report.xml',
        'report/myproject_report_templates.xml',
        'views/session_board.xml',
        'views/session_analysis.xml',
        'views/templates.xml',
    ],
    'application': True,
}

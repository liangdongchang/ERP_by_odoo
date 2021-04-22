# -*- coding: utf-8 -*-
import odoorpc

HOST = 'localhost'
PORT = 8199
DB = 'learn_odoo_14'  # s数据库
USER = 'admin'  # 登录odoo系统的登录名
PASS = 'admin'  # 登录odoo系统的登录密码
ROOT = 'http://%s:%d/xmlrpc/' % (HOST, PORT)

odoo = odoorpc.ODOO(HOST, port=PORT)

odoo.login(DB, USER, PASS)

order = odoo.env['myproject.session']
doamin = [('seats', '>', 2)]  # doamin 写条件语句
data = order.search_read(doamin)  # 在这里我们就可以试试能否调用模型中自定义的方法呢？ 理论上是可行的
print(data)
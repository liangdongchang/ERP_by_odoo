# -*- coding: utf-8 -*-

import functools
from xmlrpc import client

HOST = 'localhost'
PORT = 8199
DB = 'learn_odoo_14'  # s数据库
USER = 'admin'  # 登录odoo系统的登录名
PASS = 'admin'  # 登录odoo系统的登录密码
ROOT = 'http://%s:%d/xmlrpc/' % (HOST, PORT)


if __name__ == '__main__':
    # 1. Login
    uid = client.ServerProxy(ROOT + 'common').login(DB, USER, PASS)
    print("Logged in as %s (uid:%d)" % (USER, uid))
    call = functools.partial(
        client.ServerProxy(ROOT + 'object').execute,
        DB, uid, PASS)

    # 2. Read the sessions
    sessions = call('myproject.session', 'search_read', [], ['name', 'seats'])
    for session in sessions:
        print("Session %s (%s seats)" % (session['name'], session['seats']))

    # 3.create a new session
    session_id = call('myproject.session', 'create', {
        'name': 'My session',
        'course_id': 2,
    })

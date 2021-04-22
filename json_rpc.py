# -*- coding: utf-8 -*-
# -*- coding: utf-8 -*-

import json
import random
import odoorpc
import requests

HOST = 'localhost'
PORT = 8199
DB = 'learn_odoo_14'  # s数据库
USER = 'admin'  # 登录odoo系统的登录名
PASS = 'admin'  # 登录odoo系统的登录密码


def json_rpc_methods_1(url, method, params):
    # 方式1
    data = {
        "jsonrpc": "2.0",
        "method": method,
        "params": params,
        "id": random.randint(0, 1000000000),
    }
    req = requests.get(url=url, data=json.dumps(data), headers={
        "Content-Type": "application/json",
    })
    print(req.content.decode('utf-8'))
    reply = json.loads(req.content.decode('utf-8'))
    if reply.get("error"):
        raise Exception(reply["error"])
    return reply["result"]


def call(url, service, method, *args):
    return json_rpc_methods_1(url, "call", {"service": service, "method": method, "args": args})


def json_rpc_methods_2(host, port, db ,user, password):
    # 方式2
    odoo = odoorpc.ODOO(host, 'jsonrpc', port)  # 输入odoo的环境
    print(odoo.list())
    odoo.login(db, user, password)  # 想要连接的数据库登陆名和密码
    session_env = odoo.env['myproject.session']  # 想要改的表名
    session_search = session_env.search([('name', '=', "session 1")])  # 想要改的内容通过条件找出
    session_browse = session_env.browse(session_search)  # 浏览找到的内容
    print(session_browse)
    # 创建
    args = {
        'name': '新课时2',
        'course_id': 3,
        'seats': 23,
    }
    result = odoo.execute('myproject.session', 'create', args)
    print(result)
    course_env = odoo.env['myproject.course']  # 浏览员工信息表
    course_search = course_env.search([('name', 'in', ["英语", "课程"])])  # 通过条件查找相应的员工
    course_browse = course_env.browse(course_search)  # 获取查找的内容
    for course in course_browse:
        print(course)


if __name__ == '__main__':
    # 使用方式1
    # url = "http://%s:%s/jsonrpc" % (HOST, PORT)
    # uid = call(url, "common", "login", DB, USER, PASS)
    # # create a new note
    # args = {
    #     'name': '新课时',
    #     'course_id': 2,
    #     'seats': 5,
    # }
    # note_id = call(url, "object", "execute", DB, uid, PASS, 'myproject.session', 'create', args)
    # 使用方式2
    json_rpc_methods_2(HOST, PORT, DB, USER, PASS)


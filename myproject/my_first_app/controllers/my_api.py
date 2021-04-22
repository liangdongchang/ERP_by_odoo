# -*- coding: utf-8 -*-
import json
import jinja2
import werkzeug
import sys
import os
import logging

from odoo import http
from odoo.http import request, JsonRequest, Response
from odoo.tools import ustr, date_utils

if hasattr(sys, 'frozen'):
    # 加载html目录，使用jinja2渲染模板
    path = os.path.realpath(os.path.join(os.path.dirname(__file__), '..', 'views'))
    loader = jinja2.FileSystemLoader(path)
else:
    loader = jinja2.PackageLoader('odoo.addons.my_first_app', 'views')

env = jinja2.Environment(loader=loader, autoescape=True)
env.filters['json'] = json.dumps
_logger = logging.getLogger(__name__)


def _json_response(self, result=None, error=None):
    # 自定义odoo接口返回数据格式，获取到参数my_json就直接返回json数据，否则就返回默认数据格式
    # 默认数据格式
    '''
    {
        'jsonrpc': '2.0',
        'id': 12,
        'data': {}
    }
    '''
    if self.endpoint and self.endpoint.routing.get('my_json'):
        response = {}
        if error is not None:
            response['error'] = error
        if result is not None:
            response = result
    else:
        # odoo返回的默认数据格式
        response = {
            'jsonrpc': '2.0',
            'id': self.jsonrequest.get('id')
        }
        if error is not None:
            response['error'] = error
        if result is not None:
            response['result'] = result

    mime = 'application/json'
    body = json.dumps(response, default=date_utils.json_default)

    return Response(
        body, status=error and error.pop('http_status', 200) or 200,
        headers=[('Content-Type', mime), ('Content-Length', len(body))]
    )


# 重写JsonRequest中的_json_response方法
setattr(JsonRequest, '_json_response', _json_response)


class MyAPI(http.Controller):
    # 对外api

    def valid_response(self, data, message='', fmt='json'):
        # 返回json数据
        if fmt == 'str':
            return werkzeug.wrappers.Response(response=message)
        res = {'error': 0, 'message': message}
        res['data'] = data
        return werkzeug.wrappers.Response(
            content_type="application/json; charset=utf-8",
            response=json.dumps(res),
        )

    def invalid_response(self, message, error=1, fmt='json'):
        # 返回错误提示
        if fmt == 'str':
            return werkzeug.wrappers.Response(response=message)
        res = {'error': error, 'message': ''}
        res['message'] = message

        return werkzeug.wrappers.Response(
            content_type="application/json; charset=utf-8",
            response=json.dumps(res),
        )

    def invalid_response_template(self, message):
        # 返回错误页面
        return env.get_template('error.html').render({'message': message})

    def get_base_url(self):
        # 可以在系统参数中定义一个主url
        return request.env['ir.config_parameter'].sudo().get_param('web.url')

    @http.route('/dmz/hello_world', type='http', auth='public', website=True, sitemap=False)
    def helloworld(self, *args, **kw):
        # 返回格式1：返回jinjia2渲染的页面
        # return self.invalid_response_template('参数有误')
        # 返回格式2：重定向url
        url = '/dmz/redirect_url'
        return werkzeug.utils.redirect(url)
        # 返回格式3： json格式
        # data = {'python': 'hello world'}
        # return self.valid_response(data)

    @http.route('/dmz/redirect_url', type='http', auth='public',csrf=False)
    def redirect_url(self, *args, **kw):
        return {'code': 200, 'msg': '111'}

    @http.route('/dmz/defaultjson', type='json', auth='public', methods=['POST'], csrf=False)
    def default_json(self, *args, **kw):

        # 返回odoo默认的Json格式数据
        return {'code': 200, 'msg': '默认json格式'}

    @http.route('/dmz/newjson', type='json', auth='public', methods=['POST'], csrf=False, my_json=True)
    def new_json(self, *args, **kw):

        # 返回自定义的Json格式数据
        return {'code': 200, 'msg': '自定义json格式'}

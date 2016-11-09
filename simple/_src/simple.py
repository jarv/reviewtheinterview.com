# -*- coding: utf-8 -*-
import logging
import json

LOG = logging.getLogger()
LOG.setLevel(logging.DEBUG)


def handler(event, context):
    assert context
    LOG.debug(event)
    return {'status': 'success', 'context': context}

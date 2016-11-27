import json
import logging

LOG = logging.getLogger()
LOG.setLevel(logging.WARN)


def default_resp(err, res=None):
    if err:
        LOG.warn(str(err.message))
    return ({
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*"
        },
    })


def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    z.update(y)
    return z

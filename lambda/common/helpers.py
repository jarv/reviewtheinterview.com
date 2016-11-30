import json
import logging
import re
from dynamo import REGEX_MATCHES, ValidationError

LOG = logging.getLogger()
LOG.setLevel(logging.WARN)


def validated_body(body, fields):
    if set(body.keys()) != fields:
        LOG.warn("Wrong values in request, got {}".format(body.keys()))
        raise ValidationError("Wrong values in request, expecting: {}, got: {}".format(
            ",".join(list(fields)), ",".join(body.keys())))
    for value in fields:
        if value in REGEX_MATCHES:
            LOG.warn(REGEX_MATCHES[value])
            LOG.warn(body[value])
            if not re.search(REGEX_MATCHES[value], body[value]):
                LOG.warn("Validation error: {} doesn't match '{}'".format(body[value], REGEX_MATCHES[value]))
                raise ValidationError("{} has invalid characters.".format(value))

    return {k: body[k] for k in fields}


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

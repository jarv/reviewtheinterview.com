# -*- coding: utf-8 -*-
import logging
import json
import boto3
import uuid
import re
import time


class ValidationError(Exception):
    pass


class submit:
    company = "company"
    emoji = "emoji"
    location = "location"
    position = "position"
    review = "review"


class max_lengths:
    company = 30
    emoji = 10
    location = 50
    position = 50
    review = 140


class min_lengths:
    company = 3
    emoji = 5
    location = 5
    position = 3
    review = 10

SUBMIT_FIELDS = set([submit.company,
                     submit.emoji,
                     submit.location,
                     submit.position,
                     submit.review,
                     ])

OVERALL_LENGTH = 140
REGEX_MATCH = "^[A-Za-z\s0-9!:$@#%^&*(),]+$"

LOG = logging.getLogger()
LOG.setLevel(logging.DEBUG)
SUBMISSIONS_TABLE_NAME = 'reviewtheinterview-submissions'
UPDATES_TABLE_NAME = 'reviewtheinterview-updates'


def add_updates_for_action(item):
    dynamo_updates = boto3.resource('dynamodb').Table(UPDATES_TABLE_NAME)
    t = int(time.time() * 100)
    try:
        item_to_put = merge_two_dicts(item, {'create_time': t})
        dynamo_updates.put_item(Item=item_to_put)
    except Exception, e:
        LOG.exception("Error updating the {} table with {} : {} ".format(
            UPDATES_TABLE_NAME, item_to_put, e.message))
        raise ValidationError("Database error.")


def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    z.update(y)
    return z


def respond(err, res=None):
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*"
        },
    }


def validated_body(body):
    if set(body.keys()) != SUBMIT_FIELDS:
        raise ValidationError("Wrong values in request, expecting: {}, got: {}".format(
            ",".join(list(SUBMIT_FIELDS)), ",".join(body.keys())))
    if sum(len(body[value]) for value in SUBMIT_FIELDS if value != 'emoji') > OVERALL_LENGTH:
        raise ValidationError("Submission is over {} chars".format(OVERALL_LENGTH))
    for value in SUBMIT_FIELDS:
        if len(body[value]) > getattr(max_lengths, value):
            raise ValidationError("{} field must be less than {}.".format(value, getattr(max_lengths, value)))
        if len(body[value]) < getattr(min_lengths, value):
            raise ValidationError("{} field must be greater than {}.".format(value, getattr(min_lengths, value)))
        if not re.match(REGEX_MATCH, body[value]):
            raise ValidationError("{} has invalid characters.".format(value))
    return {k: body[k] for k in SUBMIT_FIELDS}


def handler(event, context):
    if 'body' not in event:
        return respond(ValidationError("Missing body."))

    try:
        body_from_json = json.loads(event['body'])
    except ValueError:
        return respond(ValidationError("Unable to parse request"))

    try:
        ret_body = validated_body(body_from_json)
    except ValidationError, e:
        return respond(e)

    if not ret_body:
        return respond(ValueError('Validation error - empty body'))

    req_fields = {}

    if 'httpMethod' in event:
        # Add additional fields for http requests
        operation = event['httpMethod']
        if operation != 'POST':
            return respond(ValueError('Unsupported method {}'.format(operation)))
        identity = event['requestContext']['identity']
        req_fields['user_agent'] = identity['userAgent']
        req_fields['source_ip'] = identity['sourceIp']
    else:
        req_fields['user_agent'] = "dummy user agent"
        req_fields['source_ip'] = "1.1.1.1"

    # prefix with "id" so we can use it for css id selectors
    u = "id" + str(uuid.uuid4())
    key = "key" + str(uuid.uuid4())

    ret_body['id'] = u
    ret_body['key'] = key
    dynamo = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    t = int(time.time() * 100)
    ret_body['create_time'] = t
    ret_body['update_time'] = t
    try:
        item = merge_two_dicts(ret_body, req_fields)
        put = dynamo.put_item(Item=item)
    except Exception as e:
        LOG.exception("Error adding entry to the database: {}".format(item))
        return respond(Exception('Database error'))

    try:
        add_updates_for_action(merge_two_dicts({"action": "submit"}, item))
    except Exception as e:
        LOG.exception("Error adding entry to the database: {}".format(item))
        return respond(Exception('Database error'))

    if put['ResponseMetadata']['HTTPStatusCode'] == 200:
        return respond(None, ret_body)
    else:
        return respond(Exception("Database error"))

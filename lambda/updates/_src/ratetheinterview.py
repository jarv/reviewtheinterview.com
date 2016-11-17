# -*- coding: utf-8 -*-
import logging
import json
import boto3
import re
import time
import decimal

# b = boto3.session.Session(profile_name='ratetheinterview', region_name='us-east-1')
# s = b.resource('dynamodb').Table("ratetheinterview-submissions")


class ValidationError(Exception):
    pass


class update:
    id = "id"
    action = "action"
    key = "key"


class actions:
    love = "love"
    poo = "poo"
    approve = "approve"
    reject = "reject"
    cancel = "cancel"


class max_lengths:
    id = 38
    action = 100
    key = 39


class regex_matches:
    id = '^[\w_-]+$'
    action = '^[\w_-]+$'
    key = '.*'

UPDATE_FIELDS = set([update.id,
                     update.action,
                     update.key,
                     ])

ACTION_FIELDS = set([actions.love,
                     actions.poo,
                     actions.approve,
                     actions.reject,
                     actions.cancel])


LOG = logging.getLogger()
LOG.setLevel(logging.DEBUG)
UPDATES_TABLE_NAME = 'ratetheinterview-updates'
SUBMISSIONS_TABLE_NAME = 'ratetheinterview-submissions'


def merge_two_dicts(x, y):
    '''Given two dicts, merge them into a new dict as a shallow copy.'''
    z = x.copy()
    z.update(y)
    return z


def respond(err, res=None):
    if err:
        LOG.warn(str(err.message))
    return {
        'statusCode': '400' if err else '200',
        'body': err.message if err else json.dumps(res),
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': "*"
        },
    }


def validated_body(body):
    if set(body.keys()) != UPDATE_FIELDS:
        raise ValidationError("Wrong values in request, expecting: {}, got: {}".format(
            ",".join(list(UPDATE_FIELDS)), ",".join(body.keys())))
    for value in UPDATE_FIELDS:
        if len(body[value]) > getattr(max_lengths, value):
            raise ValidationError("{} length is too long.".format(value))
        if not re.match(getattr(regex_matches, value), body[value]):
            raise ValidationError("{} has invalid characters.".format(value))
    if body[update.action] not in ACTION_FIELDS:
        raise ValidationError("{} is not a valid action.".format(body[update.action]))

    return {k: body[k] for k in UPDATE_FIELDS}


def get_item_from_id(key_id):
    dynamo_submissions = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    try:
        q = dynamo_submissions.get_item(Key={'id': key_id})
    except Exception, e:
        LOG.exception("Error querying the database for {}: {}".format(key_id, e.message))
        raise ValidationError("Database error.")
    if 'Item' not in q:
        raise ValidationError("Unable to find id: {}".format(key_id))
    return q['Item']


def increment_action(key_id, action):
    dynamo_submissions = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    t = int(time.time() * 100)
    try:
        q = dynamo_submissions.update_item(
            Key={'id': key_id},
            UpdateExpression="ADD {} :val SET update_time = :ut".format(action),
            ExpressionAttributeValues={':ut': t, ':val': decimal.Decimal(1)},
            ReturnValues="UPDATED_NEW")
    except Exception, e:
        LOG.exception("Error updating the database for key {} action {} : {}".format(
            key_id, action, e.message))
        raise ValidationError("Database error.")
    return q


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


def delete_item(key_id):
    dynamo_submissions = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    try:
        dynamo_submissions.delete_item(Key={'id': key_id})
    except Exception, e:
        LOG.exception("Error deleting from the {} table with key={} : {} ".format(
            SUBMISSIONS_TABLE_NAME, key_id, e.message))
        raise ValidationError("Database error.")


def handler(event, context):
    if 'body' not in event:
        return respond(ValidationError("Missing body."))

    try:
        body_from_json = json.loads(event['body'])
    except (ValueError, TypeError) as e:
        LOG.exception("Unable to parse body: {}".format(e.message))
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

    try:
        item = get_item_from_id(ret_body['id'])
        key_id = item['id']
        if ret_body['action'] == actions.cancel:
            if update.key not in item or update.key not in ret_body:
                raise ValidationError("Unable to cancel submission")
            if item['key'] != ret_body['key']:
                # fake the delete even though it won't be done
                return respond(None, {'id': key_id, 'action': ret_body['action'], 'status': 'success'})
            delete_item(key_id)
        else:
            increment_action(key_id, ret_body['action'])
        item_new = merge_two_dicts(item, req_fields)
        add_updates_for_action(merge_two_dicts({"action": ret_body['action']}, item_new))
    except ValidationError, e:
        return respond(e)

    return respond(None, {'id': key_id, 'action': ret_body['action'], 'status': 'success'})

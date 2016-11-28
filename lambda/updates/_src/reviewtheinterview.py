# -*- coding: utf-8 -*-
import logging
import json
import boto3
import re
import time
import decimal
from common.dynamo import update, actions, max_lengths, regex_matches, UPDATE_FIELDS, ACTION_FIELDS, ValidationError, UPDATES_TABLE_NAME, SUBMISSIONS_TABLE_NAME, raise_on_rate_limit
from common. helpers import default_resp, merge_two_dicts

# b = boto3.session.Session(profile_name='reviewtheinterview', region_name='us-east-1')
# s = b.resource('dynamodb').Table("reviewtheinterview-submissions")


LOG = logging.getLogger()
LOG.setLevel(logging.WARN)


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
        return default_resp(ValidationError("Missing body."))

    try:
        body_from_json = json.loads(event['body'])
    except (ValueError, TypeError) as e:
        LOG.exception("Unable to parse body: {}".format(e.message))
        return default_resp(ValidationError("Unable to parse request"))

    try:
        ret_body = validated_body(body_from_json)
    except ValidationError, e:
        return default_resp(e)

    if not ret_body:
        return default_resp(ValueError('Validation error - empty body'))

    req_fields = {}

    if 'httpMethod' in event:
        # Add additional fields for http requests
        operation = event['httpMethod']
        if operation != 'POST':
            return default_resp(ValueError('Unsupported method {}'.format(operation)))
        identity = event['requestContext']['identity']
        req_fields['user_agent'] = identity['userAgent']
        req_fields['source_ip'] = identity['sourceIp']
    else:
        req_fields['user_agent'] = "dummy user agent"
        req_fields['source_ip'] = "1.1.1.1"

    try:
        raise_on_rate_limit(req_fields['source_ip'], ret_body['action'])
    except ValidationError as e:
        return default_resp(e)

    try:
        item = get_item_from_id(ret_body['id'])
        key_id = item['id']
        if ret_body['action'] == actions.cancel:
            if update.key not in item or update.key not in ret_body:
                raise ValidationError("Unable to cancel submission")
            if item['key'] != ret_body['key']:
                # fake the delete even though it won't be done
                return default_resp(None, {'id': key_id, 'action': ret_body['action'], 'status': 'success'})
            delete_item(key_id)
        else:
            if item['source_ip'] == req_fields['source_ip']:
                # action on your own submission maybe, we will silently ignore
                LOG.warn("{} is trying to do a '{}' on their own id {}".format(
                    req_fields['source_ip'], ret_body['action'], key_id))
            else:
                increment_action(key_id, ret_body['action'])
        item_new = merge_two_dicts(item, req_fields)
        add_updates_for_action(merge_two_dicts({"action": ret_body['action']}, item_new))
    except ValidationError, e:
        return default_resp(e)

    return default_resp(None, {'id': key_id, 'action': ret_body['action'], 'status': 'success'})

# -*- coding: utf-8 -*-
import boto3
import time
from boto3.dynamodb.conditions import Key, Attr
import logging
from config import UPDATES_TABLE_NAME

LOG = logging.getLogger()
LOG.setLevel(logging.WARN)


class ValidationError(Exception):
    pass


class submit:
    company = "company"
    emoji = "emoji"
    location = "location"
    position = "position"
    review = "review"


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
    company = 30
    location = 50
    position = 40
    review = 140
    emoji = 10


class min_lengths:
    company = 3
    emoji = 5
    location = 5
    position = 3
    review = 10


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

SUBMIT_FIELDS = set([submit.company,
                     submit.emoji,
                     submit.location,
                     submit.position,
                     submit.review,
                     ])


RATE_LIMITS = {
    "submit": dict(num=3, time_span=900),  # 15 * 60 * 60
    # all actions that are not submissions
    "default": dict(num=100, time_span=60)
}


def raise_on_rate_limit(ip, action=None):
    dynamo_updates = boto3.resource('dynamodb').Table(UPDATES_TABLE_NAME)
    if (action == "submit"):
        time_span = int(time.time() * 100) - (RATE_LIMITS["submit"]['time_span'] * 100)
        c = dynamo_updates.query(
            KeyConditionExpression=Key('source_ip').eq(ip) & Key('create_time').gt(time_span),
            FilterExpression=Attr('action').eq('submit'))['Count']

        if c > RATE_LIMITS['submit']['num']:
            LOG.warn("Ip: {} is rate limited doing action {}".format(ip, action))
            raise ValidationError("You are doing too many submissions, slow down".format(action))
    else:
        time_span = int(time.time() * 100) - (RATE_LIMITS["default"]['time_span'] * 100)
        c = dynamo_updates.query(
            KeyConditionExpression=Key('source_ip').eq(ip) & Key('create_time').gt(time_span),
            FilterExpression=Attr('action').ne('submit'))['Count']
        if c > RATE_LIMITS['default']['num']:
            LOG.warn("Ip: {} is rate limited doing action {}".format(ip, action))
            raise ValidationError("You are doing too much {}, slow down".format(action))

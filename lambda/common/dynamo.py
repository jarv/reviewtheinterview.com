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
    id = "id"
    age = "age"
    company = "company"
    currency = "currency"
    emoji = "emoji"
    gender = "gender"
    location = "location"
    position = "position"
    review = "review"
    salary = "salary"


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


# Fields that are submitted by the user

ACTION_FIELDS = set([actions.love,
                     actions.poo,
                     actions.approve,
                     actions.reject,
                     actions.cancel])

SUBMIT_FIELDS = set([submit.age,
                     submit.company,
                     submit.currency,
                     submit.emoji,
                     submit.gender,
                     submit.location,
                     submit.position,
                     submit.review,
                     submit.salary,
                     ])

REGEX_MATCHES = {
    update.action: '^[\w_-]{0,100}$',
    update.key: '^[\w_-]{0,40}$',
    submit.id: '^[\w_-]{0,40}$',
    submit.company: r'^.{3,30}$',
    submit.location: r'^.{5,50}$',
    submit.position: r'^.{3,50}$',
    submit.review: r'^.{10,140}$',
    submit.emoji: r'^.{5,10}$',
    submit.salary: r'^\d{2,8}$',
    submit.currency: r'^.{3}$',
    submit.gender: r'^.{2,20}$',
    submit.age: r'^.{2,20}$',
}

UPDATE_FIELDS = set([update.id,
                     update.action,
                     update.key,
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

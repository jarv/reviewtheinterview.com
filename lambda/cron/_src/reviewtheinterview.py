import logging
import time
import boto3
from boto3.dynamodb.conditions import Key
from cStringIO import StringIO
import json
import decimal
from common.config import BUCKET, PENDING_KEY, REVIEW_KEY, SUBMISSIONS_TABLE_NAME, FIELDS
LOG = logging.getLogger()
LOG.setLevel(logging.WARN)

PENDING_THRESHOLD = Key('approve').lt(2)
APPROVE_THRESHOLD = Key('approve').gte(2)
REJECT_THRESHOLD = Key('reject').lt(2)


def value_convert(v):
    if isinstance(v, decimal.Decimal):
        if v % 1 > 0:
            return float(v)
        else:
            return int(v)
    return v


def delete_item(key_id):
    dynamo_submissions = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    dynamo_submissions.delete_item(Key={'id': key_id})


def get_items(p):
    return sorted([{k: value_convert(d[k]) for k in FIELDS} for d in p['Items']], key=lambda d: d['create_time'], reverse=True)


def handler(event, context):
    t = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    s3 = boto3.resource('s3')

    # pending
    p = t.scan(FilterExpression=PENDING_THRESHOLD & REJECT_THRESHOLD)
    if 'Items' in p:
        pending = get_items(p)
        pending_contents = StringIO(json.dumps(pending, indent=4, sort_keys=True))
        bucket = s3.Bucket(BUCKET)
        bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=PENDING_KEY, Body=pending_contents.read())

    # approved
    a = t.scan(FilterExpression=APPROVE_THRESHOLD & REJECT_THRESHOLD)
    if 'Items' in a:
        approved = get_items(a)
        approved_contents = StringIO(json.dumps(approved, indent=4, sort_keys=True))
        bucket = s3.Bucket(BUCKET)
        bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=REVIEW_KEY, Body=approved_contents.read())

    return {'status': 'success', 'time': time.time()}

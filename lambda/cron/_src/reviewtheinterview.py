import logging
import time
import boto3
from boto3.dynamodb.conditions import Key
from cStringIO import StringIO
import json
import decimal

LOG = logging.getLogger()
LOG.setLevel(logging.WARN)

BUCKET = "testing.reviewtheinterview.com"
PENDING_KEY = "pending-reviews/pending-reviews.json"
REVIEW_KEY = "reviews/reviews.json"
SUBMISSIONS_TABLE_NAME = 'reviewtheinterview-submissions'
FIELDS = ["id", "emoji", "company", "create_time", "position", "review"]

PENDING = Key('approve').lt(2)
APPROVED = Key('approve').gte(2)
REJECTED = Key('reject').gte(2)


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
    s = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    s3 = boto3.resource('s3')

    # rejected
    r = s.scan(FilterExpression=REJECTED)
    if 'Items' in r:
        for i in r['Items']:
            LOG.info("Deleting {}".format(i['id']))
            print("Deleting {}".format(i['id']))
            delete_item(i['id'])

    # pending
    p = s.scan(FilterExpression=PENDING)
    if 'Items' in p:
        pending = get_items(p)
        pending_contents = StringIO(json.dumps(pending, indent=4, sort_keys=True))
        bucket = s3.Bucket(BUCKET)
        bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=PENDING_KEY, Body=pending_contents.read())

    # approved
    a = s.scan(FilterExpression=APPROVED)
    if 'Items' in a:
        approved = get_items(a)
        approved_contents = StringIO(json.dumps(approved, indent=4, sort_keys=True))
        bucket = s3.Bucket(BUCKET)
        bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=REVIEW_KEY, Body=approved_contents.read())

    return {'status': 'success', 'time': time.time()}

import logging
import time
import boto3
from boto3.dynamodb.conditions import Key
from cStringIO import StringIO
import json
import decimal
import hashlib
import botocore
from common.config import BUCKET, PENDING_KEY, REVIEW_KEY, SUBMISSIONS_TABLE_NAME, EXTRA_RETURN_FIELDS
from common.dynamo import SUBMIT_FIELDS
LOG = logging.getLogger()
LOG.setLevel(logging.WARN)

PENDING_THRESHOLD = Key('approve').lt(2)
APPROVE_THRESHOLD = Key('approve').gte(2)
# Anything greater than this will be rejected
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
    return sorted([{k: value_convert(d[k]) for k in list(EXTRA_RETURN_FIELDS) + list(SUBMIT_FIELDS)} for d in p['Items']], key=lambda d: d['create_time'], reverse=True)[0:200]


def get_md5_etag(bucket, key):
    try:
        md5sum = boto3.client('s3').head_object(
            Bucket=bucket,
            Key=key
        )['ETag'][1:-1]
    except botocore.exceptions.ClientError:
        md5sum = None
    return md5sum


def get_md5(json_str):
    m = hashlib.md5()
    m.update(json_str)
    return m.hexdigest()


def handler(event, context):
    t = boto3.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    s3 = boto3.resource('s3')

    # pending
    p = t.scan(FilterExpression=PENDING_THRESHOLD & REJECT_THRESHOLD)
    if 'Items' in p:
        pending = get_items(p)
        json_str = json.dumps(pending, indent=4, sort_keys=True)
        if get_md5_etag(BUCKET, PENDING_KEY) != get_md5(json_str):
            pending_contents = StringIO(json_str)
            bucket = s3.Bucket(BUCKET)
            bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=PENDING_KEY, Body=pending_contents.read())
        else:
            LOG.warn("No changes for pending submissions, skipping s3 put")

    # approved
    a = t.scan(FilterExpression=APPROVE_THRESHOLD & REJECT_THRESHOLD)
    if 'Items' in a:
        approved = get_items(a)
        json_str = json.dumps(approved, indent=4, sort_keys=True)
        if get_md5_etag(BUCKET, REVIEW_KEY) != get_md5(json_str):
            approved_contents = StringIO(json_str)
            bucket = s3.Bucket(BUCKET)
            bucket.put_object(ContentType='application/json', CacheControl='no-cache, no-store, must-revalidate', Expires=0, ACL='public-read', Bucket=BUCKET, Key=REVIEW_KEY, Body=approved_contents.read())
        else:
            LOG.warn("No changes for submissions, skipping s3 put")

    return {'status': 'success', 'time': time.time()}

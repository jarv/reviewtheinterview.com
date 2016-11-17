import boto3
from boto3.dynamodb.conditions import Key
from cStringIO import StringIO
import json
import decimal
import logging

LOG = logging.getLogger()
LOG.setLevel(logging.DEBUG)
BUCKET = "testing.ratetheinterview.com"
PENDING_KEY = "pending-reviews/pending-reviews.json"
REVIEW_KEY = "reviews/reviews.json"
SUBMISSIONS_TABLE_NAME = 'ratetheinterview-submissions'


def value_convert(v):
    if isinstance(v, decimal.Decimal):
        if v % 1 > 0:
            return float(v)
        else:
            return int(v)
    return v


def delete_item(key_id):
    dynamo_submissions = b.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
    dynamo_submissions.delete_item(Key={'id': key_id})

b = boto3.session.Session(profile_name='ratetheinterview', region_name='us-east-1')
s = b.resource('dynamodb').Table(SUBMISSIONS_TABLE_NAME)
s3 = b.resource('s3')

FIELDS = ["id", "emoji", "company", "create_time", "position", "review"]

pending = Key('approve').lt(2)
approved = Key('approve').gte(2)
rejected = Key('reject').gte(2)

# rejected
r = s.scan(FilterExpression=rejected)
if 'Items' in r:
    for i in r['Items']:
        LOG.info("Deleting {}".format(i['id']))
        print("Deleting {}".format(i['id']))
        delete_item(i['id'])

# pending
p = s.scan(FilterExpression=pending, Limit=20)
if 'Items' in p:
    pending = [{k: value_convert(d[k]) for k in FIELDS} for d in p['Items']]
    pending_contents = StringIO(json.dumps(pending, indent=4, sort_keys=True))
    bucket = s3.Bucket(BUCKET)
    bucket.put_object(ACL='public-read', Bucket=BUCKET, Key=PENDING_KEY, Body=pending_contents.read())

# approved
a = s.scan(FilterExpression=approved, Limit=20)
if 'Items' in a:
    approved = [{k: value_convert(d[k]) for k in FIELDS} for d in a['Items']]
    approved_contents = StringIO(json.dumps(approved, indent=4, sort_keys=True))
    bucket = s3.Bucket(BUCKET)
    bucket.put_object(ACL='public-read', Bucket=BUCKET, Key=REVIEW_KEY, Body=approved_contents.read())

import json
import requests
from loremipsum import get_sentence
import random

emojis = [
    "e1f620",
    "e1f600",
    "e1f627",
    "e1f634",
    "e1f631",
    "e1f622",
]

for i in range(0,20):
    data = {"company": get_sentence()[0:10], "position": get_sentence()[0:10], "location": get_sentence()[0:10], "review": get_sentence()[0:10], "emoji": random.choice(emojis)}
    headers = {'content-type': 'application/json'}
    url = 'https://3x1gqtafv9.execute-api.us-east-1.amazonaws.com/prod/submit'
    r = requests.post(url, data=json.dumps(data), headers=headers)
    resp = json.loads(r.text)
    print(resp)
    for action in ['approve']: #, 'reject', 'love', 'poo']:
        for i in range(0, random.choice(range(2, 3))):
            data = {"action": action, "id": resp['id'], "key": ""}
            headers = {'content-type': 'application/json'}
            url = 'https://3x1gqtafv9.execute-api.us-east-1.amazonaws.com/prod/update'
            r = requests.post(url, data=json.dumps(data), headers=headers)
            resp = json.loads(r.text)
            print(resp)

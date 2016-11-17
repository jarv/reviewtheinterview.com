#!/bin/bash

dir=$(dirname $0)

python -c 'import sys, yaml, json; json.dump(yaml.load(sys.stdin), sys.stdout, indent=4)' < pending-reviews.yaml > ${dir}/../static/pending-reviews/pending-reviews.json
python -c 'import sys, yaml, json; json.dump(yaml.load(sys.stdin), sys.stdout, indent=4)' < reviews.yaml > ${dir}/../static/reviews/reviews.json

# aws s3 create-bucket reviewtheinterview-reviews-testing
# aws s3 cp --acl public --content-type "application/json" pending-reviews.json s3://reviewtheinterview-reviews-testing/pending-reviews.json
# aws s3 cp --acl public --content-type "application/json" reviews.json s3://reviewtheinterview-reviews-testing/reviews.json

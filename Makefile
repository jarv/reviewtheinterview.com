BASEDIR=$(CURDIR)
OUTPUTDIR=$(BASEDIR)/static

serve:
	cd $(OUTPUTDIR); python -m SimpleHTTPServer 5555

wsass:
	sass --watch sass:static/css

celery:
	cd watcher;DJANGO_SETTINGS_MODULE=watcher.settings python manage.py celery worker -Q screenshot,day,mail  -l info -B --scheduler djcelery.schedulers.DatabaseScheduler

runserver:
	cd watcher;python manage.py runserver

flower:
	cd watcher;DJANGO_SETTINGS_MODULE=watcher.settings celery -A watcher.tasks flower --port=5556
sync:
	aws --region us-east-1 --profile reviewtheinterview s3 sync --exclude "pending-reviews/pending-reviews.json" --exclude "reviews/reviews.json" --exclude "js/review-the-interview.js" --exclude "css/review-the-interview.css" --exclude "css/review-the-interview.css.map" --acl public-read $(OUTPUTDIR)/ s3://testing.reviewtheinterview.com
	aws --region us-east-1 --profile reviewtheinterview s3 cp --content-type "application/javascript" --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/js/review-the-interview.js s3://testing.reviewtheinterview.com/js/review-the-interview.js
	aws --region us-east-1 --profile reviewtheinterview s3 cp --content-type "text/css" --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/css/review-the-interview.css s3://testing.reviewtheinterview.com/css/review-the-interview.css
	aws --region us-east-1 --profile reviewtheinterview s3 cp --content-type "application/octet-stream" --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/css/review-the-interview.css.map s3://testing.reviewtheinterview.com/css/review-the-interview.css.map
#	aws --region us-east-1 --profile reviewtheinterview s3 cp --content-type "application/octet-stream" --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/index.html s3://testing.reviewtheinterview.com/index.html

BASEDIR=$(CURDIR)
OUTPUTDIR=$(BASEDIR)/static
LAMBDADIR=$(CURDIR)/lambda
# BUCKET := testing.reviewtheinterview.com
BUCKET := reviewtheinterview.com
EXCLUDE := --exclude "pending-reviews/pending-reviews.json" --exclude "reviews/reviews.json" --exclude "js/review-the-interview.js" --exclude "css/review-the-interview.css" --exclude "css/review-the-interview.css.map" --exclude "js/local.js"
DISTID := E36S5C6L3HC1XI # reviewtheinterview.com
# DISTID := E3QODGY5LWIHVA # testing.reviewtheinterview.com

serve:
	cd $(OUTPUTDIR); python -m SimpleHTTPServer 5555

wsass:
	sass --watch sass:static/css --style compressed

celery:
	cd watcher;DJANGO_SETTINGS_MODULE=watcher.settings python manage.py celery worker -Q screenshot,day,mail  -l info -B --scheduler djcelery.schedulers.DatabaseScheduler

runserver:
	cd watcher;python manage.py runserver

flower:
	cd watcher;DJANGO_SETTINGS_MODULE=watcher.settings celery -A watcher.tasks flower --port=5556
sync:
	uglifyjs --compress --mangle -- $(OUTPUTDIR)/js/local.js > $(OUTPUTDIR)/js/review-the-interview.js
	sed -i'' -e 's/local.js/review-the-interview.js/' $(OUTPUTDIR)/index.html
	aws --region us-east-1 --profile reviewtheinterview s3 sync $(EXCLUDE) --delete --acl public-read $(OUTPUTDIR)/ s3://$(BUCKET)
	for f in js/review-the-interview.js css/review-the-interview.css css/review-the-interview.css.map; do \
	    aws --region us-east-1 --profile reviewtheinterview s3 cp --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/$$f s3://$(BUCKET)/$$f; \
	done
	sed -i'' -e 's/review-the-interview\.js/local.js/' $(OUTPUTDIR)/index.html
	aws --region us-east-1 --profile reviewtheinterview cloudfront create-invalidation --distribution-id $(DISTID) --paths '/*'

herp:
	cd $(LAMBDADIR)
	for d in cron submissions updates; do cd $(LAMBDADIR)/$$d; kappa deploy; done

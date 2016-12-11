BASEDIR=$(CURDIR)
OUTPUTDIR=$(BASEDIR)/static
LAMBDADIR=$(CURDIR)/lambda
# BUCKET := testing.submityoursalary.com
BUCKET := submityoursalary.com
EXCLUDE := --exclude "pending-reviews/pending-reviews.json" --exclude "reviews/reviews.json" --exclude "js/submit-your-salary.js" --exclude "css/submit-your-salary.css" --exclude "css/submit-your-salary.css.map" --exclude "js/local.js"
DISTID := E36S5C6L3HC1XI # submityoursalary.com
# DISTID := E3QODGY5LWIHVA # testing.submityoursalary.com

serve:
	cd $(OUTPUTDIR); python3 -m http.server 8000 --bind 127.0.0.1

wsass:
	sass --watch sass:static/css --style compressed

sync:
	uglifyjs --compress --mangle -- $(OUTPUTDIR)/js/local.js > $(OUTPUTDIR)/js/submit-your-salary.js
	sed -i'' -e 's/local.js/submit-your-salary.js/' $(OUTPUTDIR)/testing.html
	aws --region us-east-1 --profile submityoursalary s3 sync $(EXCLUDE) --delete --acl public-read $(OUTPUTDIR)/ s3://$(BUCKET)
	for f in js/submit-your-salary.js css/submit-your-salary.css css/submit-your-salary.css.map; do \
	    aws --region us-east-1 --profile submityoursalary s3 cp --cache-control "no-cache, no-store, must-revalidate" --expires 0 --acl public-read static/$$f s3://$(BUCKET)/$$f; \
	done
	sed -i'' -e 's/submit-your-salary\.js/local.js/' $(OUTPUTDIR)/testing.html
	aws --region us-east-1 --profile submityoursalary cloudfront create-invalidation --distribution-id $(DISTID) --paths '/*'

kappa:
	cd $(LAMBDADIR)
	for d in cron submissions updates; do cd $(LAMBDADIR)/$$d; kappa deploy; done

#!/usr/bin/env python
# -*- coding: utf-8 -*- #
from __future__ import unicode_literals

AUTHOR = u'john'
SITENAME = u'Review the Interview'
SITEURL = 'https://about.reviewtheinterview.com'
FEED_RSS = 'rss.xml'

PATH = 'content'
GOOGLE_ANALYTICS_ID = 'UA-88070465-1'
TIMEZONE = 'US/Eastern'
THEME = 'reviewtheinterview'
DEFAULT_LANG = u'en'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None
SUMMARY_MAX_LENGTH = 1000
MENUITEMS = [
    ('home', '/'),
    ('archives', '/archives.html'),
    ('about', '/pages/about.html'),
]

DEFAULT_PAGINATION = 5
STATIC_PATHS = ['extra', 'static']
ARTICLE_EXCLUDES = ['extra', 'static']

EXTRA_PATH_METADATA = {
    'extra/robots.txt': {'path': 'robots.txt'},
    'extra/favicon.ico': {'path': 'favicon.ico'}
    }
EMAIL = 'info@reviewtheinterview.com'
SOCIAL = [
        ('twitter', 'https://twitter.com/interviewemoji')
        ]

LOAD_CONTENT_CACHE = False
RESPONSIVE_IMAGES = True
# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True

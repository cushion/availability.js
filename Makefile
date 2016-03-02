PACKAGE=availability

VERSION=`git describe`
RELEASE_FILE=$(PACKAGE)-$(VERSION).zip

UGLIFYJS=./node_modules/uglify-js/bin/uglifyjs
UGLIFYCSS=./node_modules/uglifycss/uglifycss

all: build/availability.css build/availability.js

build/availability.css: availability.css
	$(UGLIFYCSS) $< > $@

build/availability.js: availability.js
	$(UGLIFYJS) $< -m --lint --wrap Availability -o $@

release: all
	zip -j $(RELEASE_FILE) build/availability.*

clean:
	rm -f $(PACKAGE)-*.zip
	rm -f build/*

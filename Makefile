.PHONY: zip clean

zip_file = user-agent-unnightlyfier.zip
files = manifest.json background.js options.html options.js icon/32.png icon/64.png icon/128.png

zip: $(zip_file)

$(zip_file): $(files)
	zip -9 --suffixes .png $(zip_file) $(files)

clean:
	rm -v $(zip_file) || true

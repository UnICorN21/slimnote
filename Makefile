SED := sed -ie
SED_ARG := "s/var env = '.*'/var env = 'placeholder'/"

CONFIG_FILE := webpack.config.js

release: clean # Set env to 'release' and copy the results into build dir.
	@$(SED) $(subst placeholder, release, $(SED_ARG)) $(CONFIG_FILE)
	@echo "Compiling with webpack..."
	@webpack 1>&-
	@cp index.html build
	@rm $(CONFIG_FILE)e # Handle some bugs here.
	@echo "Succeed!"

debug: # Set env to 'debug' and run the node server.
	@$(SED) $(subst placeholder, debug, $(SED_ARG)) $(CONFIG_FILE)
	@rm $(CONFIG_FILE)e # Handle some bugs here.
	@node server

clean:
	rm -rf build

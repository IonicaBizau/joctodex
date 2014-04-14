#!/usr/bin/env node
const HELP =
"octodex --help" +
"\nusage: octodex [options]" +
"\n" +
"\nShows in Terminal a beautiful ASCIIed octocats." +
"\n" +
"\noptions:" +
"\n  --v, --version          prints the version" +
"\n  --o                     sets the name of the octocat that must be downloaded and showed" +
"\n  --help                  prints this output" +
"\n" +
"\nDocumentation can be found at https://github.com/IonicaBizau/joctodex";


// dependencies
var ImageToAscii = require ("image-to-ascii")
  , Request = require ("request")
  , AsciiFrames = require ("ascii-frames")
  , Yargs = require('yargs').usage(HELP)
  , argv = Yargs.argv
  , octocatName = (argv.o || "").toLowerCase()
  , prefix = "https://octodex.github.com/images/"
  ;

// show version
if (argv.v || argv.version) {
    return console.log("octodex v" + require ("./package").version);
}

/**
 *  Builds the image path
 *
 */
function getImagePath (name, callback) {

    // possible extensions
    var possibleExtensions = ["gif", "png", "jpg"]
      , response = {}
      , complete = 0
      ;

    for (var i = 0; i < possibleExtensions.length; ++i) {
        (function (cEx) {
            var path = prefix + name + "." + cEx;
            Request.head(path, function(err, res, body) {

                if (err) {
                    return callback (err);
                }

                response[cEx] = {
                    path: path
                  , statusCode: res.statusCode
                };

                if (++complete === possibleExtensions.length) {

                    // jpg has priority
                    if (response["jpg"].statusCode === 200) {
                        return callback (null, response.jpg.path);
                    }

                    if (response["png"].statusCode === 200) {
                        return callback (null, response.png.path);
                    }

                    if (response["gif"].statusCode === 200) {
                        return callback (null, response.gif.path);
                    }

                    callback ("Not found");
                }
            });
        })(possibleExtensions[i]);
    }
}

var frames = [];
getImagePath (octocatName, function (err, octo) {

    if (err) {
        return console.log(err);
    }

    var frameCount = 10;
    for (var i = 0; i < frameCount; ++i) {
        (function (idx) {

            var octocat = new ImageToAscii ({
                resize: {
                    height: "100%"
                  , width:  "50%"
                }
              , colored: true
              , multiplyWidth: frameCount - idx
            });

            octocat.convert(octo, function(err, converted) {
                frames[idx] = converted;
                if (frames.length === frameCount) {

                    // create a new instance
                    var animation = new AsciiFrames ();

                    // load frames
                    animation.loadFrames(frames);

                    // and start animation
                    animation.startAnimation({
                        frameDelay: 500
                    });

                    setTimeout (function () {
                        console.log(frames[frames.length - 1]);
                        process.exit();
                    }, 500 * (frames.length + 1));
                }
            });
        })(i)
    }
});

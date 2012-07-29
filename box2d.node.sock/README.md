This is really just a mockup so that i can learn socket.io ande node.js and some essentials around those.
The code is free and as is, let's say no licens.

The fun part is no canvas, it's all div and web-kit transform, or compatible...
Socket.io hooked on top of express app.

It's my first take on git and node.js so be nice. I still don't get how to commit the complete trunk and mark as release.
hosted the app part @ http://www.heroku.com/ so thats what the package.json and Procfile is fore.

*******************************************************
How to use:
this mockup requires node.js, socket.io and express.
install node.js
fix your path if you are in window
npm install express
npm install socket.io
Run "node app.js" from bash or cmd and then open one or more windows with "demo2.html".
*******************************************************

(in windows you can not just open demo2.html from disk, it has to be hosted) 
in windows if you don't know how to do this follow (for vista, win7+): {
click the flag down left on your desktop. the "start" button.
in the sarch field write programs an features.
click programs and features in the list.
click Turn windows features on or off. (up left)
get a coffe, enjoy the aroma and then look at the list that just opend up.
if internet information service is not checked, check it and press ok.
otherwise click cancel.
click the flag down left on your desktop. the "start" button.
click computer, mid right in the menu.
double click local disk(c:)
double click inetpub
double click wwwroot
copy demo2.html and the lib folder here.
click the flag down left on your desktop. the "start" button.
type http://localhost/demo2.html in the search box and hit enter
you should now see the sample.
edit demo2.html and change http://xxxxxx.heroku.com/ to http://localhost/
start the app.js as above.
click the flag down left on your desktop. the "start" button.
type http://localhost/demo2.html in the search box and hit enter
}
*******************************************************

if you try to deploy the app.js on heroku and are using windows.
check your %Path% after installing toolbelt, check the heroukuRubyPath and check herouku.bat in "program files"/heroku
my ruby installed was 1.9.2, in .bat file it was 1.9.3 and the path env var was missing...
also think about installing python to get the blazing compiled yada locals...
I'd say the performance gained is round about 0% and as a comparison for when you deploy to a cloud service then performance, yes network latency, hit's you like a ton of puberty.

**************************************

todo:
refactor Box2D parts into an object to learn prototype.
serve demo2.html through express server using fs... 
could probably simulate parts localy on the client to give the impression of performance...

known issues:
it's a bit slugish when run from a host like heroku, flows quite alright on local network considering fps/network traffic. 
for an even more fluid experience localy or on another host remove the xhr part from app.js:
<remove>
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});
</remove>

************************************************
Credits:
************************************************
Here's where i ripped of the css transforms part:
http://paal.org/blog/
and also to test tablet functionality the 
MouseAndTouch.js by Pål Smitt-Amundsen 

and the base project i slightly based my project on is this:
https://github.com/agentcooper/Box2d-networking

Test page for this project @ www.ormios.se/demo2.html
Test node.js server for this @ http://blooming-reef-7500.herokuapp.com

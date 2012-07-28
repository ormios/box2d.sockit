This is really just a mockup so that i can learn socket.io ande node.js and some essentials around those.
The code is free and as is, let's say no licens.

How to use:
this mockup requires node.js, socket.io and express.
install node.js
fix your path if you are in window
npm install express
npm install socket.io

if you try to deploy on heroku and are using windows.
check your path, check the heroukuRubyPath and check herouku.bat in "program files"/heroku
my ruby installed was 1.9.2, in bat file it was 1.9.3 and the path env var was missing...


Run "node app.js" and then open one or more windows with "demo2.html".
(in windows you can not just open demo2.html from disk, it has to be hosted) 
The fun part is no canvas, it's all div and web-kit transform, or compatible...
Socket.io hooked on top of express app.

It's my first take on git and node.js so be nice. I still don't get how to commit the complete trunk and mark as release.
hosted the app part @ http://www.heroku.com/ so thats what the package.json and Procfile is fore.

todo:
refactor Box2D parts into an object to learn prototype.
serve demo2.html through express server using fs... 

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

and the base project i modified is this:
https://github.com/agentcooper/Box2d-networking

Test page at www.ormios.se/demo2.html

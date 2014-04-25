Spotted tail
===

The graph for article dashboard.

## Compiling the css

````
stylus -u nib -w
````

Install nib if you don't have it

````
npm install nib -g
````

## Requirements

* brushable - done
* handle variable number line charts - done
* hover points - done
* colorable - done
* responsive - done
* hover labels respect bounds - done
* possibly remove underscore dependency, currently relying on _.extend and _.throttle - done
* display notes - done
* accept "impact events" and basic annotations - done
	* an "impact event" is a moment such as award
	* basic annotation is some relevante event such "this is when our main account tweeted the story" but that is not itself a measure of impact
* design note labels / interaction - basic version done
* create modal pop-ups for note annotations
* legend
* change responsive change to a d3 update instead of rewriting svg

[Demo](https://newslynx.github.io/spotted-tail)
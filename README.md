Spotted tail
===

The graph for article dashboard.

## Requirements

* brushable - done
* handle variable number line charts - done
* hover points - done
* colorable - done
* responsive - done
* hover labels respect bounds - done
* accept "impact events" and basic annotations
	* an "impact event" is a moment such as award
	* basic annotation is some relevante event such "this is when our main account tweeted the story" but that is not itself a measure of impact
* labels on impact events and annotations display nicely, i.e. avoid one another.
* possibly remove underscore dependency, currently relying on _.extend and _.throttle - done
* legend
* change responsive change to a d3 update instead of rewriting svg

[Demo](https://newslynx.github.io/spotted-tail)
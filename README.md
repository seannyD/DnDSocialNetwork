# DnD Social Network

Visualise connections between D&D players.

You can contribute data to the "data" folder. Add a comma-separated spreadsheet file (csv) with one line per player, including the following columns:

-  Player: Name of Player.
-  Show: Name of Show. 
-  Role: One of 'Player', 'DM' or 'Guest'.
-  Oneshot: 'Yes' if this is a one-shot game, otherwise it assumes it's a regular show.
-  Link: url to video.

A regular group can be coded like this, with one player per row:

|Player|Show|Role|Oneshot|Link|
|------|--|--|--|--|
|Matthew Mercer|Critical Role|DM||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Ashley Johnson|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Laura Bailey|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Liam O'Brien|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Marisha Ray|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Sam Riegel|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Taliesin Jaffe|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|
|Travis Willingham|Critical Role|Player||https://www.youtube.com/channel/UCpXBGqwsBkpvcYjsJBQ7LEQ|

Guests are coded like this, with a link to an episode where they appear:

|Player|Show|Role|Oneshot|Link|
|------|--|--|--|--|
|...|...|...|...|...|
|Felicia Day|Critical Role|Guest||https://www.youtube.com/watch?v=60sUkTh6xBc|
|Mary Elizabeth McGlynn|Critical Role|Guest||https://www.youtube.com/watch?v=60sUkTh6xBc|

One-shots are coded like this:

|Player|Show|Role|Oneshot|Link|
|------|--|--|--|--|
|...|...|...|...|...|
|Matthew Mercer|Stephen Colbert's D&D Adventure|DM|Yes|https://www.youtube.com/watch?v=3658C2y4LlA|
|Stephen Colbert|Stephen Colbert's D&D Adventure|Player|Yes|https://www.youtube.com/watch?v=3658C2y4LlA|

The R script processing/makeJSON.R turns this information into a JSON file that can be read by the [vis.js](https://visjs.org/) package for visualising networks.
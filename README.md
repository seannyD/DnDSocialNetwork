# DnD Social Network

Visualise connections between D&D players.

You can contribute data to data/connections.csv. This is a spreadsheet with one line per player, including the following columns:

-  Player: Name of Player.
-  Show: Name of Show. 
-  Role: One of 'Player', 'DM' or 'Guest'.
-  Oneshot: 'Yes' if this is a one-shot game, otherwise it assumes it's a regular show.
-  Link: url to video.

The R script processing/makeJSON.R turns this information into a JSON file that can be read by the vis.js package for visualising networks.

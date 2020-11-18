# TODO: 
# Make dice shape random
# vary dice colours

library(tibble)
library(jsonlite)
library(dplyr)
library(igraph)
if (!require("ForceAtlas2")) devtools::install_github("analyxcompany/ForceAtlas2")
library("ForceAtlas2")

estimateStartingCoordinates = TRUE


try(setwd("/Library/WebServer/Documents/DNDSocialNetwork/processing/"))

# Data used to be a single csv, but is now
# split into one for each show
#d = read.csv("../data/connections.csv",stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")

# Load data from separate csvs:

data = list()

for(csvFile in list.files("../data/",pattern = "*.csv")){
  data[[length(data)+1]] = read.csv(paste0("../data/",csvFile),stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")
}

d <- do.call("rbind", data)

d = d[!is.na(d$Player),]
d = d[d$Player!="",]
d = d[!duplicated(d[,c("Player","Show","Role")]),]
d$Oneshot[is.na(d$Oneshot)] = "No"

# TODO: fill in links

# Check for typos:
nameDist = adist(unique(d$Player),unique(d$Player))
closeNames = which(nameDist<3 & nameDist>0,arr.ind = T)
closeNames = cbind(unique(d$Player)[closeNames[,1]],unique(d$Player)[closeNames[,2]])
if(nrow(closeNames)>0){
  warning("Names may be close duplicates:")
  print(closeNames)
}

# Standard games
sGames = d[d$Oneshot!="Yes",]

links = data.frame(from = sGames$Player, to = sGames$Show, role=sGames$Role, link=sGames$Link,show=sGames$Show,stringsAsFactors = F)

# We use ; as delimiter
d$Show = gsub(";",":",d$Show)

# One-shots
oneshots = unique(d[d$Oneshot=="Yes",]$Show)
oneshotList = data.frame()
for(show in oneshots){
  dx = d[d$Show==show,]
  people = unique(dx$Player)
  people_pairs = combn(people,2)
  # Sort order
  people_pairs = apply(people_pairs,2,sort)
  
  showlinks = data.frame(from=people_pairs[1,], to = people_pairs[2,], role="Oneshot", link = dx$Link[1],show=show,stringsAsFactors = F)
  oneshotList = rbind(oneshotList,showlinks)
}

# Collapse to only one edge for each pair of people
oneshotList = oneshotList %>% group_by(from,to) %>% summarise(
  role = head(role,n=1),
  link = paste(link,collapse=";"),
  show = paste(show,collapse=";")
)

links = bind_rows(links,oneshotList)

links$role = as.character(factor(links$role,
                    levels=c("Player","Guest","DM","Oneshot"),
                    labels=c("p",'g','d','o')))

showLinks = tapply(d$Link,d$Show,head,n=1)

allPlayers = unique(d$Player)
allGroups = unique(d[d$Oneshot!="Yes",]$Show)

nodes = data.frame(
  id=c(allPlayers,allGroups),
  type=c(rep("p",length(allPlayers)),rep("g",length(allGroups))),
  stringsAsFactors = F)
nodes$label = nodes$id
nodes$link = ""
nodes[nodes$type=="g",]$link = showLinks[nodes[nodes$type=="g",]$id]

nodes[nodes$id %in% d[d$Role=="DM",]$Player,]$type="d"

# Colours (now moved to online assignment through type)
#fillColour = c(player="#a6cee3",group= "#b2df8a")
#borderColour = c(player="#1f78b4",group= "#33a02c")
#nodes$color = sapply(nodes$type, function(X){
#  # To get nested objects in the JSON, I have to do this apparently
#  list(tibble(
#    background=(fillColour[X]),
#    border = (borderColour[X])))
#})

# Initial positions
set.seed(23879)
lx = links[,c("from","to")]
g = graph_from_edgelist(as.matrix(links[,c("from","to")]))

# Remove people who are not connected to the main component
comp = components(g)
if(length(unique(comp$membership))>1){
  largestComp = as.numeric(names(sort(table(comp$membership),decreasing = T)[1]))
  otherComponents = names(comp$membership[comp$membership!=largestComp])
  
  print(paste("Removed",length(otherComponents),"nodes from unconnected components:"))
  print(otherComponents)
  nodes = nodes[!nodes$id %in% otherComponents,]
  links = links[!links$from %in% otherComponents,]
  links = links[!links$to %in% otherComponents,]
  g = delete_vertices(g,otherComponents)
}

print("Finding initial positions ...")
set.seed(78223)
if(estimateStartingCoordinates){
  coords = layout.forceatlas2(g,plotstep = 0,iterations=20000)#,
                     # directed=TRUE,
                     # linlog = FALSE, pos = NULL, nohubs = FALSE,
                     # k = 100,
                     # gravity=-50,
                     # ks=0.08,
                     # ksmax=10,
                     # delta = 1,
                     # center=NULL,
                     # tolerance = 0.1,
                     # dim = 2)
  
  #coords <- layout_(g, with_fr())
  nodes$x = coords[,1]*0.1
  nodes$y = coords[,2]*0.05
} else{
  nodes$x = 0;
  nodes$y = 0;
}

# Make JSON
# Need to map values to lists, or will print as [ ... ]
#nodes_json = mutate(nodes, color = purrr::map(color, as.list)) %>% 
#  jsonlite::toJSON(auto_unbox = TRUE, pretty = FALSE)
nodes_json = toJSON(nodes)
edges_json = toJSON(links)

cat(paste0('{"nodes":',nodes_json,',"edges":',edges_json,"}"),file="../web/site/DnDNetwork.json")


# Data was originally just one file.
# This splits it into many files
setwd("/Library/WebServer/Documents/DNDSocialNetwork/processing/")

d = read.csv("../data/connections.csv",stringsAsFactors = F,encoding = "UTF-8",fileEncoding = "UTF-8")

shows = unique(d$Show)
shows = shows[shows!=""]
shows = shows[shows!=" "]

for(show in shows){
  dx = d[d$Show==show,]
  
  showFileName = dx$Show[1]
  showFileName = gsub(" +","_",showFileName)
  showFileName = gsub("[\\(\\)\\-\\:,/']","",showFileName)
  showFileName = gsub("&","n",showFileName)
  showFileName = paste0(showFileName,".csv")
  
  write.csv(dx,
    file = paste0("../data/",showFileName),
    row.names = F)
  
}
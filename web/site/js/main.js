/* 
var colourScheme = {
	p: {background:"#a6cee3", border:"#1f78b4"}, //player
	g: {background:"#b2df8a", border:"#33a02c", highlight: "#9ceb57"},  //group
	d: {background:"#fb9a99", border:"#e41a1c", highlight: "#ff4d4a"}
	}
 */
	
var colourScheme = {
	1: {background:"#DDDDDD", border:"#CCCCCC"}, //player
	2: {background:"#fb9a99", border:"#e41a1c", highlight: "#ff4d4a"}, // DM
3: {background:"#B3CDE3", border:"#377EB8", highlight: "#377EB8"},
 4: {background:"#CCEBC5", border:"#4DAF4A", highlight: "#4DAF4A"},
 5: {background:"#DECBE4", border:"#984EA3", highlight: "#984EA3"},
 6: {background:"#FED9A6", border:"#FF7F00", highlight: "#FF7F00"},
 7: {background:"#FFFFCC", border:"#FFFF33", highlight: "#FFFF33"},
 8: {background:"#E5D8BD", border:"#A65628", highlight: "#A65628"},
 9: {background:"#FDDAEC", border:"#F781BF", highlight: "#F781BF"}
};

const HexAngle = (Math.PI * 2) / 6;

var network;
var network_nodes;
var network_edges;

var infoTitle,infoContent,linkContent;

var defaultTitle = '<h2>D&D Social Network</h2>';
var defaultMessage = 'A network of D&D groups. Click on a link or a die to see more information. You can add data to this network <a href="https://github.com/seannyD/DnDSocialNetwork">via github</a>.';

window.onload = function(){

	infoTitle = $("#infoTitle");
	infoContent = $("#infoContent");
	linkContent = $("#linkContent");
	
	infoTitle.html(defaultTitle);
	infoContent.html(defaultMessage);
	

	var json = $.getJSON("DNDNetwork.json")
	  .done(function(data){
		var data = {
		  nodes: data.nodes,
		  edges: data.edges
		};
		initialiseNetwork(data)
	  });
	  
	$("#search").autocomplete({
		source: function (request, response) {
			// return top 10 hits
        	var results = $.ui.autocomplete.filter(network_nodes.get(), request.term);
    	    response(results.slice(0, 10));
	    	},
		select: function(event,ui){
			network.moveTo({position: network.getPosition(ui.item.value), animation:true, scale:4});
			networkClicked({nodes:[ui.item.value]});
			}
	});
	
	$("#search").keypress(function(event) {
	if ( event.key == "Enter" || event.which==13 ) {
		network.moveTo({position: network.getPosition($("#search").val()), animation:true, scale:4});
		$("#ui-id-1").hide();
		networkClicked({nodes:[ui.item.value]});
		} 
	});
	  
}

initialiseNetwork = function(data){

	network_nodes= new vis.DataSet(data.nodes);
	network_edges = new vis.DataSet(data.edges);
	
	
	
	var options = {
		nodes:{
			shape:"custom",
			ctxRenderer: nodeShapeRenderer,
			labelHighlightBold: false,
			shadow: true,
			font: {color: "#FFFFFF"}
		},
		edges:{
			color: {color:"#ebebeb88", highlight:"#FF0000"}
		},
		physics:{ enabled: true,
		stabilization: {
    	  enabled: true,
	      iterations: 100,
	      updateInterval: 10
	      }
	    },
	    layout: {
	    	improvedLayout: false
	    	}
	};
	var container = document.getElementById('mynetwork');
	network = new vis.Network(container, 
		{nodes:network_nodes, edges:network_edges},
	 	options);
	 	
	ctx = network.canvas.getContext()
    ctx.font = "normal 12px garamond";
	
	var ids = network_nodes.getIds();
	for(var i=0; i<ids.length;++i){
		var nx = network_nodes.get(ids[i]);
		
		// Pre-calculate text positions
		var labelSplit = nx.label.split(" ")
		var labelWidths = [];
		var labelYs = [];
		for(var j=0;j<labelSplit.length;++j){
			// half the width
			labelWidths.push(ctx.measureText(labelSplit[j]).width/2)
			// 12 pt for each line, minus some to put the first line higher.
			labelYs.push((12*j) - (6 * (labelSplit.length/2))+3);
		}
		
		network_nodes.update({
		  id: ids[i], 
		  labelSplit: labelSplit,
		  labelWidths: labelWidths,
		  labelYs: labelYs,
		  color : colourScheme[nx.c],
		  size: {'p':24,'d':24,'g':48}[nx.type]
		})
	}

	
	network.on("stabilizationProgress", function(params) {
		var maxWidth = 496;
		var minWidth = 20;
		var widthFactor = params.iterations/params.total;
		var width = Math.max(minWidth,maxWidth * widthFactor);

		document.getElementById('bar').style.width = width + 'px';
		document.getElementById('text').innerHTML = Math.round(widthFactor*100) + '%';
	});
	network.once("stabilizationIterationsDone", function() {
		document.getElementById('text').innerHTML = '100%';
		document.getElementById('bar').style.width = '496px';
		document.getElementById('loadingBar').style.opacity = 0;
		// really clean the dom element
		setTimeout(function () {document.getElementById('loadingBar').style.display = 'none';}, 500);
	});
	
	network.on( 'click', networkClicked);


}


nodeShapeRenderer = function({ ctx, x, y, state: { selected, hover }, style, label }) {

    const r = style.size;
	const drawNode = () => {
	  ctx.strokeStyle = style.borderColor;
	  ctx.beginPath();
	  ctx.moveTo(x + r, y);
	  for (let i = 1; i < 6; i++) {
		ctx.lineTo(x + r * Math.cos(HexAngle * i), y + r * Math.sin(HexAngle * i));
	  }
	  ctx.closePath();
	  ctx.save();
	  ctx.fillStyle = style.color;
	  ctx.fill(); 
	  ctx.stroke();
	  ctx.restore();
	  
	  //ctx.font = "normal 14px garamond";
      ctx.font = "normal 12px garamond";

	  ctx.fillStyle = 'black';  	  
  	  nx = network_nodes.get(label);
  	  lx = nx.labelSplit;
	  for(var i=0;i<lx.length;++i){
	  	ctx.fillText(lx[i],x-nx.labelWidths[i], y + nx.labelYs[i])
	  }
	}
	return {
	  drawNode, 
	  nodeDimensions: { width: 2*r, height: 2*r }
	} 
 
}
   
networkClicked = function(properties) {
	console.log(properties)
	var ids = properties.nodes;
	if(properties.nodes.length==1){
		nodeID = properties.nodes[0]
		var nx = network_nodes.get(nodeID);
		if(nx.type=="p" || nx.type=="d"){
			makePlayerContent(nodeID);
		} else if(nx.type=="g"){
			makeShowContent(nodeID)
		}
	} else if(properties.edges.length==1){
		makeEdgeContent(properties.edges[0])
	} else {
		infoTitle.html(defaultTitle);
		infoContent.html(defaultMessage);
	}
	
}

makeShowContent = function(nodeId){
	var nx = network_nodes.get(nodeID);
	
	var title = nx.id;
	if(nx.link){
		if(nx.link!=""){
			title = '<a target="_blank" href="' + nx.link + '">' + nx.id + '</a>';
		}
	}
	infoTitle.html('<h2>'+ title + '</h2>');
	
	var edges = network.getConnectedEdges(nodeID);
	
	var players = [];
	var guests = [];
	
	for(var i=0;i<edges.length;++i){
		var edge = network_edges.get(edges[i]);
		var person = edge.from;
		if(person==nodeId){
			person = edge.to;
		}
		if(edge.role=="d"){
			person += " (DM)"
		}
		if(edge.role=="g"){
			guests.push(person);
		} else{
			players.push(person);
		}	
	}
	out = "<p><b>Players:</b> " + players.join(", ")+".</p>";
	if(guests.length>0){
		out += "<p><b>Guests:</b> " + guests.join(", ") +".</p>";
	}
	
	infoContent.html(out);
	
	infoTitle.fadeIn();
	infoContent.fadeIn();

}

makeEdgeContent = function(edgeId){
	console.log("HERE")
	infoTitle.hide();
	infoContent.hide();
	
	edge = network_edges.get(edgeId);
	
	if(edge.role=="o"){
	
		infoTitle.html('<h2>'+edge.from + " & "+edge.to+'</h2>');
	
		showLinks = []
		shows = edge.show.split(";");
		urls = edge.link.split(";");
		for(var i=0;i<shows.length;++i){
			showLinks.push('<a target="_blank" href="'+urls[i] + '">'+shows[i]+'</a>')
		}
	
		var tx = '<b>Played together in:</b> ' + showLinks.join(", ")+"."
	
		infoContent.html(tx);
	} else{
		// edge is membership of show
		player = network_nodes.get(edge.from);
		show = network_nodes.get(edge.to);
		// swap if the wrong way around
		if(player.type=="g"){
			player = network_nodes.get(edge.to);
			show = network_nodes.get(edge.from);
		}
		showLink = show.id;
		if(edge.link){
			if(edge.link!=""){
				showLink = '<a target="_blank" href="'+edge.link + '">' + show.id + '</a>'
			}
		}
		infoTitle.html('<h2>'+player.id + ' plays for '+ showLink+'</h2>');
		infoContent.html("")
	}
	
	infoTitle.fadeIn();
	infoContent.fadeIn();
	
}
	
makePlayerContent = function(nodeId){

	infoTitle.hide();
	infoContent.hide();
	
	infoTitle.html("<h2>"+nodeId+"</h2>");

	var cNodes = network.getConnectedNodes(nodeId);
	
	var coPlayers = [];
	var groups = [];
	
	for(var i=0;i<cNodes.length;++i){
		cNode = network_nodes.get(cNodes[i]);
		if(cNode.type=="g"){
			groups.push(cNodes[i])
		} else{
			coPlayers.push(cNodes[i])
		}
	}

	infoContent.html("");

	if(groups.length>0){
		var t1 = document.createElement("p");
		t1.innerHTML = "<b>Plays with groups:</b> " +
				'<span id="groupListSpan" class="groupList"></span>';
//				groups.join(", ") + ".";
		infoContent.append(t1);
		for(var i =0;i<groups.length;++i){
			var glink = document.createElement("a");
			glink.id = groups[i]
			glink.innerHTML = groups[i];
			glink.href = "#";
			glink.onclick = showGroup;
			infoContent.append(glink);
			if(i<(groups.length-1)){
				comma = document.createElement("span");
				comma.innerHTML = ", ";
				infoContent.append(comma);
			} else{
				fs = document.createElement("span");
				fs.innerHTML = ".";
				infoContent.append(fs);
			}
			
		}
	}
	
	if(coPlayers.length>0){
		var t2 = document.createElement("p");
		t2.innerHTML = "<b>Has played with:</b> " +
			'<span class="playerList">' +
			coPlayers.join(", ") + "." + 
			'</span>';
		infoContent.append(t2);
	}
	
	infoTitle.fadeIn();
	infoContent.fadeIn();

}

showGroup = function(px){
	console.log(px.srcElement.id);
	var nx = network_nodes.get(px.srcElement.id);
	var link = nx.link;
	console.log(link);
	return(false);
}

showLinkBetweenPlayers = function(px){
	fromPlayer = px.srcElement.fromPlayer;
	toPlayer = px.srcElement.fromPlayer;
	connections = getEdgeBetweenNodes(fromPlayer,toPlayer);

	linkContent.html("")
	for(var i=0;i<connections.length;++i){
		var lx = connections[i].link;
		var a = document.createElement("a");
		a.href = lx;
		a.innerHTML = 
		linkContent.append()
	}
}

function getEdgeBetweenNodes(node1,node2) {
    return network_edges.get().filter(function (edge) {
        return (edge.from === node1 && edge.to === node2 )|| (edge.from === node2 && edge.to === node1);
    });
};




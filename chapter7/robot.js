// These are the places we can go to from a given place  we try to visualize this
// it forms a graph
const roads = [
	"Alice's House-Bob's House", "Alice's House-Cabin",
	"Alice's House-Post Office", "Bob's House-Town Hall",
	"Daria's House-Ernie's House", "Daria's House-Town Hall",
	"Ernie's House-Grete's House", "Grete's House-Farm",
	"Grete's House-Shop", "Marketplace-Farm",
	"Marketplace-Post Office", "Marketplace-Shop",
	"Marketplace-Town Hall", "Shop-Town Hall"
];

// This function creates a graph
function buildGraph(edges) {
	// We initialise a datastructure that represents the graph
	// Here we set the prototype to null so we don't inherit any
	// properties from the the papa Object
	// When the goal is to create datastructures that represent something
	// in the real world it is typically common to use objects or structs, enums e.t.c

	let graph = Object.create(null)

	// I am guessing that this function adds and edge to the graph
	// but more importantly how does it do so?
	function addEdge(from, to) {
		// Well it looks at the graph and checks if the vertex we 
		// want to add is already present if it is we add an adjacent vertex(to)

		// from here is an array the name(from) represents the current vertex and the values in it represent
		// the adjacent vertices(where we can go to) hence the name (to)

		if (from in graph) {
			// We push the corresponding edge into the from array
			graph[from].push(to);
		}
		else {
			// If the current vertex(from) doesn't exist we create it and add the adjacent vertex(to) it to the graph
			graph[from] = [to];
		}
	}
	// by the "-" character and assign it to from and to 
	// then we add the edges to our datastructure that we previously defined 
	// with our methods that we talked about earlier
	for (let [from, to] of edges.map(r => r.split("-"))) {
		addEdge(from, to);

		// We add both edges in both ways as it is possible 
		// to go in both directions, this is not an directed graph
		// but an undirected one
		addEdge(to, from);
	}
	// We return our graph datastructure
	return graph;
}

// graph should hold our newly created graph datastructure
const graph = buildGraph(roads)


class villageState {

	// Initialise a village object with two fields
	// One for the location and one for the parcels remaining
	constructor(place, parcel) {
		this.parcel = parcel;// This is vector of objects that comprise of a destination and the place the package currently is 
		this.place = place; // I think this is where the robot is 
	}

	// Everytime we perform and action and want to update the village 
	// state we call this method, it returns a new village struct
	// A very functional approach that doesn't have side effects

	// It takes a destination as a parameter but I am not really sure what type it represents
	// is it a vector? is it an object? It's a string
	move(destination) {
		// if the newly created graph that we created in the global scope 
		// we check the name of the vertex and then check the values in it 
		// if there is a location that is not there we return early
		// returning the implicit object in other words we haven't moved anywhere. 
		// It is not possible to move from the vertex to the destination
		if (!graph[this.place].includes(destination)) {
			return this
		}
		// otherwise we ...
		else {
			//parcels is a vector of objects specifically {place: , destination}
			//where place represents the current locationi of the package
			//and address represents where the package is supposed to go


			// We need to create a new parcel object when we move 
			// as we are not manipulating internal state
			let parcels = this.parcel.map(p => {
				//if the current place of the package is not the same as the location of the robot
				//don't move the package upon next
				if (p.place != this.place) {
					// we return the package unchanged
					return p
				}
				// other wise we return a new parcels object
				// that has the destination that we are going to as the location
				return { place: destination, address: p.address };

				// then we filter all the members of the parcel object that are not
				// equal to the address or in simple terms we filter the packages that have arrived

			}).filter(p => p.place != p.address)

			// We return a new village state with the same destination 
			// but different package locations
			return new villageState(destination, parcels)
		}
	}
}



function runRobot(state, robot, memory) { //Idg what this does
	//Now I understand what it does
	//First of all we have an infinite loop that keeps on looping
	//this represents that the robot is delivering parcels
	//the only time the robot should stop working is when it has finished delivering all the parcels
	//i.e when there are no parcels left but then why not use a while loop? hmmmm, well we want to still keep track of the 
	//number of deliveries that we have made
	// we then decide on where to go and the move there.
	for (let turn = 0; ; turn++) {

		//We check is there are any parcels left if there are none we return early
		if (state.parcel.length == 0) {
			console.log(`Done in ${turn} turns`)
			break;
		}
		// We decide on where to go
		// How do we decide on where to go hmmmmmm see below
		let action = robot(state, memory)// This returns an object that has a direction we want to go to and memory

		// we move to the decided location and create a new villageState representing the new state we have moved to
		state = state.move(action.direction)

		// we save the previous location we have moved to memory
		memory = action.memory
		console.log(`Moved to ${action.direction}`)
	}
}


function randomPick(array) {
	let object = array[Math.floor(Math.random() * array.length)];
	return object;
}

function robot(state, memory) {
	// the simplest way we could make this work would be to pick a random location
	// and go there
	//It picks a random state to go to
	return { direction: randomPick(graph[state.place]) }
}


// Alright I think I have an understanding of how the state works
// But now we need to initialise a given state and we don't have any methods on that do that
// except for the constructor, and we would  have to do most of the work

// another way to create a lambda
// This function creates random parcel delivery locations
villageState.random = function(parcelcount = 5) {
	let parcels = []; // We create an empty parcel array .. remember parcel is an array of objects comprising of destination and current location

	// we loop through each parcel object and 
	for (let i = 0; i < parcelcount; i++) {
		// we pick a random location from all places in the graph
		let address = randomPick(Object.keys(graph));
		let place;
		do {
			place = randomPick(Object.keys(graph))
		} while (place == address);// It should pick two random locations, if they are equal to each other, we pick again

		// I am guessing we add this to the parcel object and we do it for as many times as there as the parcel count
		parcels.push({ place: place, address: address })
	}
	return new villageState("Post Office", parcels);
}

runRobot(villageState.random(), robot)


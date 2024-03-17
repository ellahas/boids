const max_dist = 50
const velocity = 4
const align_strength = 1
const inv_coh_strength = 100
const sep_strength = 15
const N_swarm = 200
let counter = 0

let Scene = {
	w : 600, h : 600, swarm : [],
	neighbours( x ){
		let r = []
		for( let p of this.swarm ){
			if( dist( p.pos.x, p.pos.y, x.pos.x, x.pos.y ) <= max_dist ){
				r.push( p )
			}
		}
		return r
	}
}

class Particle {
	constructor(){
		this.pos = createVector( random(0,Scene.w), random(0,Scene.h) )
		this.dir = p5.Vector.random2D()
	}
	wrap(){
		if( this.pos.x < 0 ) this.pos.x += Scene.w
		if( this.pos.y < 0 ) this.pos.y += Scene.h
		if( this.pos.x > Scene.w ) this.pos.x -= Scene.w
		if( this.pos.y > Scene.h ) this.pos.y -= Scene.h

	}
	draw(){
		let theta = this.dir.heading() + radians(90);
        fill(0);
        stroke(200);
        push();
        translate(this.pos.x, this.pos.y);
        rotate(theta);
        beginShape();
        vertex(0, -4 * 2);
        vertex(-4, 4 * 2);
        vertex(4, 4 * 2);
        endShape(CLOSE);
        pop();
	}
	step(){
		let N = Scene.neighbours( this ), 
			avg_sin = 0, avg_cos = 0,
			avg_p = createVector( 0, 0 ),
			avg_d = createVector( 0, 0 )
		for( let n of N  ){
			avg_p.add( n.pos )
			if( n != this ){
				let away = p5.Vector.sub( this.pos, n.pos )
				away.div( away.magSq() ) 
				avg_d.add( away )
			}
			avg_sin += Math.sin( n.dir.heading() ) / N.length
			avg_cos += Math.cos( n.dir.heading() ) / N.length
		}
		avg_p.div( N.length ); avg_d.div( N.length )
		let avg_angle = Math.atan2( avg_cos, avg_sin )
		avg_angle += Math.random()*0.5 - 0.25
		this.dir = p5.Vector.fromAngle( avg_angle )
        this.dir.mult( align_strength )
		let cohesion = p5.Vector.sub( avg_p, this.pos )
		cohesion.div( inv_coh_strength )
		this.dir.add( cohesion )
        avg_d.mult( sep_strength )
		this.dir.add( avg_d )
        this.dir.normalize()
        this.dir.mult( velocity )
		this.pos.add( this.dir )
		this.wrap()
	}
}


function nearest_neighbor(p){
    N = Scene.neighbours(p)
    let shortest_dist = Infinity
    if (N.length > 1){
    for ( let n of N  ) {
      if( n != p )
{      let away = p5.Vector.sub( p.pos, n.pos )
      if (mag(away.x, away.y) < shortest_dist) {
        shortest_dist = mag(away.x, away.y)
      }}
    } }
    else {
      for ( let n of Scene.swarm  ) {
        if( n != p )
{      let away = p5.Vector.sub( p.pos, n.pos )
      if (mag(away.x, away.y) < shortest_dist) {
        shortest_dist = mag(away.x, away.y)
      }}
    }
}
    return shortest_dist
}



function setup(){
	createCanvas( Scene.w, Scene.h )
	for( let _ of Array(N_swarm) ){
		Scene.swarm.push( new Particle() )
	}
}

function draw(){
    if (counter == 0) {
      O_writer = createWriter("O_file.txt")
      dist_writer = createWriter("dist_file.txt")
    }
	background( 220 )
    let O_vec = createVector( 0, 0 )
    let distances = []
    if (counter < 300) {
	for( let p of Scene.swarm ){
		p.step()
		p.draw()
        O_vec.add( p.dir.normalize() )
        let nearest = nearest_neighbor(p)
        distances.push(nearest)
	}
    counter += 1
    O = mag(O_vec.x, O_vec.y) / N_swarm
    O_writer.write([O])
    O_writer.write(["\n"])
    dist_writer.write([distances])
    dist_writer.write(["\n"])
    }
    else {
      for( let p of Scene.swarm ){
		p.draw()
	}
    if (counter == 300) {
      O_writer.close()
      dist_writer.close()
    }
    }
}
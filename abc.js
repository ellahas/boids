const max_dist = 50
const velocity = 4
const N_swarm = 15
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
fill( 0 )
ellipse( this.pos.x, this.pos.y, 5, 5 )
}
step(align_strength, inv_coh_strength, sep_strength){
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

function setup(){
for( let _ of Array(N_swarm) ){
Scene.swarm.push( new Particle() )
}
    let theta_writer = createWriter("thetas_06.txt")
    let O_writer = createWriter("O_over_generations_06.txt")
    ABC(0.6, 20, 5, [0.1, 10, 1.5], [1, 100, 15], [1, 0.8, 0.5, 0.3, 0.1, 0.05], theta_writer, O_writer)
    theta_writer.close()
    O_writer.close()
}

function randomNormal(mean, std){
  // box-muller transform (source: https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve)
    const u = 1 - Math.random()
    const v = Math.random()
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v )
    return z * std + mean
}

function randomChoice(thetas) {
    index = int(random() * thetas.length)
    return index
}

function ABC(target, N, T, Sigma, prior_means, epsilons, theta_writer, O_writer){
    let thetas_a = []
    let thetas_c = []
    let thetas_s = []
    let O = 0
    while ( thetas_a.length < N) {
        let align_strength = randomNormal(prior_means[0], prior_means[0]/2)
        let inv_coh_strength = randomNormal(prior_means[1], prior_means[1]/2)
        let sep_strength = randomNormal(prior_means[2], prior_means[2]/2)
        let O = 0
        for (let i = 0; i < 300; i++) {
          O = step(align_strength, inv_coh_strength, sep_strength)
        }
        if ( O > target - epsilons[0] && O < target + epsilons[0] ) {
          thetas_a.push(align_strength)
          thetas_c.push(inv_coh_strength)
          thetas_s.push(sep_strength)
          O_writer.write(O)
          O_writer.write(",")
        }
    }
    O_writer.write("\n")
    theta_writer.write(thetas_a)
    theta_writer.write("\n")
    theta_writer.write(thetas_c)
    theta_writer.write("\n")
    theta_writer.write(thetas_s)
    theta_writer.write("\n")
    for (let i = 0; i < T; i++) {
      var new_thetas_a = []
      var new_thetas_c = []
      var new_thetas_s = []
      while ( new_thetas_a.length < N) {
        let index = randomChoice(thetas_a)
        let align_strength = thetas_a[index]
        let inv_coh_strength = thetas_c[index]
        let sep_strength = thetas_s[index]
        align_strength += randomNormal(0, Sigma[0])
        inv_coh_strength += randomNormal(0, Sigma[1])
        sep_strength += randomNormal(0, Sigma[2])
        for (let j = 0; j < 300; j++) {
          O = step(align_strength, inv_coh_strength, sep_strength)
        }
        if ( O > target - epsilons[i+1] && O < target + epsilons[i+1] ) {
          new_thetas_a.push(align_strength)
          new_thetas_c.push(inv_coh_strength)
          new_thetas_s.push(sep_strength)
          O_writer.write(O)
          O_writer.write(",")
        }
    }
      O_writer.write("\n")
      thetas_a = new_thetas_a
      thetas_c = new_thetas_c
      thetas_s = new_thetas_s
      theta_writer.write(thetas_a)
      theta_writer.write("\n")
      theta_writer.write(thetas_c)
      theta_writer.write("\n")
      theta_writer.write(thetas_s)
      theta_writer.write("\n")
    }
}

function step(align_strength, inv_coh_strength, sep_strength){
    let O_vec = [0, 0]
    let O = 0
for( let p of Scene.swarm ){
p.step(align_strength, inv_coh_strength, sep_strength)
        let dir_norm = p.dir.normalize()
        O_vec[0] += dir_norm.x
        O_vec[1] += dir_norm.y
    O = mag(O_vec[0], O_vec[1]) / N_swarm
}
    return O
}
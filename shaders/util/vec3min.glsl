vec3 minx(vec3 a, vec3 b){
    return mix(a, b, step(b.x, a.x));
}
vec3 miny(vec3 a, vec3 b){
    return mix(a, b, step(b.y, a.y));
}
vec3 minz(vec3 a, vec3 b){
    return mix(a, b, step(b.z, a.z));
}
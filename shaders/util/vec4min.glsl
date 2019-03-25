vec4 minx(vec4 a, vec4 b){
    return mix(a, b, step(b.x, a.x));
}
vec4 miny(vec4 a, vec4 b){
    return mix(a, b, step(b.y, a.y));
}
vec4 minz(vec4 a, vec4 b){
    return mix(a, b, step(b.z, a.z));
}
vec4 minw(vec4 a, vec4 b){
    return mix(a, b, step(b.w, a.w));
}
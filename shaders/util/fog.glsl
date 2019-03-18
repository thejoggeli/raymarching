// float fog_b = 0.01;

vec3 applyFog(in vec3  rgb, in float distance){
    float fogAmount = 1.0 - exp(-distance*fog_b);
    vec3  fogColor  = vec3(0,0,0);
    return mix(rgb, fogColor, fogAmount);
}
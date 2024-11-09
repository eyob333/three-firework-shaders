
uniform vec2 uResolution;
uniform float uSize;

void main(){

    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    // final position
    gl_Position =  projectionPosition;
    gl_PointSize = uSize * uResolution.y;
    gl_PointSize *= 1. / - viewPosition.z ;
}
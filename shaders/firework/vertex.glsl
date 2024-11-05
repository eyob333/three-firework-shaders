
void main(){

    vec4 modelPosition = modelMatrix * vec4(position, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    // final position
    gl_Position =  projectionPosition;
    gl_PointSize = 20. ;
    gl_PointSize *= 1. / - viewPosition.z ;
}
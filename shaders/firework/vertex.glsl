
uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

attribute float aSizes;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main(){

    vec3 newPostion = position;

    // explosion
    float explostionProgress = remap( uProgress, .0, .1, .0, 1. );
    explostionProgress = clamp(explostionProgress, .0, 1.);
    explostionProgress = 1. - pow( 1. - explostionProgress, 3.);
    newPostion *= explostionProgress;

    // falling
    float fallingProgress = remap(uProgress, 0.1, 1.0, 0., 1.);
    fallingProgress = clamp( fallingProgress, .0, 1.);
    fallingProgress = 1. - pow(1. -fallingProgress,  3.);
    newPostion.y -= fallingProgress * 0.2;

    // scaling

    // Matrix
    vec4 modelPosition = modelMatrix * vec4(newPostion, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    // final position
    gl_Position =  projectionPosition;
    gl_PointSize = uSize * uResolution.y * aSizes ;
    gl_PointSize *= 1. / - viewPosition.z ;
}
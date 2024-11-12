
uniform vec2 uResolution;
uniform float uSize;
uniform float uProgress;

attribute float aSizes;
attribute float aTimeMultiplayer;

float remap(float value, float originMin, float originMax, float destinationMin, float destinationMax)
{
    return destinationMin + (value - originMin) * (destinationMax - destinationMin) / (originMax - originMin);
}

void main(){
    float progress = uProgress * aTimeMultiplayer;
    vec3 newPostion = position;

    // explosion
    float explostionProgress = remap( progress, .0, .1, .0, 1. );
    explostionProgress = clamp(explostionProgress, .0, 1.);
    explostionProgress = 1. - pow( 1. - explostionProgress, 3.);
    newPostion *= explostionProgress;

    // falling
    float fallingProgress = remap(progress, 0.1, 1.0, 0., 1.);
    fallingProgress = clamp( fallingProgress, .0, 1.);
    fallingProgress = 1. - pow(1. -fallingProgress,  3.);
    newPostion.y -= fallingProgress * 0.2;

    // scaling
    float sizeOpeningProgress = remap( progress, .0, .125, .0, 1.);
    float sizeClosingProgress = remap( progress, .125, 1., 1., 0.);
    float sizeProgress = min( sizeClosingProgress, sizeOpeningProgress);
    sizeProgress = clamp(sizeProgress, 0., 1.);

    // twinkling
    float twinklingProgress = remap( progress, .2, .8, 0., 1.) ;
    twinklingProgress = clamp( twinklingProgress, 0., 1.);
    float sizeTwinkling = sin( progress * 30.) * .5 + .5 ;
    sizeTwinkling = 1. - sizeTwinkling * twinklingProgress;


    // Matrix
    vec4 modelPosition = modelMatrix * vec4(newPostion, 1.);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    // final position
    gl_Position =  projectionPosition;

    // final size
    gl_PointSize = uSize * uResolution.y * aSizes * sizeProgress * sizeTwinkling;
    gl_PointSize *= 1. / - viewPosition.z ;
    
    if ( gl_PointSize < 1.){
        gl_Position = vec4( 9999.9);
    }
}
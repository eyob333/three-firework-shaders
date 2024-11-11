
uniform sampler2D uTexture;
uniform vec3 uColor;

void main(){

    // texture

    float textrueAlpha = texture(uTexture, gl_PointCoord).r;

    //final color
    gl_FragColor= vec4(uColor, textrueAlpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}
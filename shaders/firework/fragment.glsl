
uniform sampler2D uTexture;

void main(){

    // texture

    vec4 textrueColor = texture(uTexture, gl_PointCoord);

    //final color
    gl_FragColor= vec4(textrueColor);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

}